import React, { useState } from 'react';
import MetadataDisplay from '../MetadataDisplay/MetadataDisplay';
import ResizeControls from './tools/ResizeControls';
import RotateControls from './tools/RotateControls';
import FlipControls from './tools/FlipControls';
import CropPresetControls from './tools/CropPresetControls';
import GrayscaleButton from './tools/GrayscaleButton';
import BrightnessControl from './tools/BrightnessControl';
import ContrastControl from './tools/ContrastControl';
import FilterControls from './tools/FilterControls';
import ToolSection from './ToolSection';
import DownloadButton from './DownloadButton';
import SaveOptions from './SaveOptions';
import styles from './Sidebar.module.css';

function Sidebar({ imageSession, setIsLoading, setError, updatePreviewAndMetadata, clearImageSession }) {
    const [downloadFormat, setDownloadFormat] = useState('');

    if (!imageSession) return null;

    const commonToolProps = {
        imageSessionId: imageSession.id,
        originalExtension: imageSession.originalExtension,
        onProcessingStart: () => { setIsLoading(true); setError(''); },
        onProcessingComplete: (newMetadata) => {
            updatePreviewAndMetadata(newMetadata, imageSession.id, imageSession.originalExtension);
        },
        onProcessingError: (errMsg) => { setError(errMsg); setIsLoading(false); },
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
                <span className={styles.logoText}>Haguma Editor</span>
                 <button onClick={clearImageSession} className={styles.closeImageButton} title="Close Image">
                    X
                </button>
            </div>

            <div className={styles.sidebarContent}>
                <MetadataDisplay metadata={imageSession.metadata} />
                
                <ToolSection title="Transform" defaultOpen={true}>
                    <ResizeControls {...commonToolProps} />
                    <RotateControls {...commonToolProps} />
                    <FlipControls {...commonToolProps} />
                </ToolSection>

                <ToolSection title="Crop">
                    <CropPresetControls {...commonToolProps} />
                </ToolSection>

                <ToolSection title="Adjustments">
                    <BrightnessControl {...commonToolProps} />
                    <ContrastControl {...commonToolProps} />
                </ToolSection>

                <ToolSection title="Filters">
                    <GrayscaleButton {...commonToolProps} />
                    <FilterControls {...commonToolProps} />
                </ToolSection>
            </div>

            <div className={styles.sidebarFooter}>
                <SaveOptions 
                    selectedFormat={downloadFormat} 
                    onFormatChange={setDownloadFormat} 
                />
                <DownloadButton 
                    imageSessionId={imageSession.id} 
                    originalExtension={imageSession.originalExtension} 
                    format={downloadFormat}
                />
            </div>
        </aside>
    );
}

export default Sidebar;