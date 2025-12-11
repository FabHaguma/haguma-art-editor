import React from 'react';
import styles from './CropPresetControls.module.css';

const CropPresetControls = ({ onActivateWithPreset }) => {
    
    const presets = [
        { id: 'square', label: 'Square (1:1)', ratio: 1.0 },
        { id: '16x9', label: '16:9', ratio: 16/9 },
        { id: '4x3', label: '4:3', ratio: 4/3 },
        { id: '9x16', label: '9:16 (Portrait)', ratio: 9/16 },
        { id: '3x4', label: '3:4 (Portrait)', ratio: 3/4 },
    ];

    return (
        <div className={styles.container}>
            <button 
                className={styles.button}
                onClick={() => onActivateWithPreset?.(null)}
                title="Free Crop"
            >
                Free Crop
            </button>
            {presets.map(preset => (
                <button 
                    key={preset.id}
                    className={styles.button} 
                    onClick={() => onActivateWithPreset?.(preset.ratio)}
                    title={`Crop to ${preset.label}`}
                >
                    {preset.label}
                </button>
            ))}
        </div>
    );
};

export default CropPresetControls;
