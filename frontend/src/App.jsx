import React, { useState, useCallback, useEffect } from 'react';
import Topbar from './components/Topbar/Topbar';
import ToolPalette from './components/ToolPalette/ToolPalette';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import MainCanvas from './components/MainCanvas/MainCanvas';
import SaveAsModal from './components/SaveAsModal/SaveAsModal';
import { getDownloadUrl, undoImage, redoImage } from './services/apiService';
import styles from './App.module.css';

function App() {
    const [imageSession, setImageSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('dark');
    const [activeTool, setActiveTool] = useState('transform');
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [zoom, setZoom] = useState(100); // Zoom percentage
    const [cropMode, setCropMode] = useState(false); // Interactive crop mode
    const [cropAspectRatio, setCropAspectRatio] = useState(null); // Aspect ratio for crop
    const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const toggleLeftPanel = () => {
        setShowLeftPanel(prev => !prev);
    };

    const toggleRightPanel = () => {
        setShowRightPanel(prev => !prev);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 500)); // Max 500%
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 25)); // Min 25%
    };

    const handleFitScreen = () => {
        setZoom(100); // Reset to 100%
    };

    const handleToolSelect = (toolId) => {
        setActiveTool(toolId);
        // Exit crop mode when switching tools
        if (cropMode) {
            setCropMode(false);
        }
        // Auto-expand right panel when tool is selected on mobile
        if (window.innerWidth <= 1024) {
            setShowRightPanel(true);
        }
    };

    const handleActivateCropMode = (aspectRatio = null) => {
        setCropMode(true);
        setCropAspectRatio(aspectRatio);
    };

    const handleCropComplete = () => {
        setCropMode(false);
        setCropAspectRatio(null);
    };

    const handleCropCancel = () => {
        setCropMode(false);
        setCropAspectRatio(null);
    };

    // Responsive behavior: collapse panels on mobile by default
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setShowLeftPanel(false);
                setShowRightPanel(false);
            } else {
                setShowLeftPanel(true);
                setShowRightPanel(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleImageUploaded = useCallback((sessionData, rawFile) => {
        const previewUrl = URL.createObjectURL(rawFile);
        setImageSession({
            id: sessionData.image_session_id,
            originalExtension: sessionData.original_extension,
            metadata: {
                filename: sessionData.filename,
                dimensions: sessionData.initial_dimensions,
                format: sessionData.format,
                size_bytes: sessionData.size_bytes,
            },
            previewUrl: previewUrl,
            rawFile: rawFile,
        });
        setCanUndo(!!sessionData.can_undo);
        setCanRedo(!!sessionData.can_redo);
        setError('');
        setIsLoading(false); // Ensure loading is false after successful upload
    }, []);

    const updatePreviewAndMetadata = useCallback((newMetadata, sessionId, originalExtension) => {
        const cacheBuster = new Date().getTime();
        // Construct the full URL for the image preview
        const newPreviewUrl = `${getDownloadUrl(sessionId, originalExtension)}?t=${cacheBuster}`;

        setImageSession(prev => {
            if (!prev) return null; // Safety check
            // Revoke old blob URL to free memory if it exists and is a blob URL
            if (prev.previewUrl && prev.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prev.previewUrl);
            }
            return {
                ...prev,
                metadata: {
                    ...prev.metadata,
                    dimensions: newMetadata.new_dimensions || prev.metadata.dimensions,
                    size_bytes: newMetadata.new_size_bytes || prev.metadata.size_bytes,
                },
                previewUrl: newPreviewUrl,
            };
        });
        
        if (newMetadata.can_undo !== undefined) setCanUndo(newMetadata.can_undo);
        if (newMetadata.can_redo !== undefined) setCanRedo(newMetadata.can_redo);
        
        setIsLoading(false);
    }, []);

    const clearError = useCallback(() => setError(''), []);
    const clearImageSession = useCallback(() => {
        if (imageSession && imageSession.previewUrl && imageSession.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageSession.previewUrl);
        }
        setImageSession(null);
        setCanUndo(false);
        setCanRedo(false);
        setError('');
        setIsLoading(false);
    }, [imageSession]);

    const handleSaveAsOpen = () => {
        setIsSaveAsModalOpen(true);
    };

    const handleSaveAsClose = () => {
        setIsSaveAsModalOpen(false);
    };

    const handleUndo = async () => {
        if (!imageSession || !canUndo) return;
        setIsLoading(true);
        try {
            const result = await undoImage(imageSession.id, imageSession.originalExtension);
            updatePreviewAndMetadata(result, imageSession.id, imageSession.originalExtension);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleRedo = async () => {
        if (!imageSession || !canRedo) return;
        setIsLoading(true);
        try {
            const result = await redoImage(imageSession.id, imageSession.originalExtension);
            updatePreviewAndMetadata(result, imageSession.id, imageSession.originalExtension);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleDownload = (filename, format) => {
        if (!imageSession) return;
        
        const downloadUrl = getDownloadUrl(imageSession.id, imageSession.originalExtension, format);
        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        // Ensure correct extension for the filename
        const extension = format === 'jpeg' ? 'jpg' : format;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`${styles.appContainer} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}>
            <Topbar
                imageSession={imageSession}
                onSaveAs={handleSaveAsOpen}
                theme={theme}
                onThemeToggle={toggleTheme}
                onToggleLeftPanel={toggleLeftPanel}
                onToggleRightPanel={toggleRightPanel}
                onClearImage={clearImageSession}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitScreen={handleFitScreen}
                zoom={zoom}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onToolSelect={handleToolSelect}
            />

            <div className={styles.mainLayout}>
                <ToolPalette
                    activeTool={activeTool}
                    onToolSelect={handleToolSelect}
                    isVisible={showLeftPanel && imageSession}
                />
                
                <MainCanvas
                    imageSession={imageSession}
                    onImageUploaded={handleImageUploaded}
                    setIsLoading={setIsLoading}
                    setError={setError}
                    clearError={clearError}
                    zoom={zoom}
                    cropMode={cropMode}
                    cropAspectRatio={cropAspectRatio}
                    onCropComplete={handleCropComplete}
                    onCropCancel={handleCropCancel}
                    updatePreviewAndMetadata={updatePreviewAndMetadata}
                />

                <PropertiesPanel
                    activeTool={activeTool}
                    imageSession={imageSession}
                    setIsLoading={setIsLoading}
                    setError={setError}
                    updatePreviewAndMetadata={updatePreviewAndMetadata}
                    isVisible={showRightPanel && imageSession}
                    onActivateCropMode={handleActivateCropMode}
                />
            </div>

            <SaveAsModal 
                isOpen={isSaveAsModalOpen}
                onClose={handleSaveAsClose}
                onDownload={handleDownload}
                currentFilename={imageSession?.metadata?.filename}
            />

            {isLoading && <div className={styles.globalLoadingIndicator}>Processing...</div>}
            {error && (
                <div className={styles.globalErrorNotification}>
                    <span>{error}</span>
                    <button onClick={clearError} title="Dismiss error">×</button>
                </div>
            )}
        </div>
    );
}

export default App;