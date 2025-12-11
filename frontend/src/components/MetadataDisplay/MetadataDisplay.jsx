import React from 'react';
import styles from './MetadataDisplay.module.css'; // Create MetadataDisplay.module.css

function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function MetadataDisplay({ metadata }) {
    if (!metadata) return <div className={styles.metadataDisplayEmpty}>No image loaded.</div>;

    return (
        <div className={styles.metadataDisplay}>
            <h4 className={styles.title}>Image Info</h4>
            <ul className={styles.list}>
                <li>
                    <strong>Filename:</strong> <span>{metadata.filename}</span>
                </li>
                <li>
                    <strong>W x H:</strong> <span>{metadata.dimensions?.width} × {metadata.dimensions?.height} px</span>
                </li>
                <li>
                    <strong>Format:</strong> <span>{metadata.format}</span>
                </li>
                <li>
                    <strong>Size:</strong> <span>{formatBytes(metadata.size_bytes)}</span>
                </li>
            </ul>
        </div>
    );
}

export default MetadataDisplay;