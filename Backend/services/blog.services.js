const blogModel = require('../models/blog.model');


// Create a new blog
async function createBlog({ title, content, author, image }) {
  if (!title || !content || !author) {
    throw new Error('All fields are required');
  }
  const blog = await blogModel.create({
    title,
    content,
    author,
    image,
  });
  return blog;
}

// Get all blogs
async function getAllBlogs() {
  return await blogModel.find().sort({ createdAt: -1 });
}

// Get a single blog by ID
async function getBlogById(id) {
  return await blogModel.findById(id);
}

// Update a blog by ID
async function updateBlog(id, updateData) {
  return await blogModel.findByIdAndUpdate(id, updateData, { new: true });
}

// Delete a blog by ID
async function deleteBlog(id) {
  return await blogModel.findByIdAndDelete(id);
}


// Export all functions
module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};