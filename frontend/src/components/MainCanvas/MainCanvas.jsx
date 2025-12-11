import React, { useState, useEffect, useRef } from 'react';
import ImagePreview from './ImagePreview';
import ImageUploadArea from '../ImageUploadArea/ImageUploadArea'; // Corrected path
import CropTool from '../Sidebar/tools/CropTool';
import { cropImageCustom } from '../../services/apiService';
import styles from './MainCanvas.module.css'; // Create MainCanvas.module.css

function MainCanvas({ 
    imageSession, 
    onImageUploaded, 
    setIsLoading, 
    setError, 
    clearError, 
    zoom = 100,
    cropMode = false,
    cropAspectRatio = null,
    onCropComplete,
    onCropCancel,
    updatePreviewAndMetadata
}) {
    const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
    const imageRef = useRef(null);

    // Get natural image dimensions when preview loads
    useEffect(() => {
        if (imageSession?.previewUrl && imageRef.current) {
            const img = new Image();
            img.onload = () => {
                setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.src = imageSession.previewUrl;
        }
    }, [imageSession?.previewUrl]);

    const handleCropApply = async (cropData) => {
        try {
            setIsLoading(true);
            setError('');
            
            const newMetadata = await cropImageCustom(
                imageSession.id,
                imageSession.originalExtension,
                cropData
            );
            
            updatePreviewAndMetadata(newMetadata, imageSession.id, imageSession.originalExtension);
            onCropComplete?.();
        } catch (err) {
            setError(err.message || 'Failed to apply crop');
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainCanvas}>
            {!imageSession ? (
                <div className={styles.uploadPromptContainer}>
                    <ImageUploadArea
                        onImageUploaded={onImageUploaded}
                        setIsLoading={setIsLoading}
                        setError={setError}
                        clearError={clearError}
                    />
                </div>
            ) : (
                <div className={styles.canvasWrapper}>
                    <ImagePreview
                        ref={imageRef}
                        imageUrl={imageSession.previewUrl}
                        altText={imageSession.metadata?.filename || 'Edited image'}
                        zoom={zoom}
                    />
                    {cropMode && imageNaturalSize.width > 0 && (
                        <CropTool
                            imageSessionId={imageSession.id}
                            originalExtension={imageSession.originalExtension}
                            imageUrl={imageSession.previewUrl}
                            imageWidth={imageNaturalSize.width}
                            imageHeight={imageNaturalSize.height}
                            aspectRatio={cropAspectRatio}
                            onCropComplete={handleCropApply}
                            onCancel={onCropCancel}
                        />
                    )}
                </div>
            )}
        </main>
    );
}

export default MainCanvas;