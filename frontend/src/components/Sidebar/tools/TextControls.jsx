import React from 'react';
import styles from './TextControls.module.css';

const TextControls = ({ settings, onSettingsChange, onApply, onCancel }) => {
    if (!settings) return null;

    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className={styles.textControls}>
            <div className={styles.controlGroup}>
                <label>Text Content</label>
                <textarea 
                    value={settings.text} 
                    onChange={(e) => handleChange('text', e.target.value)} 
                    placeholder="Enter text here..."
                    className={styles.textArea}
                />
            </div>

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
                    min="10" 
                    max="200" 
                    value={settings.size} 
                    onChange={(e) => handleChange('size', parseInt(e.target.value))} 
                    className={styles.slider}
                />
            </div>

            <div className={styles.controlGroup}>
                <label>Font</label>
                <select 
                    value={settings.font} 
                    onChange={(e) => handleChange('font', e.target.value)}
                    className={styles.select}
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                </select>
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={onApply} className={styles.applyButton}>Apply</button>
            </div>
        </div>
    );
};

export default TextControls;
