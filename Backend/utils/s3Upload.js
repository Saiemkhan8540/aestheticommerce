const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");

const requiredEnv = [
  "S3_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "CLOUDFRONT_URL",
];

function assertConfig() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing S3 env vars: ${missing.join(", ")}`);
  }
}

let client;

function getClient() {
  assertConfig();
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

function cloudFrontBase() {
  return process.env.CLOUDFRONT_URL.replace(/\/$/, "");
}

function sanitizeFileName(name = "file") {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 120) || "file";
}

function extensionFrom({ originalName, contentType }) {
  const fromName = originalName ? path.extname(originalName) : "";
  if (fromName) return fromName.toLowerCase();

  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "application/pdf": ".pdf",
  };
  return map[contentType] || "";
}

/**
 * Upload a buffer to S3 and return a Cloudinary-compatible shape ({ secure_url }).
 * @param {Buffer} fileBuffer
 * @param {string} folder
 * @param {{ contentType?: string, originalName?: string }} [options]
 */
async function uploadToS3(fileBuffer, folder = "uploads", options = {}) {
  assertConfig();

  const { contentType = "application/octet-stream", originalName } = options;
  const ext = extensionFrom({ originalName, contentType });
  const safeName = sanitizeFileName(originalName || `file${ext}`);
  const key = `${folder.replace(/^\/|\/$/g, "")}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  return {
    secure_url: `${cloudFrontBase()}/${key}`,
    key,
  };
}

async function deleteFromS3(urlOrKey) {
  assertConfig();
  if (!urlOrKey) return;

  let key = urlOrKey;
  const base = cloudFrontBase();
  if (urlOrKey.startsWith(base)) {
    key = urlOrKey.slice(base.length).replace(/^\//, "");
  } else if (urlOrKey.startsWith("http")) {
    try {
      key = new URL(urlOrKey).pathname.replace(/^\//, "");
    } catch {
      return;
    }
  }

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );
}

module.exports = uploadToS3;
module.exports.uploadToS3 = uploadToS3;
module.exports.deleteFromS3 = deleteFromS3;
