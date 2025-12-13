import React from 'react';
import styles from './AboutModal.module.css';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>About Haguma Art Editor</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.content}>
                    <p className={styles.description}>
                        Haguma Art Editor is a powerful, web-based image editing tool designed for simplicity and efficiency.
                    </p>
                    
                    <div className={styles.section}>
                        <h3>Version</h3>
                        <p>1.0.0</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Features</h3>
                        <ul className={styles.featureList}>
                            <li>Image Resizing & Cropping</li>
                            <li>Rotation & Flipping</li>
                            <li>Filters & Adjustments (Brightness, Contrast, Grayscale)</li>
                            <li>Undo/Redo History</li>
                            <li>Format Conversion (JPEG, PNG, GIF)</li>
                        </ul>
                    </div>

                    <div className={styles.footer}>
                        <p>© 2025 Haguma Art Editor. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
