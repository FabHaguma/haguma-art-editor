import React, { forwardRef } from 'react';
import styles from './ImagePreview.module.css';

const ImagePreview = forwardRef(({ imageUrl, altText, zoom = 100, naturalWidth, naturalHeight, children }, ref) => {
    if (!imageUrl) {
        return <div className={styles.placeholder}>Awaiting Image...</div>;
    }

    const aspectRatio = naturalWidth && naturalHeight ? `${naturalWidth} / ${naturalHeight}` : 'auto';

    return (
        <div className={styles.imagePreviewContainer}>
            <div 
                className={styles.imageWrapper}
                style={{ 
                    aspectRatio,
                    transform: `scale(${zoom / 100})`
                }}
            >
                <img 
                    ref={ref}
                    src={imageUrl} 
                    alt={altText} 
                    className={styles.previewImage}
                />
                {children}
            </div>
        </div>
    );
});

ImagePreview.displayName = 'ImagePreview';

export default ImagePreview;