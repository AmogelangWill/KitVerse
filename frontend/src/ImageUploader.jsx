import React, { useState, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import './ImageUploader.css';

// Reusable drag-and-drop image uploader posting files to Supabase via backend endpoint
function ImageUploader({ endpoint, onUploadSuccess, multiple = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { user } = useAuth();
    const { showToast } = useToast();

    // Sets drag-active style when file enters drop zone
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    // Maintains drag-active state while hovering
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    // Removes drag-active style when file leaves drop zone
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // Uploads selected image files sequentially to the upload API
    const uploadFiles = async (files) => {
        const token = user?.token;
        if (!token) {
            showToast("You must be logged in to upload images.", "error");
            return;
        }

        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`https://kitverse-production.up.railway.app${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    onUploadSuccess(data.url);
                    showToast(`Successfully uploaded ${file.name}`, 'success');
                } else {
                    const error = await response.json();
                    showToast(error.message || `Failed to upload ${file.name}`, 'error');
                }
            } catch (err) {
                showToast(`Network error uploading ${file.name}`, 'error');
            }
        }
        
        setIsUploading(false);
        // Clear input value so the same file can be uploaded again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handles files dropped onto the upload area
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) {
            showToast("Please upload valid image files.", "error");
            return;
        }

        if (!multiple && files.length > 1) {
            uploadFiles([files[0]]);
            showToast("Only one image allowed. Uploading first image.", "info");
        } else {
            uploadFiles(files);
        }
    };

    // Handles files selected through standard OS file dialog
    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        uploadFiles(files);
    };

    return (
        <div>
            <div 
                className={`ImageUploader ${isDragging ? 'DragActive' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileInput}
                />
                
                <div className="ImageUploader-Content">
                    <svg className="ImageUploader-Icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    <div className="ImageUploader-Text">
                        Drag & Drop or <span>Browse</span>
                    </div>
                    <div className="ImageUploader-Subtext">
                        Supports JPG, PNG, WEBP
                    </div>
                </div>

                {isUploading && (
                    <div className="UploadingOverlay">
                        <div className="Spinner"></div>
                        Uploading...
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUploader;
