import React from 'react';
import MetadataDisplay from '../MetadataDisplay/MetadataDisplay';
import ToolSection from '../Sidebar/ToolSection';
import ResizeControls from '../Sidebar/tools/ResizeControls';
import RotateControls from '../Sidebar/tools/RotateControls';
import FlipControls from '../Sidebar/tools/FlipControls';
import CropPresetControls from '../Sidebar/tools/CropPresetControls';
import BrightnessControl from '../Sidebar/tools/BrightnessControl';
import ContrastControl from '../Sidebar/tools/ContrastControl';
import GrayscaleControl from '../Sidebar/tools/GrayscaleControl';
import FilterControls from '../Sidebar/tools/FilterControls';
import BrushControls from '../Sidebar/tools/BrushControls';
import TextControls from '../Sidebar/tools/TextControls';
import styles from './PropertiesPanel.module.css';

const PropertiesPanel = ({ 
  activeTool, 
  imageSession,
  setIsLoading,
  setError,
  updatePreviewAndMetadata,
  isVisible,
  onActivateCropMode,
  brushSettings,
  setBrushSettings,
  textSettings,
  setTextSettings,
  onApplyDrawing,
  onCancelDrawing
}) => {
  if (!imageSession) {
    return (
      <div className={`${styles.propertiesPanel} ${!isVisible ? styles.hidden : ''}`}>
        <div className={styles.emptyState}>
          <p>Upload an image to see properties and controls</p>
        </div>
      </div>
    );
  }

  // Create common props for all tool controls - matching what Sidebar was doing
  const commonToolProps = {
    imageSessionId: imageSession.id,
    originalExtension: imageSession.originalExtension,
    onProcessingStart: () => { setIsLoading(true); setError(''); },
    onProcessingComplete: (newMetadata) => {
      updatePreviewAndMetadata(newMetadata, imageSession.id, imageSession.originalExtension);
    },
    onProcessingError: (errMsg) => { setError(errMsg); setIsLoading(false); },
  };

  const renderToolControls = () => {
    switch (activeTool) {
      case 'transform':
        return (
          <>
            <div className={styles.toolGroup}>
              <h3 className={styles.toolLabel}>Resize</h3>
              <ResizeControls {...commonToolProps} />
            </div>
            <div className={styles.toolGroup}>
              <h3 className={styles.toolLabel}>Rotate</h3>
              <RotateControls {...commonToolProps} />
            </div>
            <div className={styles.toolGroup}>
              <h3 className={styles.toolLabel}>Flip</h3>
              <FlipControls {...commonToolProps} />
            </div>
          </>
        );
      case 'crop':
        return (
          <ToolSection title="Crop" defaultOpen={true}>
            <CropPresetControls onActivateWithPreset={onActivateCropMode} />
          </ToolSection>
        );
      case 'adjust':
        return (
          <ToolSection title="Adjustments" defaultOpen={true}>
            <BrightnessControl {...commonToolProps} />
            <ContrastControl {...commonToolProps} />
          </ToolSection>
        );
      case 'filter':
        return (
          <ToolSection title="Filters" defaultOpen={true}>
            <GrayscaleControl {...commonToolProps} />
            <FilterControls {...commonToolProps} />
          </ToolSection>
        );
      case 'brush':
        return (
          <ToolSection title="Brush Tool" defaultOpen={true}>
            <BrushControls 
              settings={brushSettings} 
              onSettingsChange={setBrushSettings}
              onApply={onApplyDrawing}
              onCancel={onCancelDrawing}
            />
          </ToolSection>
        );
      case 'text':
        return (
          <ToolSection title="Text Tool" defaultOpen={true}>
            <TextControls 
              settings={textSettings} 
              onSettingsChange={setTextSettings}
              onApply={onApplyDrawing}
              onCancel={onCancelDrawing}
            />
          </ToolSection>
        );
      default:
        return (
          <div className={styles.noToolSelected}>
            <p>Select a tool from the left panel to see controls</p>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.propertiesPanel} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.metadataSection}>
        <MetadataDisplay metadata={imageSession.metadata} />
      </div>
      
      <div className={styles.controlsSection}>
        {renderToolControls()}
      </div>
    </div>
  );
};

export default PropertiesPanel;
