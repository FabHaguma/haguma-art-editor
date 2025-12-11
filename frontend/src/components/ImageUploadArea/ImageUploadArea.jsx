import React, { useState, useCallback } from 'react';
import { uploadImage as apiUploadImage } from '../../services/apiService'; // Renamed to avoid conflict
import styles from './ImageUploadArea.module.css'; // Create ImageUploadArea.module.css
// import { UploadCloud } from 'lucide-react'; // Example icon library

function ImageUploadArea({ onImageUploaded, setIsLoading, setError, clearError }) {
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = useCallback(async (selectedFiles) => {
        clearError();
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            
            // Basic client-side validation (optional, backend does more thorough)
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setError('Invalid file type. Please upload JPEG or PNG.');
                return;
            }
            if (file.size > 12 * 1024 * 1024) { // 12MB
                setError('File is too large. Maximum size is 12MB.');
                return;
            }

            setIsLoading(true);
            try {
                const sessionData = await apiUploadImage(file);
                onImageUploaded(sessionData, file); // Pass raw file for blob URL creation
            } catch (err) {
                setError(err.message || 'Upload failed. Please try again.');
                setIsLoading(false); // Ensure loading is false on error
            }
            // setIsLoading(false); // Moved to finally or success/error specific
        }
    }, [onImageUploaded, setIsLoading, setError, clearError]);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileChange(event.dataTransfer.files);
        }
    }, [handleFileChange]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
    }, []);

    const onFileInputChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            handleFileChange(event.target.files);
            event.target.value = null; // Reset file input
        }
    };

    return (
        <div
            className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('fileInput').click()}
        >
            <input
                type="file"
                id="fileInput"
                className={styles.fileInput}
                accept=".jpg,.jpeg,.png"
                onChange={onFileInputChange}
            />
            {/* <UploadCloud size={48} className={styles.uploadIcon} /> */}
            <p className={styles.uploadText}>
                Drag & drop an image here, or <span>click to select</span>.
            </p>
            <p className={styles.uploadHint}>JPEG, PNG supported. Max 12MB.</p>
        </div>
    );
}

export default ImageUploadArea;