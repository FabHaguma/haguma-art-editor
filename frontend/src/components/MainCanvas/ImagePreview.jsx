import React, { forwardRef } from 'react';
import styles from './ImagePreview.module.css'; // Create ImagePreview.module.css

const ImagePreview = forwardRef(({ imageUrl, altText, zoom = 100 }, ref) => {
    if (!imageUrl) {
        // This part is less likely to be shown if MainCanvas handles the !imageSession case
        return <div className={styles.placeholder}>Awaiting Image...</div>;
    }
    return (
        <div className={styles.imagePreviewContainer}>
            <img 
                ref={ref}
                src={imageUrl} 
                alt={altText} 
                className={styles.previewImage}
                style={{ transform: `scale(${zoom / 100})` }}
            />
        </div>
    );
});

ImagePreview.displayName = 'ImagePreview';

export default ImagePreview;