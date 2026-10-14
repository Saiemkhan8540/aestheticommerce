import React from "react";
import LatestBlogSection from "../Blog/BlogHome/LatestBlogSection";
import "./Blogsection.css";

const blogs = [
  {
    id: 1,
    image: "https://plus.unsplash.com/premium_photo-1684445035187-c4bc7c96bc5d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // replace with your real images
    category: "Designing",
    title: "7 Steps to Make a Comfy Bedroom",
    desc: "Want to grab your audience's attention? Check the proven blog introduction examples..."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Designing",
    title: "7 Steps to Make a Comfy Bedroom",
    desc: "Want to grab your audience's attention? Check the proven blog introduction examples..."
  },
  {
    id: 3,
    image: "https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Designing",
    title: "How to read a Book in a Day or Two",
    desc: "Want to grab your audience's attention? Check the proven blog introduction examples..."
  }
];

const BlogSection = () => {
  return (
    <section className="blog-section">
      <LatestBlogSection />
    </section>
  );
};

export default BlogSection;