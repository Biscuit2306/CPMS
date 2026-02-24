import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import "../styles/student-css/achievementmodal.css";

const AchievementModal = ({
  isOpen,
  achievement = null,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    date: new Date().toISOString().split("T")[0],
    organization: "",
    credentialUrl: "",
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Categories for achievement
  const categories = [
    "Certification",
    "Award",
    "Hackathon",
    "Coding",
    "Academic",
    "Project",
    "Competition",
    "Other",
  ];

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title || "",
        description: achievement.description || "",
        category: achievement.category || "Other",
        date: achievement.date || new Date().toISOString().split("T")[0],
        organization: achievement.organization || "",
        credentialUrl: achievement.credentialUrl || "",
      });
      if (achievement.certificateImage) {
        setCertificatePreview(achievement.certificateImage);
      }
    } else {
      resetForm();
    }
  }, [achievement, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Other",
      date: new Date().toISOString().split("T")[0],
      organization: "",
      credentialUrl: "",
    });
    setCertificateFile(null);
    setCertificatePreview(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Achievement title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          certificateImage: "Only JPEG, PNG, GIF, WEBP images and PDF files are allowed",
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          certificateImage: "File size must be less than 5MB",
        }));
        return;
      }

      setCertificateFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificatePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setCertificatePreview(null);
      }

      setErrors((prev) => ({
        ...prev,
        certificateImage: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(formData, certificateFile);
  };

  if (!isOpen) return null;

  return (
    <div className="achievement-modal-overlay">
      <div className="achievement-modal-content">
        <div className="achievement-modal-header">
          <h2>{achievement ? "Edit Achievement" : "Add New Achievement"}</h2>
          <button
            className="achievement-modal-close"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="achievement-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Achievement Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., AWS Certified Developer"
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={errors.date ? "input-error" : ""}
            />
            {errors.date && <p className="error-message">{errors.date}</p>}
          </div>

          {/* Organization */}
          <div className="form-group">
            <label htmlFor="organization">Organization/Issuer</label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              placeholder="e.g., Amazon, Microsoft"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of your achievement..."
              rows="3"
            />
          </div>

          {/* Credential URL */}
          <div className="form-group">
            <label htmlFor="credentialUrl">Credential URL</label>
            <input
              type="url"
              id="credentialUrl"
              name="credentialUrl"
              value={formData.credentialUrl}
              onChange={handleInputChange}
              placeholder="https://credly.com/..."
            />
          </div>

          {/* Certificate Image Upload */}
          <div className="form-group">
            <label htmlFor="certificateImage">Certificate Image</label>
            <p className="certificate-info">
              <ImageIcon size={16} /> Upload certificate, badge, or proof image (JPEG, PNG, GIF, WEBP, PDF - Max 5MB)
            </p>

            {certificatePreview && (
              <div className="certificate-preview">
                {certificateFile?.type.startsWith("image/") ? (
                  <img src={certificatePreview} alt="Certificate preview" />
                ) : (
                  <div className="pdf-preview">
                    <ImageIcon size={48} />
                    <p>{certificateFile?.name}</p>
                  </div>
                )}
              </div>
            )}

            {!certificateFile && certificatePreview && (
              <div className="certificate-preview">
                <img
                  src={certificatePreview}
                  alt="Certificate"
                  style={{ maxWidth: "100%", maxHeight: "150px" }}
                />
              </div>
            )}

            <div
              className="file-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} />
              <p>Click to upload or drag and drop</p>
              <span>JPEG, PNG, GIF, WEBP or PDF (Max 5MB)</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              id="certificateImage"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              style={{ display: "none" }}
            />

            {errors.certificateImage && (
              <p className="error-message" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={16} /> {errors.certificateImage}
              </p>
            )}

            {certificateFile && (
              <div className="file-info">
                <p>
                  <strong>Selected:</strong> {certificateFile.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCertificateFile(null);
                    setCertificatePreview(null);
                  }}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="achievement-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : achievement ? "Update Achievement" : "Add Achievement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementModal;
