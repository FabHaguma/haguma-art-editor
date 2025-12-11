import React from 'react';
import { rotateImage } from '../../../services/apiService';
import Icon from '../../common/Icon';
import styles from './RotateControls.module.css';

function RotateControls({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) {
    const handleRotate = async (angle) => {
        onProcessingStart();
        try {
            const result = await rotateImage(imageSessionId, originalExtension, angle);
            onProcessingComplete(result);
        } catch (err) {
            onProcessingError(err.message || 'Rotation failed.');
        }
    };

    return (
        <div className={styles.rotateControls}>
            <button onClick={() => handleRotate(-90)} className={styles.rotateButton} title="Rotate Left">
                <Icon name="rotate-ccw" />
            </button>
            <button onClick={() => handleRotate(90)} className={styles.rotateButton} title="Rotate Right">
                <Icon name="rotate-cw" />
            </button>
            <button onClick={() => handleRotate(180)} className={styles.rotateButton} title="Rotate 180°">
                180°
            </button>
        </div>
    );
}
export default RotateControls;