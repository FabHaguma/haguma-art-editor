# Feature Status & Implementation Plan

This document tracks the current status of features against the Haguma Art Editor Iteration Plan.

## Current Status: Iteration 1 (The Essential Transformer) - **Mostly Complete**

The core functionality for uploading, resizing, rotating, and downloading images is implemented.

### Implemented Features
- **Backend (Python Flask & Pillow):**
  - [x] `POST /api/upload`: Handles image upload, validation, and session creation.
  - [x] `POST /api/process/<id>/resize`: Supports width, height, percentage, and aspect ratio.
  - [x] `POST /api/process/<id>/rotate`: Supports 90, -90, 180 degree rotation.
  - [x] `GET /api/download/<id>`: Serves the processed image.
  - [x] Basic error handling and file validation.

- **Frontend (Vite React):**
  - [x] `ImageUploadArea`: Drag & drop and file input.
  - [x] `ImagePreview`: Displays the current image.
  - [x] `MetadataDisplay`: Shows dimensions, format, and size.
  - [x] `ResizeControls`: UI for resizing operations.
  - [x] `RotateControls`: UI for rotation operations.
  - [x] `Sidebar`: Container for tools and download button.
  - [x] `apiService.js`: Connects to the implemented backend endpoints.

### Fixes / Refinements Needed
- **Frontend:**
  - [x] `Sidebar.jsx`: Cleaned up and styles added.
  - [x] `DownloadButton`: Extracted into a separate component to support future enhancements.
  - [x] `theme.css`: Populated with CSS variables.

---

## Pending Features: Iteration 2 (Enhanced Manipulations & Output Control)

**Status: Complete**

### Backend Tasks
- [x] **Implement Flip Endpoint:**
  - Create `POST /api/process/<id>/flip` accepting `axis` ('horizontal', 'vertical').
  - Update `image_service.py` with flip logic.
- [x] **Implement Crop Endpoint:**
  - Create `POST /api/process/<id>/crop` accepting `preset` names.
  - Implement logic to map presets (e.g., 'square', '16x9') to dimensions.
- [x] **Implement Grayscale Endpoint:**
  - Create `POST /api/process/<id>/grayscale`.
  - Update `image_service.py` to convert image mode to 'L'.
- [x] **Update Download Endpoint:**
  - Modify `GET /api/download/<id>` to accept `?format=` query parameter.
  - Implement format conversion logic in `image_service.py` before serving.

### Frontend Tasks
- [x] **Create `FlipControls` Component:**
  - Buttons for Horizontal and Vertical flip.
- [x] **Create `CropPresetControls` Component:**
  - UI for selecting crop presets.
- [x] **Create `GrayscaleButton` Component:**
  - Toggle for grayscale effect.
- [x] **Create `SaveOptions` Component:**
  - Dropdown/Selector for output format (JPEG, PNG).
- [x] **Update `Sidebar`:**
  - Integrate new controls.
- [x] **Update `apiService.js`:**
  - Add functions for flip, crop, grayscale, and updated download URL.

---

## Pending Features: Iteration 3 (Fine-Tuning Adjustments & Basic Effects)

**Status: Complete**

### Backend Tasks
- [x] **Implement Brightness Endpoint:**
  - `POST /api/process/<id>/brightness` with `level` parameter.
- [x] **Implement Contrast Endpoint:**
  - `POST /api/process/<id>/contrast` with `level` parameter.
- [x] **Implement Filter Endpoint:**
  - `POST /api/process/<id>/filter` accepting `type` ('blur', 'sharpen').

### Frontend Tasks
- [x] **Create `BrightnessControl` Component:**
  - Slider UI.
- [x] **Create `ContrastControl` Component:**
  - Slider UI.
- [x] **Create `FilterControls` Component:**
  - Buttons for Blur and Sharpen.
- [x] **Update `Sidebar`:**
  - Add "Adjustments" and "Filters" sections.
