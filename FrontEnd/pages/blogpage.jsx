import React, { useState } from "react";
import Navbar from "../src/components/Navbar/Navbar.jsx";
import BlogHome from "../src/components/Blog/BlogHome/BlogHome.jsx";
import BlogForm from "../src/components/Blog/BlogForm/BlogForm.jsx"; // <-- Import your form
import Newsletter from "../src/components/NewsletterSection/Newsletter.jsx";
import Footersec from "../src/components/Footersection/Footersection.jsx";
import LatestBlogSection from "../src/components/Blog/BlogHome/LatestBlogSection.jsx";
import SEO from "../src/utils/SEO.jsx";

const Blog = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <SEO
        title="Blog | Art, Craft & Aesthetic Inspiration | Aestheticommerce"
        description="Read our latest blogs on aesthetic art, handmade crafts, painting tips, calligraphy guides and creative inspiration at Aestheticommerce."
        keywords="art blog, craft blog, aesthetic inspiration, painting tips, calligraphy guide, handmade art"
        url={`${import.meta.env.VITE_APP_URL}/blog`}
      />
      <Navbar />

      {/* Toggle between BlogHome and BlogForm */}
      {showForm ? (
        <BlogForm onBack={() => setShowForm(false)} />
      ) : (
        <BlogHome
          onCreateClick={() => setShowForm(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* These stay visible regardless */}
      <LatestBlogSection searchQuery={searchQuery} />
      <Newsletter />
      <Footersec />
    </div>
  );
};

export default Blog;
