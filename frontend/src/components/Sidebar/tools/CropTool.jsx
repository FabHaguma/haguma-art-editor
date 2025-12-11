import React, { useState, useRef, useEffect } from 'react';
import styles from './CropTool.module.css';

/**
 * Interactive Crop Tool Component
 * Allows users to define a rectangular crop area with draggable handles and confirm/cancel
 */
const CropTool = ({ 
  imageWidth,
  imageHeight,
  onCropComplete,
  onCancel,
  aspectRatio = null // Optional: lock to specific aspect ratio (width/height)
}) => {
  const canvasRef = useRef(null);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState(null);

  const HANDLE_SIZE = 10;
  const MIN_SIZE = 20;

  const sanitizeNumber = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // Ensure aspectRatio is a valid number if provided
  const validAspectRatio = (typeof aspectRatio === 'number' && isFinite(aspectRatio)) ? aspectRatio : null;

  useEffect(() => {
    // Initialize crop area to center of image with 80% size
    if (imageWidth && imageHeight) {
      let initialWidth, initialHeight;
      
      if (validAspectRatio !== null) {
        // Calculate dimensions maintaining aspect ratio
        const imageRatio = imageWidth / imageHeight;
        if (imageRatio > validAspectRatio) {
          // Image is wider, constrain by height
          initialHeight = imageHeight * 0.8;
          initialWidth = initialHeight * validAspectRatio;
        } else {
          // Image is taller, constrain by width
          initialWidth = imageWidth * 0.8;
          initialHeight = initialWidth / validAspectRatio;
        }
      } else {
        // Free crop - start as square using the smaller dimension to avoid NaN heights
        const baseSize = Math.min(imageWidth, imageHeight) * 0.8;
        initialWidth = baseSize;
        initialHeight = baseSize;
      }
      
      const fallbackSize = sanitizeNumber(Math.min(imageWidth, imageHeight) * 0.8, MIN_SIZE);
      const safeWidth = sanitizeNumber(initialWidth, fallbackSize);
      const safeHeight = sanitizeNumber(initialHeight, fallbackSize);

      setCropArea({
        x: (imageWidth - safeWidth) / 2,
        y: (imageHeight - safeHeight) / 2,
        width: safeWidth,
        height: safeHeight
      });
    }
  }, [imageWidth, imageHeight, validAspectRatio]);

  // Get handle positions
  const getHandles = () => {
    const { x, y, width, height } = cropArea;
    const handles = {
      nw: { x: x - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2, cursor: 'nw-resize' },
      ne: { x: x + width - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2, cursor: 'ne-resize' },
      sw: { x: x - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2, cursor: 'sw-resize' },
      se: { x: x + width - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2, cursor: 'se-resize' },
    };
    
    // Only show edge handles when aspect ratio is not locked
    if (validAspectRatio === null) {
      handles.n = { x: x + width / 2 - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2, cursor: 'n-resize' };
      handles.s = { x: x + width / 2 - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2, cursor: 's-resize' };
      handles.e = { x: x + width - HANDLE_SIZE / 2, y: y + height / 2 - HANDLE_SIZE / 2, cursor: 'e-resize' };
      handles.w = { x: x - HANDLE_SIZE / 2, y: y + height / 2 - HANDLE_SIZE / 2, cursor: 'w-resize' };
    }
    
    return handles;
  };

  // Check if point is inside a handle
  const getHandleAtPoint = (px, py) => {
    const handles = getHandles();
    for (const [name, handle] of Object.entries(handles)) {
      if (
        px >= handle.x &&
        px <= handle.x + HANDLE_SIZE &&
        py >= handle.y &&
        py <= handle.y + HANDLE_SIZE
      ) {
        return name;
      }
    }
    return null;
  };

  // Check if point is inside crop area
  const isInsideCropArea = (px, py) => {
    const { x, y, width, height } = cropArea;
    return px >= x && px <= x + width && py >= y && py <= y + height;
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a handle
    const handle = getHandleAtPoint(mouseX, mouseY);
    if (handle) {
      setDragMode(handle);
      setIsDragging(true);
      setDragStart({ x: mouseX, y: mouseY });
      setInitialCropArea({ ...cropArea });
      return;
    }

    // Check if clicking inside crop area to move it
    if (isInsideCropArea(mouseX, mouseY)) {
      setDragMode('move');
      setIsDragging(true);
      setDragStart({ x: mouseX, y: mouseY });
      setInitialCropArea({ ...cropArea });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !initialCropArea) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;

    let newCropArea = { 
      x: initialCropArea.x,
      y: initialCropArea.y,
      width: initialCropArea.width,
      height: initialCropArea.height
    };

    if (dragMode === 'move') {
      // Move the entire crop area
      newCropArea.x = Math.max(0, Math.min(imageWidth - initialCropArea.width, initialCropArea.x + dx));
      newCropArea.y = Math.max(0, Math.min(imageHeight - initialCropArea.height, initialCropArea.y + dy));
    } else {
      // Resize based on handle
      if (validAspectRatio !== null) {
        // Maintain aspect ratio during resize
        switch (dragMode) {
          case 'nw':
          case 'ne':
          case 'sw':
          case 'se': {
            // Corner handles - resize based on diagonal drag
            const newWidth = dragMode.includes('e') 
              ? Math.max(MIN_SIZE, initialCropArea.width + dx)
              : Math.max(MIN_SIZE, initialCropArea.width - dx);
            const newHeight = newWidth / validAspectRatio;
            
            // Adjust if we're dragging from top
            if (dragMode.includes('n')) {
              newCropArea.y = initialCropArea.y + initialCropArea.height - newHeight;
            }
            if (dragMode.includes('w')) {
              newCropArea.x = initialCropArea.x + initialCropArea.width - newWidth;
            }
            
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
            break;
          }
          default:
            // Edge handles disabled when aspect ratio is locked
            return;
        }
      } else {
        // Free resize without aspect ratio
        switch (dragMode) {
          case 'nw': {
            // Calculate new dimensions first
            const nwWidth = Math.max(MIN_SIZE, initialCropArea.width - dx);
            const nwHeight = Math.max(MIN_SIZE, initialCropArea.height - dy);
            // Calculate new positions based on bottom-right corner staying fixed
            const nwRight = initialCropArea.x + initialCropArea.width;
            const nwBottom = initialCropArea.y + initialCropArea.height;
            newCropArea.x = Math.max(0, nwRight - nwWidth);
            newCropArea.y = Math.max(0, nwBottom - nwHeight);
            newCropArea.width = nwRight - newCropArea.x;
            newCropArea.height = nwBottom - newCropArea.y;
            break;
          }
          case 'ne': {
            // Right side moves with dx, top moves with dy
            const neHeight = Math.max(MIN_SIZE, initialCropArea.height - dy);
            const neBottom = initialCropArea.y + initialCropArea.height;
            newCropArea.y = Math.max(0, neBottom - neHeight);
            newCropArea.width = Math.max(MIN_SIZE, initialCropArea.width + dx);
            newCropArea.height = neBottom - newCropArea.y;
            break;
          }
          case 'sw': {
            // Left side moves with dx, bottom moves with dy
            const swWidth = Math.max(MIN_SIZE, initialCropArea.width - dx);
            const swRight = initialCropArea.x + initialCropArea.width;
            newCropArea.x = Math.max(0, swRight - swWidth);
            newCropArea.width = swRight - newCropArea.x;
            newCropArea.height = Math.max(MIN_SIZE, initialCropArea.height + dy);
            break;
          }
          case 'se':
            newCropArea.width = Math.max(MIN_SIZE, initialCropArea.width + dx);
            newCropArea.height = Math.max(MIN_SIZE, initialCropArea.height + dy);
            break;
          case 'n': {
            // Top edge moves, bottom stays fixed
            const nHeight = Math.max(MIN_SIZE, initialCropArea.height - dy);
            const nBottom = initialCropArea.y + initialCropArea.height;
            newCropArea.y = Math.max(0, nBottom - nHeight);
            newCropArea.height = nBottom - newCropArea.y;
            break;
          }
          case 's': {
            newCropArea.height = Math.max(MIN_SIZE, initialCropArea.height + dy);
            break;
          }
          case 'e': {
            newCropArea.width = Math.max(MIN_SIZE, initialCropArea.width + dx);
            break;
          }
          case 'w': {
            // Left edge moves, right stays fixed
            const wWidth = Math.max(MIN_SIZE, initialCropArea.width - dx);
            const wRight = initialCropArea.x + initialCropArea.width;
            newCropArea.x = Math.max(0, wRight - wWidth);
            newCropArea.width = wRight - newCropArea.x;
            break;
          }
        }
      }

      // Ensure crop area stays within image bounds
      if (newCropArea.x + newCropArea.width > imageWidth) {
        newCropArea.width = imageWidth - newCropArea.x;
      }
      if (newCropArea.y + newCropArea.height > imageHeight) {
        newCropArea.height = imageHeight - newCropArea.y;
      }
    }

    setCropArea(newCropArea);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragStart({ x: 0, y: 0 });
    setInitialCropArea(null);
  };

  const handleConfirm = () => {
    const safeArea = {
      x: sanitizeNumber(cropArea.x, 0),
      y: sanitizeNumber(cropArea.y, 0),
      width: sanitizeNumber(cropArea.width, MIN_SIZE),
      height: sanitizeNumber(cropArea.height, MIN_SIZE)
    };

    const clampedWidth = Math.min(imageWidth, Math.max(MIN_SIZE, safeArea.width));
    const clampedHeight = Math.min(imageHeight, Math.max(MIN_SIZE, safeArea.height));

    // Convert crop area to percentage-based coordinates for backend
    const cropData = {
      x: Math.round(Math.max(0, Math.min(imageWidth - clampedWidth, safeArea.x))),
      y: Math.round(Math.max(0, Math.min(imageHeight - clampedHeight, safeArea.y))),
      width: Math.round(clampedWidth),
      height: Math.round(clampedHeight)
    };
    onCropComplete?.(cropData);
  };

  const handleCancelCrop = () => {
    onCancel?.();
  };

  // Update cursor based on hover position
  const handleMouseHover = (e) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const handle = getHandleAtPoint(mouseX, mouseY);
    if (handle) {
      const handles = getHandles();
      canvas.style.cursor = handles[handle].cursor;
    } else if (isInsideCropArea(mouseX, mouseY)) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, imageWidth, imageHeight);

    // Draw semi-transparent overlay over non-cropped area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, imageWidth, imageHeight);

    // Clear the crop area (make it transparent to show image underneath)
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw handles - calculate positions inline
    const { x, y, width, height } = cropArea;
    const handles = {
      nw: { x: x - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 },
      ne: { x: x + width - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 },
      sw: { x: x - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 },
      se: { x: x + width - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 },
    };
    
    // Only show edge handles when aspect ratio is not locked
    if (validAspectRatio === null) {
      handles.n = { x: x + width / 2 - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 };
      handles.s = { x: x + width / 2 - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 };
      handles.e = { x: x + width - HANDLE_SIZE / 2, y: y + height / 2 - HANDLE_SIZE / 2 };
      handles.w = { x: x - HANDLE_SIZE / 2, y: y + height / 2 - HANDLE_SIZE / 2 };
    }
    
    ctx.fillStyle = '#3b82f6';
    Object.values(handles).forEach(handle => {
      ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    });

    // Draw grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropArea.x + cropArea.width / 3, cropArea.y);
    ctx.lineTo(cropArea.x + cropArea.width / 3, cropArea.y + cropArea.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cropArea.x + (2 * cropArea.width) / 3, cropArea.y);
    ctx.lineTo(cropArea.x + (2 * cropArea.width) / 3, cropArea.y + cropArea.height);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(cropArea.x, cropArea.y + cropArea.height / 3);
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + cropArea.height / 3);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cropArea.x, cropArea.y + (2 * cropArea.height) / 3);
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + (2 * cropArea.height) / 3);
    ctx.stroke();
  }, [cropArea, imageWidth, imageHeight, validAspectRatio]);

  return (
    <div className={styles.cropToolContainer}>
      <canvas
        ref={canvasRef}
        width={imageWidth}
        height={imageHeight}
        className={styles.cropCanvas}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleMouseHover(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className={styles.cropControls}>
        <div className={styles.cropInfo}>
          <span>
            {Math.round(sanitizeNumber(cropArea.width, 0))} × {Math.round(sanitizeNumber(cropArea.height, 0))} px
          </span>
        </div>
        <div className={styles.cropButtons}>
          <button className={styles.cancelButton} onClick={handleCancelCrop}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropTool;
