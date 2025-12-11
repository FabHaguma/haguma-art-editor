import React, { useState, useEffect } from 'react';
import styles from './SaveAsModal.module.css';

const SaveAsModal = ({ isOpen, onClose, onDownload, currentFilename }) => {
    const [filename, setFilename] = useState('');
    const [format, setFormat] = useState('jpeg');

    useEffect(() => {
        if (isOpen && currentFilename) {
            // Strip extension from current filename if present
            const lastDotIndex = currentFilename.lastIndexOf('.');
            const nameWithoutExt = lastDotIndex !== -1 ? currentFilename.substring(0, lastDotIndex) : currentFilename;
            setFilename(nameWithoutExt);
        }
    }, [isOpen, currentFilename]);

    const handleDownload = () => {
        onDownload(filename, format);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.title}>Save As</h2>
                
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="filename-input">Filename</label>
                    <input 
                        id="filename-input"
                        type="text" 
                        className={styles.input}
                        value={filename} 
                        onChange={(e) => setFilename(e.target.value)}
                        autoFocus
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="format-select">Format</label>
                    <select 
                        id="format-select"
                        className={styles.select}
                        value={format} 
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <option value="jpeg">JPEG (*.jpg, *.jpeg, *.jpe)</option>
                        <option value="png">PNG (*.png, *.pns)</option>
                        <option value="gif">GIF (*.gif)</option>
                    </select>
                </div>
                
                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
                    <button className={styles.downloadButton} onClick={handleDownload}>Download</button>
                </div>
            </div>
        </div>
    );
};

export default SaveAsModal;
