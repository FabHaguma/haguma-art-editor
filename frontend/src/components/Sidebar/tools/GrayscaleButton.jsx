import React from 'react';
import { grayscaleImage } from '../../../services/apiService';
import styles from './GrayscaleButton.module.css';

const GrayscaleButton = ({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) => {
    
    const handleGrayscale = async () => {
        onProcessingStart();
        try {
            const newMetadata = await grayscaleImage(imageSessionId, originalExtension);
            onProcessingComplete(newMetadata);
        } catch (error) {
            onProcessingError(error.message);
        }
    };

    return (
        <button 
            className={styles.button} 
            onClick={handleGrayscale}
            title="Convert to Grayscale"
        >
            Apply Grayscale
        </button>
    );
};

export default GrayscaleButton;
