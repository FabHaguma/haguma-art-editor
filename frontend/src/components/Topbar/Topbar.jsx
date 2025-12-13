import React from 'react';
import Icon from '../common/Icon';
import MenuBar from '../MenuBar/MenuBar';
import styles from './Topbar.module.css';

const Topbar = ({ 
  imageSession, 
  onSaveAs,
  onDownload,
  theme,
  onThemeToggle,
  onToggleLeftPanel,
  onToggleRightPanel,
  onClearImage,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToolSelect,
  onAbout,
  onDocumentation
}) => {
  const handleDirectDownload = () => {
    if (imageSession && onDownload) {
      const originalName = imageSession.metadata.filename;
      const lastDotIndex = originalName.lastIndexOf('.');
      const nameWithoutExt = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
      
      // Use original format (pass null/undefined as format)
      onDownload(`${nameWithoutExt}_Edited`, null);
    }
  };

  const handleZoomIn = () => {
    onZoomIn?.();
  };

  const handleZoomOut = () => {
    onZoomOut?.();
  };

  const handleFitScreen = () => {
    onFitScreen?.();
  };

  return (
    <div className={styles.topbarContainer}>
      <MenuBar 
        imageSession={imageSession}
        onSaveAs={onSaveAs}
        onDownload={handleDirectDownload}
        onClearImage={onClearImage}
        theme={theme}
        onThemeToggle={onThemeToggle}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onToolSelect={onToolSelect}
        onAbout={onAbout}
        onDocumentation={onDocumentation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
      />
      
      <div className={styles.topbar}>
        <div className={styles.leftSection}>
          <button 
            className={styles.panelToggle}
            onClick={onToggleLeftPanel}
            aria-label="Toggle Tools Panel"
            title="Toggle Tools Panel"
          >
            <Icon name="menu" />
          </button>
          <h1 className={styles.logo}>Haguma Art Editor</h1>
        </div>

        <div className={styles.centerSection}>
          {imageSession && (
            <>
              <span className={styles.filename}>{imageSession.metadata.filename}</span>
              <span className={styles.zoomLevel}>{zoom}%</span>
            </>
          )}
        </div>

        <div className={styles.rightSection}>
          {imageSession && (
            <>
              <div className={styles.zoomControls}>
                <button
                  className={styles.zoomButton}
                  onClick={handleZoomIn}
                  aria-label="Zoom In"
                  title="Zoom In"
                >
                  🔍+
                </button>
                <button
                  className={styles.zoomButton}
                  onClick={handleZoomOut}
                  aria-label="Zoom Out"
                  title="Zoom Out"
                >
                  🔍−
                </button>
                <button
                  className={styles.zoomButton}
                  onClick={handleFitScreen}
                  aria-label="Fit to Screen"
                  title="Fit to Screen"
                >
                  ⛶
                </button>
              </div>
            </>
          )}

          <button 
            className={styles.panelToggle}
            onClick={onToggleRightPanel}
            aria-label="Toggle Properties Panel"
            title="Toggle Properties Panel"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
