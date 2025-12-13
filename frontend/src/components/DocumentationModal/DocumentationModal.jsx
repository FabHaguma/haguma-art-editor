import React from 'react';
import styles from './DocumentationModal.module.css';

const DocumentationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Documentation</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3>Getting Started</h3>
                        <p>Upload an image by dragging and dropping it onto the canvas or clicking the upload area. Supported formats include JPEG, PNG, GIF, BMP, and WEBP.</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Tools</h3>
                        <div className={styles.toolItem}>
                            <strong>Transform:</strong> Resize, rotate, flip, and crop your image.
                        </div>
                        <div className={styles.toolItem}>
                            <strong>Adjust:</strong> Modify brightness, contrast, and convert to grayscale.
                        </div>
                        <div className={styles.toolItem}>
                            <strong>Filters:</strong> Apply blur and sharpen effects.
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Shortcuts</h3>
                        <ul className={styles.shortcutList}>
                            <li><strong>Undo:</strong> Edit &gt; Undo</li>
                            <li><strong>Redo:</strong> Edit &gt; Redo</li>
                            <li><strong>Save:</strong> File &gt; Save</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3>Saving & Exporting</h3>
                        <p>Use "Save As..." to save your work with a custom filename and format. The "Download" option quickly saves your edited image with "_Edited" appended to the original filename.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentationModal;
