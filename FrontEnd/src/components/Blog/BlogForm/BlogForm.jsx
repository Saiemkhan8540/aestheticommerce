import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBlog } from "../../../Redux/blogSlice"; 
import "./BlogForm.css";

const BlogForm = ({ selectedBlog, clearEdit, onBack }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.blogs);

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedBlog) {
      setAuthor(selectedBlog.author);
      setTitle(selectedBlog.title);
      setContent(selectedBlog.content);
      setImage(selectedBlog.image);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setAuthor("");
      setTitle("");
      setContent("");
      setImage("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedBlog]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasExistingImage = Boolean(selectedBlog && selectedBlog.image && !imageFile);
    if (!author || !title || !content || (!imageFile && !hasExistingImage)) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("author", author);
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    dispatch(createBlog(formData))
      .unwrap()
      .then(() => {
        clearEdit?.(); // optional clear edit
        onBack();      // go back after successful submission
        setAuthor("");
        setTitle("");
        setContent("");
        setImage("");
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch((err) => {
        console.error("Blog submission failed", err);
      });
  };

  return (
    <div className="blog-form-container">
      <div className="blog-form-card">
        <div className="blog-form-content">
        
          {/* Back Button */}
          <button className="back-button" onClick={onBack}>
            ⬅ Back to Blog Home
          </button>

          <h1 className="blog-form-title">
            {selectedBlog ? "Edit Blog" : "Write a Blog"}
          </h1>

          {error && <p className="error-message">Error: {error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="blog-form-grid">
              <div className="blog-form-fields">
                <div className="blog-form-row">
                  <div className="blog-form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                    />
                  </div>
                  <div className="blog-form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="blog-form-group">
                  <label>Content</label>
                  <textarea
                    rows="8"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="blog-form-image-upload">
                <label>Image</label>
                <div className="image-upload-box">
                  <div className="image-preview">
                    {image ? (
                      <img src={image} alt="Preview" />
                    ) : (
                      <div className="image-placeholder">
                        <div className="circle" />
                        <div className="line" />
                      </div>
                    )}
                  </div>
                  <div className="upload-controls">
                    <p>Drag & Drop or Browse</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Browse
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="submit-button-wrapper">
              <button type="submit" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : selectedBlog
                  ? "Update Blog"
                  : "Submit Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;