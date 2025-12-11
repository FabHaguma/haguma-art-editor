import React, { useState } from 'react';
import { adjustContrast } from '../../../services/apiService';
import styles from './ContrastControl.module.css';

const ContrastControl = ({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) => {
    const [level, setLevel] = useState(0);

    const handleApply = async () => {
        onProcessingStart();
        try {
            const newMetadata = await adjustContrast(imageSessionId, originalExtension, level);
            onProcessingComplete(newMetadata);
            setLevel(0);
        } catch (error) {
            onProcessingError(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>Contrast: {level}</label>
            <input 
                type="range" 
                min="-100" 
                max="100" 
                value={level} 
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className={styles.slider}
            />
            <button className={styles.button} onClick={handleApply}>Apply Contrast</button>
        </div>
    );
};

export default ContrastControl;
