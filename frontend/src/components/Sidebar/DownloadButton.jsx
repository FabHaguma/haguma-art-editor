import React from 'react';
import { getDownloadUrl } from '../../services/apiService';
import styles from './DownloadButton.module.css';

const DownloadButton = ({ imageSessionId, originalExtension, format }) => {
    if (!imageSessionId || !originalExtension) return null;

    const downloadUrl = getDownloadUrl(imageSessionId, originalExtension, format);
    const extension = format || originalExtension;
    const filename = `edited_haguma_art.${extension}`;

    return (
        <a
            href={downloadUrl}
            download={filename}
            className={styles.downloadButton}
        >
            Download Image
        </a>
    );
};

export default DownloadButton;
