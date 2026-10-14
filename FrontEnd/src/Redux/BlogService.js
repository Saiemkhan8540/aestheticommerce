// src/redux/slices/blogService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAllBlogs = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.tag) searchParams.set("tag", params.tag);
  const qs = searchParams.toString();
  const url = qs ? `${API_URL}/users/blogs?${qs}` : `${API_URL}/users/blogs`;
  const response = await axios.get(url);
  return response.data.blogs;
};

const getSingleBlog = async (id) => {
  const response = await axios.get(`${API_URL}/users/blogs/${id}`);
  return response.data.blog;
};

const createBlog = async (blogData) => {
  const response = await axios.post(`${API_URL}/users/blog`, blogData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.blog;
};

const blogService = {
  getAllBlogs,
  getSingleBlog,
  createBlog,
};

export default blogService;