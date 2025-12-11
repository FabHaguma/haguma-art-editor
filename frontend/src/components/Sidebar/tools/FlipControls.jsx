import React from 'react';
import { flipImage } from '../../../services/apiService';
import Icon from '../../common/Icon';
import styles from './FlipControls.module.css';

const FlipControls = ({ imageSessionId, originalExtension, onProcessingStart, onProcessingComplete, onProcessingError }) => {
    
    const handleFlip = async (axis) => {
        onProcessingStart();
        try {
            const newMetadata = await flipImage(imageSessionId, originalExtension, axis);
            onProcessingComplete(newMetadata);
        } catch (error) {
            onProcessingError(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <button 
                className={styles.button} 
                onClick={() => handleFlip('horizontal')}
                title="Flip Horizontal"
            >
                <Icon name="flip-h" />
            </button>
            <button 
                className={styles.button} 
                onClick={() => handleFlip('vertical')}
                title="Flip Vertical"
            >
                <Icon name="flip-v" />
            </button>
        </div>
    );
};

export default FlipControls;
