/**
 * One-time migration: copy public Cloudinary URLs stored in MongoDB to S3
 * and rewrite document fields to CloudFront URLs.
 *
 * Handles disabled Cloudinary clouds (HTTP 401 "cloud_name X is disabled")
 * by skipping those URLs, keeping the original DB value, and reporting them.
 *
 * Usage:
 *   node scripts/migrateCloudinaryToS3.js           # apply changes
 *   node scripts/migrateCloudinaryToS3.js --dry-run # log only
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const uploadToS3 = require("../utils/s3Upload");

const Product = require("../models/product.model");
const User = require("../models/user.model");
const Seller = require("../models/seller.model");
const Blog = require("../models/blog.model");
const Banner = require("../models/banner.model");

const dryRun = process.argv.includes("--dry-run");

const stats = {
  attempted: 0,
  migrated: 0,
  skipped: 0,
  failed: 0,
};

/** @type {Map<string, true>} cloud names known to be disabled */
const disabledClouds = new Map();

/** @type {Array<{ url: string, reason: string, collection: string, docId: string, field: string }>} */
const failures = [];

function isCloudinaryUrl(url) {
  return typeof url === "string" && /cloudinary\.com/i.test(url);
}

function cloudNameFromUrl(url) {
  try {
    // https://res.cloudinary.com/<cloud_name>/...
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    // pathname like /dymictnzv/image/upload/... OR host embeds cloud — prefer host path
    const host = new URL(url).hostname; // res.cloudinary.com
    if (host.includes("cloudinary.com") && parts[0]) return parts[0];
  } catch {
    // ignore
  }
  const match = String(url).match(/res\.cloudinary\.com\/([^/]+)/i);
  return match ? match[1] : null;
}

function guessContentType(url) {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function fileNameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const base = path.basename(pathname) || "file";
    return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  } catch {
    return "file";
  }
}

function recordFailure({ url, reason, collection, docId, field }) {
  failures.push({ url, reason, collection, docId: String(docId), field });
  const cloud = cloudNameFromUrl(url);
  const isDisabled =
    /disabled/i.test(reason) || (cloud && disabledClouds.has(cloud));
  if (isDisabled) stats.skipped += 1;
  else stats.failed += 1;
  console.warn(
    `[skip] ${collection} ${docId} ${field}: ${reason} | ${url}`,
  );
}

/**
 * @returns {Promise<{ ok: true, url: string } | { ok: false, reason: string, unchanged: true }>}
 */
async function migrateUrl(url, folder) {
  if (!isCloudinaryUrl(url)) {
    return { ok: true, url };
  }

  stats.attempted += 1;

  const cloud = cloudNameFromUrl(url);
  if (cloud && disabledClouds.has(cloud)) {
    return {
      ok: false,
      unchanged: true,
      reason: `cloud_name ${cloud} is disabled (cached)`,
    };
  }

  if (dryRun) {
    console.log(`[dry-run] would migrate ${url} -> folder ${folder}`);
    return { ok: true, url };
  }

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    return {
      ok: false,
      unchanged: true,
      reason: `network error: ${err.message}`,
    };
  }

  const contentTypeHeader = response.headers.get("content-type") || "";

  if (!response.ok || contentTypeHeader.includes("text/plain")) {
    const bodyText = (await response.text().catch(() => "")).trim();

    if (
      response.status === 401 ||
      /is disabled/i.test(bodyText) ||
      /cloud_name\s+\S+\s+is disabled/i.test(bodyText)
    ) {
      const disabledMatch = bodyText.match(
        /cloud_name\s+(\S+)\s+is disabled/i,
      );
      const disabledName = disabledMatch?.[1] || cloud;
      if (disabledName) disabledClouds.set(disabledName, true);
      return {
        ok: false,
        unchanged: true,
        reason:
          bodyText || `HTTP ${response.status}: cloudinary cloud disabled`,
      };
    }

    return {
      ok: false,
      unchanged: true,
      reason: `Failed to download: HTTP ${response.status}${bodyText ? ` (${bodyText.slice(0, 120)})` : ""}`,
    };
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = contentTypeHeader || guessContentType(url);

  try {
    const result = await uploadToS3(buffer, folder, {
      contentType,
      originalName: fileNameFromUrl(url),
    });
    stats.migrated += 1;
    return { ok: true, url: result.secure_url };
  } catch (err) {
    return {
      ok: false,
      unchanged: true,
      reason: `S3 upload failed: ${err.message}`,
    };
  }
}

async function applyUrl({ url, folder, collection, docId, field }) {
  if (!isCloudinaryUrl(url)) return url;
  const result = await migrateUrl(url, folder);
  if (result.ok) {
    return result.url;
  }
  recordFailure({
    url,
    reason: result.reason,
    collection,
    docId,
    field,
  });
  return url;
}

async function migrateProducts() {
  const products = await Product.find({
    $or: [
      { images: { $elemMatch: { $regex: /cloudinary\.com/i } } },
      { productVideo: { $regex: /cloudinary\.com/i } },
      { "reviews.photos": { $elemMatch: { $regex: /cloudinary\.com/i } } },
    ],
  });

  console.log(`Products to check: ${products.length}`);

  for (const product of products) {
    let changed = false;

    if (Array.isArray(product.images)) {
      const next = [];
      for (let i = 0; i < product.images.length; i += 1) {
        const url = product.images[i];
        const migrated = await applyUrl({
          url,
          folder: "SellerProducts",
          collection: "products",
          docId: product._id,
          field: `images[${i}]`,
        });
        if (migrated !== url) changed = true;
        next.push(migrated);
      }
      product.images = next;
    }

    if (isCloudinaryUrl(product.productVideo)) {
      const migrated = await applyUrl({
        url: product.productVideo,
        folder: "SellerProducts",
        collection: "products",
        docId: product._id,
        field: "productVideo",
      });
      if (migrated !== product.productVideo) {
        product.productVideo = migrated;
        changed = true;
      }
    }

    if (Array.isArray(product.reviews)) {
      for (let r = 0; r < product.reviews.length; r += 1) {
        const review = product.reviews[r];
        if (!Array.isArray(review.photos)) continue;
        const nextPhotos = [];
        for (let p = 0; p < review.photos.length; p += 1) {
          const url = review.photos[p];
          const migrated = await applyUrl({
            url,
            folder: "ProductReviews",
            collection: "products",
            docId: product._id,
            field: `reviews[${r}].photos[${p}]`,
          });
          if (migrated !== url) changed = true;
          nextPhotos.push(migrated);
        }
        review.photos = nextPhotos;
      }
    }

    if (changed && !dryRun) {
      await product.save();
      console.log(`Updated product ${product._id}`);
    }
  }
}

async function migrateUsers() {
  const users = await User.find({ avatar: { $regex: /cloudinary\.com/i } });
  console.log(`Users with Cloudinary avatars: ${users.length}`);

  for (const user of users) {
    const migrated = await applyUrl({
      url: user.avatar,
      folder: "avatars",
      collection: "users",
      docId: user._id,
      field: "avatar",
    });
    if (migrated !== user.avatar && !dryRun) {
      user.avatar = migrated;
      await user.save();
      console.log(`Updated user ${user._id}`);
    }
  }
}

async function migrateSellers() {
  const sellers = await Seller.find({
    $or: [
      { aadharFile: { $regex: /cloudinary\.com/i } },
      { panFile: { $regex: /cloudinary\.com/i } },
    ],
  });
  console.log(`Sellers with Cloudinary KYC: ${sellers.length}`);

  for (const seller of sellers) {
    let changed = false;

    if (isCloudinaryUrl(seller.aadharFile)) {
      const migrated = await applyUrl({
        url: seller.aadharFile,
        folder: "SellerVerification/Aadhar",
        collection: "sellers",
        docId: seller._id,
        field: "aadharFile",
      });
      if (migrated !== seller.aadharFile) {
        seller.aadharFile = migrated;
        changed = true;
      }
    }

    if (isCloudinaryUrl(seller.panFile)) {
      const migrated = await applyUrl({
        url: seller.panFile,
        folder: "SellerVerification/PAN",
        collection: "sellers",
        docId: seller._id,
        field: "panFile",
      });
      if (migrated !== seller.panFile) {
        seller.panFile = migrated;
        changed = true;
      }
    }

    if (changed && !dryRun) {
      await seller.save();
      console.log(`Updated seller ${seller._id}`);
    }
  }
}

async function migrateBlogs() {
  const blogs = await Blog.find({ image: { $regex: /cloudinary\.com/i } });
  console.log(`Blogs with Cloudinary images: ${blogs.length}`);

  for (const blog of blogs) {
    const migrated = await applyUrl({
      url: blog.image,
      folder: "Blogs",
      collection: "blogs",
      docId: blog._id,
      field: "image",
    });
    if (migrated !== blog.image && !dryRun) {
      blog.image = migrated;
      await blog.save();
      console.log(`Updated blog ${blog._id}`);
    }
  }
}

async function migrateBanners() {
  const banners = await Banner.find({
    imageUrl: { $regex: /cloudinary\.com/i },
  });
  console.log(`Banners with Cloudinary images: ${banners.length}`);

  for (const banner of banners) {
    const migrated = await applyUrl({
      url: banner.imageUrl,
      folder: "Banners",
      collection: "banners",
      docId: banner._id,
      field: "imageUrl",
    });
    if (migrated !== banner.imageUrl && !dryRun) {
      banner.imageUrl = migrated;
      await banner.save();
      console.log(`Updated banner ${banner._id}`);
    }
  }
}

function writeFailureReport() {
  if (!failures.length) return null;
  const outPath = path.join(
    __dirname,
    `migrate-s3-failures-${Date.now()}.json`,
  );
  const payload = {
    generatedAt: new Date().toISOString(),
    disabledClouds: [...disabledClouds.keys()],
    stats,
    failures,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  return outPath;
}

async function main() {
  const mongoUri = process.env.DB_CONNECT;
  if (!mongoUri) {
    throw new Error("DB_CONNECT is not defined in .env");
  }

  console.log(dryRun ? "Running in DRY-RUN mode" : "Running migration");
  await mongoose.connect(mongoUri);

  await migrateProducts();
  await migrateUsers();
  await migrateSellers();
  await migrateBlogs();
  await migrateBanners();

  await mongoose.disconnect();

  console.log("\n--- Migration summary ---");
  console.log(`Attempted: ${stats.attempted}`);
  console.log(`Migrated:  ${stats.migrated}`);
  console.log(`Skipped (disabled/unavailable): ${stats.skipped}`);
  console.log(`Failed (other): ${stats.failed}`);
  if (disabledClouds.size) {
    console.log(
      `Disabled Cloudinary clouds: ${[...disabledClouds.keys()].join(", ")}`,
    );
  }

  const reportPath = writeFailureReport();
  if (reportPath) {
    console.log(`Failure report written to: ${reportPath}`);
    console.log(
      "Skipped/disabled URLs were left unchanged in MongoDB (re-upload those assets manually or re-run after Cloudinary is restored).",
    );
  }

  console.log("Done.");
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
