import React, { useRef, useEffect, useState } from 'react';
import styles from './DrawingLayer.module.css';

const DrawingLayer = ({ 
    activeTool, 
    brushSettings, 
    textSettings, 
    width, 
    height, 
    applyTrigger, 
    cancelTrigger,
    onApplyComplete,
    imageUrl
}) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [textElements, setTextElements] = useState([]); // Array of {x, y, text, color, size, font}
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // Track the last processed trigger to avoid infinite loops when image updates
    const lastProcessedTrigger = useRef(0);

    // Reset canvas when tool changes or cancel is triggered
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        setTextElements([]);
    }, [activeTool, cancelTrigger, width, height]);

    // Handle Apply Trigger - Composite the original image with the drawing
    useEffect(() => {
        if (applyTrigger > lastProcessedTrigger.current) {
            lastProcessedTrigger.current = applyTrigger;
            
            const canvas = canvasRef.current;
            if (!canvas || !imageUrl) return;
            
            // Create a temporary canvas for compositing
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = width;
            compositeCanvas.height = height;
            const ctx = compositeCanvas.getContext('2d');
            
            // Load the original image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Draw the original image first
                ctx.drawImage(img, 0, 0, width, height);
                
                // Draw the overlay (brush strokes or text) on top
                ctx.drawImage(canvas, 0, 0);
                
                // Convert to blob and send to parent
                compositeCanvas.toBlob((blob) => {
                    if (blob) {
                        onApplyComplete(blob);
                    }
                }, 'image/jpeg', 0.95);
            };
            img.onerror = () => {
                console.error('Failed to load image for compositing');
            };
            img.src = imageUrl;
        }
    }, [applyTrigger, imageUrl, width, height, onApplyComplete]);

    // Text Tool: Update text element when settings change
    useEffect(() => {
        if (activeTool === 'text') {
            setTextElements(prev => {
                if (prev.length === 0) {
                    return [{
                        x: width / 2,
                        y: height / 2,
                        ...textSettings
                    }];
                }
                // Update existing
                return [{
                    ...prev[0],
                    ...textSettings
                }];
            });
        }
    }, [textSettings, activeTool, width, height]);

    // Draw text preview
    useEffect(() => {
        if (activeTool === 'text') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            
            textElements.forEach(el => {
                ctx.font = `${el.size}px ${el.font}`;
                ctx.fillStyle = el.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.text, el.x, el.y);
                
                // Draw selection box if needed
                // const metrics = ctx.measureText(el.text);
                // ctx.strokeRect(el.x - metrics.width/2, el.y - el.size/2, metrics.width, el.size);
            });
        }
    }, [textElements, activeTool, width, height]);


    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        if (activeTool === 'brush') {
            setIsDrawing(true);
            setLastPos(getMousePos(e));
        } else if (activeTool === 'text') {
            const pos = getMousePos(e);
            const el = textElements[0];
            
            if (el) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.font = `${el.size}px ${el.font}`;
                const metrics = ctx.measureText(el.text);
                const halfWidth = metrics.width / 2;
                const halfHeight = el.size / 2;

                // Check if clicking on text
                if (pos.x >= el.x - halfWidth && pos.x <= el.x + halfWidth &&
                    pos.y >= el.y - halfHeight && pos.y <= el.y + halfHeight) {
                    setIsDrawing(true);
                    setDragOffset({
                        x: pos.x - el.x,
                        y: pos.y - el.y
                    });
                } else {
                    // Clicked outside - move text here
                    setTextElements([{ ...el, x: pos.x, y: pos.y }]);
                    setIsDrawing(true);
                    setDragOffset({ x: 0, y: 0 });
                }
            }
        }
    };

    const draw = (e) => {
        const pos = getMousePos(e);

        // Cursor feedback for text tool
        if (activeTool === 'text' && textElements.length > 0) {
            const el = textElements[0];
            const ctx = canvasRef.current.getContext('2d');
            ctx.font = `${el.size}px ${el.font}`;
            const metrics = ctx.measureText(el.text);
            const halfWidth = metrics.width / 2;
            const halfHeight = el.size / 2;

            if (isDrawing || (pos.x >= el.x - halfWidth && pos.x <= el.x + halfWidth &&
                pos.y >= el.y - halfHeight && pos.y <= el.y + halfHeight)) {
                canvasRef.current.style.cursor = 'move';
            } else {
                canvasRef.current.style.cursor = 'crosshair';
            }
        } else if (activeTool === 'brush') {
             canvasRef.current.style.cursor = 'crosshair';
        }

        if (!isDrawing) return;

        if (activeTool === 'brush') {
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = brushSettings.color;
            ctx.lineWidth = brushSettings.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = brushSettings.opacity / 100;
            ctx.stroke();
            setLastPos(pos);
        } else if (activeTool === 'text') {
            // Drag text
            setTextElements(prev => [{
                ...prev[0],
                x: pos.x - dragOffset.x,
                y: pos.y - dragOffset.y
            }]);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    if (activeTool !== 'brush' && activeTool !== 'text') return null;

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={styles.drawingCanvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};

export default DrawingLayer;
