import React, { useState } from 'react';
import { resizeImage } from '../../../services/apiService';
import Icon from '../../common/Icon';
import styles from './ResizeControls.module.css';

function ResizeControls({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) {
    const [widthPx, setWidthPx] = useState('');
    const [heightPx, setHeightPx] = useState('');
    const [percentage, setPercentage] = useState('');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    const handleApplyResize = async () => {
        let params = { maintain_aspect_ratio: maintainAspectRatio };
        if (percentage) {
            params.percentage = parseFloat(percentage);
        } else if (widthPx || heightPx) {
            params.width_px = widthPx ? parseInt(widthPx) : null;
            params.height_px = heightPx ? parseInt(heightPx) : null;
        } else {
            onProcessingError("Enter width, height, or %.");
            return;
        }
        
        onProcessingStart();
        try {
            const result = await resizeImage(imageSessionId, originalExtension, params);
            onProcessingComplete(result);
        } catch (err) {
            onProcessingError(err.message || 'Resize failed.');
        }
    };
    
    const handlePixelInput = () => setPercentage('');
    const handlePercentageInput = () => { setWidthPx(''); setHeightPx(''); };

    return (
        <div className={styles.resizeControls}>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>W</label>
                    <input 
                        type="number" 
                        value={widthPx} 
                        onChange={e => setWidthPx(e.target.value)} 
                        onFocus={handlePixelInput} 
                        placeholder="px" 
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>H</label>
                    <input 
                        type="number" 
                        value={heightPx} 
                        onChange={e => setHeightPx(e.target.value)} 
                        onFocus={handlePixelInput} 
                        placeholder="px" 
                        className={styles.input}
                    />
                </div>
            </div>
            
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>%</label>
                    <input 
                        type="number" 
                        value={percentage} 
                        onChange={e => setPercentage(e.target.value)} 
                        onFocus={handlePercentageInput} 
                        placeholder="Scale" 
                        className={styles.input}
                    />
                </div>
                 <button 
                    className={`${styles.aspectButton} ${maintainAspectRatio ? styles.active : ''}`}
                    onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                    title="Maintain Aspect Ratio"
                >
                    <Icon name={maintainAspectRatio ? 'lock' : 'unlock'} />
                </button>
            </div>

            <button onClick={handleApplyResize} className={styles.applyButton}>Apply</button>
        </div>
    );
}
export default ResizeControls;