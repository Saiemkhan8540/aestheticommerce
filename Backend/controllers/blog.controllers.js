const blogService = require('../services/blog.services');
const Blog = require('../models/blog.model');
const { validationResult } = require('express-validator');
const uploadToS3 = require('../utils/s3Upload');

//handle Blog creation
module.exports.createBlog = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(404).json({ message: "Invalid data" });
  }

  console.log(req.body);
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Title, content, and author are required' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToS3(req.file.buffer, "Blogs", {
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      });
      imageUrl = uploadResult.secure_url;
    }

    const blog = await blogService.createBlog({
      title,
      content,
      author,
      image: imageUrl,
    });

    res.status(201).json({ blog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: 'Failed to create blog', error: err.message });
  }
};

function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//handle Get all blogs (optional ?tag= slug or phrase for sidebar / nav)
exports.getBlogs = async (req, res) => {
  try {
    const { tag } = req.query;
    let filter = {};
    if (tag && typeof tag === "string" && tag.trim()) {
      const raw = tag.trim();
      const asPhrase = raw.replace(/-/g, " ").trim();
      const a = escapeRegex(asPhrase);
      const b = escapeRegex(raw);
      filter = {
        $or: [
          { tags: { $elemMatch: { $regex: new RegExp(`^${a}$`, "i") } } },
          { tags: { $elemMatch: { $regex: new RegExp(`^${b}$`, "i") } } },
        ],
      };
    }
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error while fetching blogs ❌:", error);
    res.status(500).json({ message: error.message });
  }
};


//handle Get blog by id
module.exports.getBlog = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Blog ID is required' });
  }

  const blog = await blogService.getBlogById(id);

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  res.status(200).json({ blog });
};