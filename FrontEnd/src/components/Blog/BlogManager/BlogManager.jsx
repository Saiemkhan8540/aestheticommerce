import React, { useState } from "react";
import BlogForm from "../BlogForm/BlogForm.jsx";
import BlogList from "../BlogList/BlogList.jsx";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Handle blog add or update
  const handleAddOrUpdate = (blog) => {
    setBlogs((prev) =>
      prev.some((b) => b.id === blog.id)
        ? prev.map((b) => (b.id === blog.id ? blog : b))
        : [...prev, blog]
    );
    setSelectedBlog(null);  // Clear selected blog after saving
  };

  // Handle blog deletion
  const handleDelete = (id) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  // Select a blog for editing
  const handleSelectBlog = (blog) => {
    setSelectedBlog(blog);
  };

  // Clear selected blog
  const clearEdit = () => {
    setSelectedBlog(null);
  };

  return (
    <>
      {/* Blog Form always visible */}
      <BlogForm
        onSubmit={handleAddOrUpdate}
        selectedBlog={selectedBlog}
        clearEdit={clearEdit}
      />

      {/* Blog List */}
      <BlogList
        blogs={blogs}
        onDelete={handleDelete}
        onEdit={handleSelectBlog}
      />
    </>
  );
};

export default BlogManager;