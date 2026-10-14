import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./BannerPage.css";

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL;

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${apiBase}/api/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setBanners(response.data.banners);
      }
    } catch (error) {
      console.error("Fetch Banners Error:", error);
      toast.error("Failed to load banners");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (banner) => {
    setIsEditing(true);
    setEditingBannerId(banner._id);
    setRedirectUrl(banner.redirectUrl);
    setImagePreview(banner.imageUrl);
    setImage(null); // Reset image state so it's optional for edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingBannerId(null);
    setRedirectUrl("");
    setImagePreview("");
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !image) {
      toast.error("Please select a banner image");
      return;
    }
    if (!redirectUrl) {
      toast.error("Please enter a redirect URL");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("redirectUrl", redirectUrl);

    try {
      const token = localStorage.getItem("adminToken");
      let response;
      
      if (isEditing) {
        response = await axios.put(`${apiBase}/api/admin/banners/${editingBannerId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(`${apiBase}/api/admin/banners`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        toast.success(isEditing ? "Banner updated successfully" : "Banner created successfully");
        setRedirectUrl("");
        setImage(null);
        setImagePreview("");
        if (isEditing) cancelEdit();
        fetchBanners();
      }
    } catch (error) {
      console.error("Banner Submit Error:", error);
      toast.error(error.response?.data?.message || "Error saving banner");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `${apiBase}/api/admin/banners/${id}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Banner status updated");
        fetchBanners();
      }
    } catch (error) {
      console.error("Toggle Banner Error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(`${apiBase}/api/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Banner deleted successfully");
        if (editingBannerId === id) cancelEdit();
        fetchBanners();
      }
    } catch (error) {
      console.error("Delete Banner Error:", error);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="banner-page">
      <div className="banner-header">
        <h1>Banner Management</h1>
        <p>Manage the SaleSection banner on the homepage</p>
      </div>

      <div className="banner-content">
        <section className="banner-form-section">
          <h2>{isEditing ? "Edit Banner" : "Create New Banner"}</h2>
          <form onSubmit={handleSubmit} className="banner-form">
            <div className="form-group">
              <label>Banner Image {isEditing && "(Optional if not changing)"}</label>
              <div className="image-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  id="banner-upload"
                />
                <label htmlFor="banner-upload" className="upload-btn">
                  {imagePreview ? "Change Image" : "Select Image"}
                </label>
                {imagePreview && (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Preview" className="banner-preview-img" />
                  </div>
                )}
              </div>
              <p className="helper-text">
                Recommended: 1920x600px | Min: 1600x500px | Ratio: 16:5 or 14:3
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="redirect-url">Redirect URL</label>
              <input
                id="redirect-url"
                type="text"
                placeholder="e.g., /products?tag=gift"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Banner" : "Create Banner")}
              </button>
              {isEditing && (
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="banner-list-section">
          <h2>Existing Banners</h2>
          {fetching ? (
            <p>Loading banners...</p>
          ) : banners.length === 0 ? (
            <p className="no-data">No banners found.</p>
          ) : (
            <div className="banner-table-wrapper">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Redirect URL</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner._id}>
                      <td>
                        <img src={banner.imageUrl} alt="Banner" className="table-img" />
                      </td>
                      <td>
                        <span className="url-text" title={banner.redirectUrl}>
                          {banner.redirectUrl}
                        </span>
                      </td>
                      <td>
                        <div className="status-cell">
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={banner.isActive} 
                              onChange={() => handleToggleActive(banner._id, banner.isActive)}
                            />
                            <span className="slider round"></span>
                          </label>
                          <span className={`status-text ${banner.isActive ? "active" : "inactive"}`}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(banner.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEditClick(banner)}
                            className="edit-btn"
                            title="Edit Banner"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(banner._id)}
                            className="delete-btn"
                            title="Delete Banner"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BannerPage;
