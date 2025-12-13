import React from 'react';
import styles from './BrushControls.module.css';

const BrushControls = ({ settings, onSettingsChange, onApply, onCancel }) => {
    if (!settings) return null;

    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className={styles.brushControls}>
            <div className={styles.controlGroup}>
                <label>Color</label>
                <input 
                    type="color" 
                    value={settings.color} 
                    onChange={(e) => handleChange('color', e.target.value)} 
                    className={styles.colorInput}
                />
            </div>
            
            <div className={styles.controlGroup}>
                <label>Size: {settings.size}px</label>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={settings.size} 
                    onChange={(e) => handleChange('size', parseInt(e.target.value))} 
                    className={styles.slider}
                />
            </div>

            <div className={styles.controlGroup}>
                <label>Opacity: {settings.opacity}%</label>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={settings.opacity} 
                    onChange={(e) => handleChange('opacity', parseInt(e.target.value))} 
                    className={styles.slider}
                />
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={onApply} className={styles.applyButton}>Apply</button>
            </div>
        </div>
    );
};

export default BrushControls;
