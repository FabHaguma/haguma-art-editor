import React, { useState } from 'react';
import { applyFilter } from '../../../services/apiService';
import styles from './FilterControls.module.css';

const FilterControls = ({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) => {
    const [blurIntensity, setBlurIntensity] = useState(0);
    const [sharpenIntensity, setSharpenIntensity] = useState(0);

    const handleFilter = async (type, intensity) => {
        onProcessingStart();
        try {
            const newMetadata = await applyFilter(imageSessionId, originalExtension, type, intensity);
            onProcessingComplete(newMetadata);
            if (type === 'blur') setBlurIntensity(0);
            if (type === 'sharpen') setSharpenIntensity(0);
        } catch (error) {
            onProcessingError(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.controlGroup}>
                <label className={styles.label}>Blur Intensity: {blurIntensity}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={blurIntensity} 
                    onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                    className={styles.slider}
                />
                <button 
                    className={styles.button} 
                    onClick={() => handleFilter('blur', blurIntensity)}
                    title="Apply Blur"
                >
                    Apply Blur
                </button>
            </div>

            <div className={styles.controlGroup}>
                <label className={styles.label}>Sharpen Intensity: {sharpenIntensity}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sharpenIntensity} 
                    onChange={(e) => setSharpenIntensity(parseInt(e.target.value))}
                    className={styles.slider}
                />
                <button 
                    className={styles.button} 
                    onClick={() => handleFilter('sharpen', sharpenIntensity)}
                    title="Apply Sharpen"
                >
                    Apply Sharpen
                </button>
            </div>
        </div>
    );
};

export default FilterControls;
