import React, { useState, useRef } from 'react';
import './ImageUploader.css';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

function ImageUploader({ endpoint, onUploadSuccess, multiple = false, currentImages = [] }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();
    const { user } = useAuth();

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const uploadFiles = async (files) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        const token = user?.token;

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
        // Reset file input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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
            
            {/* We let the parent component render the actual currentImages array so they can handle removals */}
        </div>
    );
}

export default ImageUploader;
