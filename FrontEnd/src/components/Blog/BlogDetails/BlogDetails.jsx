import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './BlogDetails.css';
import SEO from '../../../utils/SEO.jsx';

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

 useEffect(() => {
  axios.get(`http://localhost:5000/users/blogs/${id}`)
    .then(res => {
      console.log("Fetched blog:", res.data);
      setBlog(res.data.blog);
    })
    .catch(err => {
      console.error("Error fetching blog:", err);
    });
}, [id]);

  if (!blog) return <div className="loading">Loading...</div>;

   const shortDescription = blog.content?.length > 155
    ? blog.content.slice(0, 155) + "..."
    : blog.content;

  return (
    <>
     <SEO
        title={`${blog.title} | Aestheticommerce Blog`}
        description={shortDescription}
        image={blog.image}
        url={`${import.meta.env.VITE_APP_URL}/blogs/${id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          image: blog.image,
          author: {
            "@type": "Person",
            name: blog.author,
          },
          datePublished: blog.createdAt,
          description: shortDescription,
        }}
      />
    <div className="blog-container">
      <img 
        src={blog.image}
        alt={blog.title} 
        className="blog-image" 
      />
      <h1 className="blog-title">{blog.title}</h1>
      <p className="blog-meta">
        By <span className="blog-author">{blog.author}</span> on <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
      </p>
      <p className="blog-content">{blog.content}</p>
    </div>
    </>
  );
};

export default BlogDetails;