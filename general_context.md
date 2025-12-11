# Haguma Art Editor

---

## Haguma Art Editor: Iteration Plan

Here’s a 3-iteration plan to develop the Haguma Art Editor:

---

### **Iteration 1: The Essential Transformer**

1.  **Iteration Title & Core Objective:**

    - **Title:** The Essential Transformer
    - **Core Objective:** To deliver a functional web application allowing users to upload an image, perform the most fundamental transformations (resize, rotate), and download the result. This establishes the core client-server interaction and file handling pipeline.

2.  **Key Features (Backend - Python Flask & Pillow):**

    - **API Endpoints:**
      - `POST /api/upload`:
        - Accepts image file (JPEG, PNG primarily; GIF, BMP as stretch).
        - Temporarily stores the uploaded image on the server.
        - Returns a unique image session ID and basic metadata (filename, initial dimensions, format, size).
      - `POST /api/process/<image_session_id>/resize`:
        - Accepts parameters: `width` (px), `height` (px), `percentage` (%), `maintain_aspect_ratio` (boolean).
        - Performs resizing using Pillow.
        - Overwrites the temporary image or creates a new version associated with the session.
        - Returns updated image metadata (new dimensions, size).
      - `POST /api/process/<image_session_id>/rotate`:
        - Accepts parameter: `angle` (90, -90, 180).
        - Performs rotation using Pillow.
        - Overwrites the temporary image or creates a new version.
        - Returns updated image metadata.
      - `GET /api/download/<image_session_id>`:
        - Serves the currently processed image for download.
        - Initially, will save in the original format or a default (e.g., PNG).
    - **Database Changes:** None for this iteration (using temporary file storage with session IDs).
    - **Core Business Logic:**
      - Image file validation (format, basic security checks).
      - Temporary file management (creation, deletion after session timeout or explicit clear).
      - Pillow integration for resize and rotate operations.
      - Metadata extraction (dimensions, file size, format).

3.  **Key Features (Frontend - Vite React JS & CSS Modules):**

    - **Pages/Views:**
      - Single-page application layout.
    - **Components:**
      - `ImageUploadArea`: Drag & drop zone, file input fallback. Displays loading state.
      - `ImagePreview`: Displays the currently loaded/processed image.
      - `MetadataDisplay`: Shows File Size, Dimensions, Format (from `/api/upload` response).
      - `ResizeControls`: Input fields for width, height, percentage; checkbox for aspect ratio. "Apply Resize" button.
      - `RotateControls`: Buttons for 90° CW, 90° CCW, 180°.
      - `DownloadButton`: Triggers image download.
    - **User Interactions:**
      - User drags & drops or selects an image.
      - Image preview updates after upload.
      - User inputs resize parameters, clicks apply; preview updates.
      - User clicks rotate buttons; preview updates.
      - User clicks download to save the image.
    - **UI Enhancements:**
      - Clear visual feedback for upload progress and processing.
      - Responsive layout for common screen sizes.

4.  **Key Deliverables:**

    - A deployed web application (via Docker Compose & Caddy for HTTPS).
    - Users can upload JPEG/PNG images.
    - Users can view basic image metadata.
    - Users can resize images by pixels or percentage, with aspect ratio control.
    - Users can rotate images (90°, -90°, 180°).
    - Users can download the edited image.
    - Basic error handling (e.g., invalid file type).

5.  **Out of Scope (for this iteration):**

    - Flip functionality.
    - Crop to Presets.
    - Grayscale, Brightness, Contrast adjustments.
    - Simple Filters (Blur/Sharpen).
    - Saving in _different_ formats (will save in original or a fixed default).
    - Advanced cropping UI.
    - Undo/Redo.
    - GIF/BMP support if time is constrained (focus on JPEG/PNG).

6.  **Integration Strategy (for subsequent iterations):**
    - **Backend:** New processing features (Flip, Crop, Grayscale, etc.) will be added as new `POST /api/process/<image_session_id>/<action_name>` endpoints. The core image session management and file handling will be reused.
    - **Frontend:** New UI control panels (e.g., `FlipControls`, `CropPresetControls`) will be added. These will call the new backend endpoints and update the existing `ImagePreview` component. The overall application structure will remain, with new modules plugged in.

---

### **Iteration 2: Enhanced Manipulations & Output Control**

1.  **Iteration Title & Core Objective:**

    - **Title:** Enhanced Manipulations & Output Control
    - **Core Objective:** To expand the editor's capabilities with more core transformations (Flip, Crop to Presets), a basic image effect (Grayscale), and control over the output format.

2.  **Key Features (Backend - Python Flask & Pillow):**

    - **New API Endpoints:**
      - `POST /api/process/<image_session_id>/flip`:
        - Accepts parameter: `axis` ('horizontal', 'vertical').
        - Performs flip using Pillow.
        - Returns updated image metadata.
      - `POST /api/process/<image_session_id>/crop`:
        - Accepts parameter: `preset` (e.g., 'a4', '4x6', 'square_3x3', '16x9') or specific coordinates/dimensions if we simplify presets to fixed sizes initially.
        - Backend logic maps preset names to actual crop dimensions based on the current image.
        - Performs crop using Pillow.
        - Returns updated image metadata.
      - `POST /api/process/<image_session_id>/grayscale`:
        - No parameters needed.
        - Converts image to grayscale using Pillow.
        - Returns updated image metadata.
    - **Updates to Existing API Endpoints:**
      - `GET /api/download/<image_session_id>`:
        - Add optional query parameter `format` (e.g., `?format=jpeg`, `?format=png`).
        - Backend handles conversion to the specified format using Pillow before sending.
    - **Database Changes:** None.
    - **Core Business Logic:**
      - Pillow integration for Flip, Crop (preset-based), Grayscale.
      - Logic to map preset names to crop dimensions/ratios.
      - Pillow integration for saving in different formats (JPEG, PNG).
      - Expanded image format support for upload (GIF, BMP) if not fully covered in Iteration 1.

3.  **Key Features (Frontend - Vite React JS & CSS Modules):**

    - **New Components:**
      - `FlipControls`: Buttons for "Horizontal Flip" and "Vertical Flip".
      - `CropPresetControls`: Dropdown or set of buttons for predefined crop presets (A4, 4x6, 3x3, 16x9). "Apply Crop" button.
      - `GrayscaleButton`: A toggle or button to apply/remove grayscale.
      - `SaveOptions`: Dropdown to select output format (JPEG, PNG) before clicking the main `DownloadButton`.
    - **Updates to Existing Components:**
      - `DownloadButton`: Logic modified to include the selected format from `SaveOptions` when calling the download API.
      - `MetadataDisplay`: Ensure it refreshes accurately after any new operation.
    - **User Interactions:**
      - User selects flip option; preview updates.
      - User selects crop preset, clicks apply; preview updates.
      - User clicks grayscale button; preview updates.
      - User selects desired output format before downloading.

4.  **Key Deliverables:**

    - All deliverables from Iteration 1, plus:
    - Image Flip (Horizontal, Vertical).
    - Crop to Presets functionality.
    - Grayscale conversion.
    - Ability to save/download the edited image in JPEG or PNG format.
    - Support for GIF and BMP uploads (if not in Iteration 1).

5.  **Out of Scope (for this iteration):**

    - Brightness, Contrast adjustments.
    - Simple Filters (Blur/Sharpen beyond Grayscale).
    - Custom angle rotation.
    - Free-form crop selection.
    - Advanced filters, text overlay, stickers.
    - Undo/Redo.

6.  **Integration Strategy (for subsequent iterations):**
    - **Backend:** Further image adjustment features (Brightness, Contrast, Filters) will be added as new `POST /api/process/<image_session_id>/<action_name>` endpoints, similar to previous additions.
    - **Frontend:** New UI control components (sliders for brightness/contrast, buttons for filters) will be developed and integrated into the main layout, calling their respective new backend endpoints.

---

### **Iteration 3: Fine-Tuning Adjustments & Basic Effects**

1.  **Iteration Title & Core Objective:**

    - **Title:** Fine-Tuning Adjustments & Basic Effects
    - **Core Objective:** To introduce common image adjustments (Brightness, Contrast) and simple filters (Blur, Sharpen), providing users with more nuanced control over their image's appearance.

2.  **Key Features (Backend - Python Flask & Pillow):**

    - **New API Endpoints:**
      - `POST /api/process/<image_session_id>/brightness`:
        - Accepts parameter: `level` (e.g., a value from -100 to 100, or a factor).
        - Adjusts brightness using Pillow's `ImageEnhance.Brightness`.
        - Returns updated image metadata.
      - `POST /api/process/<image_session_id>/contrast`:
        - Accepts parameter: `level` (e.g., a value from -100 to 100, or a factor).
        - Adjusts contrast using Pillow's `ImageEnhance.Contrast`.
        - Returns updated image metadata.
      - `POST /api/process/<image_session_id>/filter`:
        - Accepts parameter: `type` ('blur', 'sharpen').
        - Optionally, `radius` for blur or `strength` for sharpen.
        - Applies Gaussian Blur or Sharpen filter using Pillow's `ImageFilter`.
        - Returns updated image metadata.
    - **Database Changes:** None.
    - **Core Business Logic:**
      - Pillow integration for Brightness, Contrast adjustments.
      - Pillow integration for Gaussian Blur and Sharpen filters.
      - Defining appropriate ranges/factors for adjustment levels.

3.  **Key Features (Frontend - Vite React JS & CSS Modules):**

    - **New Components:**
      - `BrightnessControl`: Slider or input field to set brightness level. "Apply Brightness" button.
      - `ContrastControl`: Slider or input field to set contrast level. "Apply Contrast" button.
      - `FilterControls`: Buttons for "Apply Blur" and "Apply Sharpen." (Could later expand to a dropdown with parameters).
    - **User Interactions:**
      - User adjusts brightness/contrast slider/input, clicks apply; preview updates.
      - User clicks blur/sharpen button; preview updates.
    - **UI Enhancements:**
      - Sliders should provide good visual feedback of the selected level.

4.  **Key Deliverables:**

    - All deliverables from Iteration 2, plus:
    - Brightness adjustment.
    - Contrast adjustment.
    - Simple filters: Gaussian Blur, Sharpen.
    - A well-rounded basic image editor covering all PRD MVP and "Easy-to-Implement" features.

5.  **Out of Scope (for this iteration):**
    - Custom angle rotation via slider.
    - Free-form crop selection with a draggable/resizable UI.
    - More diverse filters and effects beyond Blur/Sharpen.
    - Text overlay capabilities.
    - Stickers or graphic overlays.
    - Undo/Redo functionality.
    - Batch processing of images.

---

This 3-iteration plan aims to deliver value incrementally, building upon a stable core established in Iteration 1. Each iteration is deployable and provides a more complete product than the last, with minimal disruption to existing functionality. The "Future Considerations" from the PRD can then be prioritized for Iteration 4 and beyond.
