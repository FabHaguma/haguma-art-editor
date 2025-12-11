import React, { useState } from 'react';
import { grayscaleImage } from '../../../services/apiService';
import styles from './GrayscaleControl.module.css';

const GrayscaleControl = ({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) => {
    const [intensity, setIntensity] = useState(0);

    const handleApply = async () => {
        onProcessingStart();
        try {
            const newMetadata = await grayscaleImage(imageSessionId, originalExtension, intensity);
            onProcessingComplete(newMetadata);
            setIntensity(0);
        } catch (error) {
            onProcessingError(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>Grayscale Intensity: {intensity}%</label>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensity} 
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className={styles.slider}
            />
            <button className={styles.button} onClick={handleApply}>Apply Grayscale</button>
        </div>
    );
};

export default GrayscaleControl;
