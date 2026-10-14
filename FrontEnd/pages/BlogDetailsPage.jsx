import React from 'react'
import Navbar from '../src/components/Navbar/Navbar'
import BackButton from '../src/components/Common/BackButton/BackButton'
import BlogDetails from '../src/components/Blog/BlogDetails/BlogDetails'
import Footersec from '../src/components/Footersection/Footersection'

const BlogDetailsPage = () => {
  return (
    <>
        <Navbar/>
        <div className="container" style={{ marginTop: '20px', padding: '0 20px' }}>
          <BackButton to="/blog" label="Back to Blogs" />
        </div>
        <BlogDetails/>
        <Footersec/>
    </>
  )
}

export default BlogDetailsPage