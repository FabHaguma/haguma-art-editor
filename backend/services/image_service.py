import os
import uuid
from PIL import Image, UnidentifiedImageError, ImageOps, ImageEnhance, ImageFilter
from werkzeug.utils import secure_filename
import config # Imports from backend/config.py

# --- Helper Functions (can be part of this service or a utils module) ---
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

def get_image_metadata(image_path):
    try:
        with Image.open(image_path) as img:
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "size_bytes": os.path.getsize(image_path)
            }
    except FileNotFoundError:
        # app.logger.error(f"Metadata: File not found {image_path}")
        return None
    except UnidentifiedImageError:
        # app.logger.error(f"Metadata: Unidentified image {image_path}")
        return None
    except Exception as e:
        # app.logger.error(f"Metadata: Generic error for {image_path}: {e}")
        return None


def get_session_filename(session_id, original_extension):
    return f"{session_id}.{original_extension.lower()}"

def get_temp_filepath(session_id, original_extension):
    filename = get_session_filename(session_id, original_extension)
    return os.path.join(config.TEMP_FOLDER, filename)

# --- Core Service Functions ---
def save_uploaded_file(file_storage):
    """
    Saves the uploaded file, validates it, and returns initial metadata.
    Raises ValueError for invalid file type/size, UnidentifiedImageError for bad images.
    """
    if not file_storage or file_storage.filename == '':
        raise ValueError("No file selected.")

    if not allowed_file(file_storage.filename):
        raise ValueError(f"File type not allowed. Allowed: {', '.join(config.ALLOWED_EXTENSIONS)}")

    # Check file size (already checked by Flask's MAX_CONTENT_LENGTH, but good for service layer too)
    file_storage.seek(0, os.SEEK_END)
    file_length = file_storage.tell()
    if file_length > config.MAX_CONTENT_LENGTH:
         raise ValueError(f"File exceeds {config.MAX_FILE_SIZE_MB}MB limit")
    file_storage.seek(0)

    original_filename = secure_filename(file_storage.filename)
    original_extension = original_filename.rsplit('.', 1)[1].lower()
    session_id = str(uuid.uuid4())
    
    session_filename_on_disk = get_session_filename(session_id, original_extension)
    filepath = os.path.join(config.TEMP_FOLDER, session_filename_on_disk)
    
    try:
        file_storage.save(filepath)
        # Verify it's a real image with Pillow
        with Image.open(filepath) as img:
            img.verify() # Verifies header, may not detect all corruption
            # To be more thorough, attempt to load:
            img_loaded = Image.open(filepath)
            img_loaded.load() # Fully loads image data
        
        metadata = get_image_metadata(filepath)
        if not metadata: # Should ideally not happen if verify/load passed
            if os.path.exists(filepath): os.remove(filepath)
            raise UnidentifiedImageError("Could not process image metadata after save.")

        return {
            "image_session_id": session_id,
            "filename": original_filename,
            "original_extension": original_extension,
            "initial_dimensions": {"width": metadata["width"], "height": metadata["height"]},
            "format": metadata["format"],
            "size_bytes": metadata["size_bytes"],
            "filepath_on_server": filepath # For internal use, not sent to client
        }
    except UnidentifiedImageError as e:
        if os.path.exists(filepath): os.remove(filepath)
        # app.logger.warning(f"Upload: UnidentifiedImageError for {original_filename}: {e}")
        raise UnidentifiedImageError(f"Uploaded file '{original_filename}' is not a valid image or format is unsupported.")
    except Exception as e: # Catch other saving/Pillow errors
        if os.path.exists(filepath): os.remove(filepath)
        # app.logger.error(f"Upload: Generic error for {original_filename}: {e}")
        raise ValueError(f"An unexpected error occurred processing '{original_filename}'.")


def process_resize(filepath, width_px=None, height_px=None, percentage=None, maintain_aspect_ratio=True):
    """
    Resizes the image at the given filepath.
    Returns new metadata or raises ValueError/FileNotFoundError.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    try:
        with Image.open(filepath) as img:
            original_width, original_height = img.size
            new_width, new_height = original_width, original_height

            if percentage:
                if not (0 < float(percentage) <= 1000): # Allow up to 10x, min > 0
                    raise ValueError("Percentage must be between 1 and 1000.")
                scale_factor = float(percentage) / 100.0
                new_width = int(original_width * scale_factor)
                new_height = int(original_height * scale_factor)
            elif width_px or height_px:
                target_w = int(width_px) if width_px else None
                target_h = int(height_px) if height_px else None

                if not target_w and not target_h:
                     raise ValueError("Either width, height, or percentage must be provided for resize.")

                if maintain_aspect_ratio:
                    aspect_ratio = original_width / original_height
                    if target_w and not target_h:
                        new_width = target_w
                        new_height = int(target_w / aspect_ratio)
                    elif target_h and not target_w:
                        new_height = target_h
                        new_width = int(target_h * aspect_ratio)
                    elif target_w and target_h:
                        # Scale to fit within bounds while preserving ratio
                        # This effectively means using the more restrictive dimension
                        img_aspect_ratio = original_width / original_height
                        target_aspect_ratio = target_w / target_h
                        if img_aspect_ratio > target_aspect_ratio: # Image is wider than target box
                            new_width = target_w
                            new_height = int(target_w / img_aspect_ratio)
                        else: # Image is taller or same aspect as target box
                            new_height = target_h
                            new_width = int(target_h * img_aspect_ratio)
                    else: # No dimensions given (should be caught by earlier check)
                        pass
                else: # Not maintaining aspect ratio
                    if target_w: new_width = target_w
                    if target_h: new_height = target_h
            else:
                raise ValueError("No valid resize parameters provided (width, height, or percentage).")
            
            new_width = max(1, new_width if new_width is not None else original_width)
            new_height = max(1, new_height if new_height is not None else original_height)
            
            # Use ImageOps.contain if you want to ensure it fits AND pads if necessary
            # For simple resize:
            resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            resized_img.save(filepath) # Overwrite the temp file

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after resize.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError: # Should be caught by initial check
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except (ValueError, TypeError) as e: # Catch Pillow errors or type errors on params
        raise ValueError(f"Invalid resize parameters or image error: {e}")
    except Exception as e:
        # app.logger.error(f"Resize service error: {e}")
        raise RuntimeError(f"An unexpected error occurred during resize: {e}")


def process_rotate(filepath, angle):
    """
    Rotates the image at the given filepath. Angle is user-facing (90 CW, -90 CCW, 180).
    Returns new metadata or raises ValueError/FileNotFoundError.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")
    
    if angle not in [90, -90, 180]:
        raise ValueError("Invalid rotation angle. Must be 90, -90, or 180.")

    try:
        with Image.open(filepath) as img:
            pil_angle = angle
            if angle == 90: pil_angle = -90    # PIL rotates counter-clockwise
            elif angle == -90: pil_angle = 90
            
            rotated_img = img.rotate(pil_angle, expand=True, resample=Image.Resampling.BICUBIC)
            rotated_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after rotate.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        # app.logger.error(f"Rotate service error: {e}")
        raise RuntimeError(f"An unexpected error occurred during rotation: {e}")


def process_flip(filepath, axis):
    """
    Flips the image at the given filepath.
    axis: 'horizontal' or 'vertical'
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")
    
    if axis not in ['horizontal', 'vertical']:
        raise ValueError("Invalid flip axis. Must be 'horizontal' or 'vertical'.")

    try:
        with Image.open(filepath) as img:
            if axis == 'horizontal':
                flipped_img = img.transpose(Image.FLIP_LEFT_RIGHT)
            else:
                flipped_img = img.transpose(Image.FLIP_TOP_BOTTOM)
            
            flipped_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after flip.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during flip: {e}")


def process_grayscale(filepath, intensity=100):
    """
    Converts the image at the given filepath to grayscale.
    intensity: 0 to 100 (0 = original color, 100 = full grayscale)
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    try:
        # Map intensity (0-100) to saturation factor (1.0 to 0.0)
        # 0 intensity -> 1.0 saturation (original)
        # 100 intensity -> 0.0 saturation (gray)
        factor = 1.0 - (float(intensity) / 100.0)
        factor = max(0.0, min(1.0, factor))

        with Image.open(filepath) as img:
            # Use ImageEnhance.Color for partial grayscale (desaturation)
            enhancer = ImageEnhance.Color(img)
            grayscale_img = enhancer.enhance(factor)
            grayscale_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after grayscale conversion.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"],
            "format": updated_metadata["format"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during grayscale conversion: {e}")


def process_crop(filepath, preset):
    """
    Crops the image based on a preset aspect ratio.
    preset: 'square', '16x9', '4x6', 'a4'
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    # Define ratios (width / height)
    ratios = {
        'square': 1.0,
        '16x9': 16.0 / 9.0,
        '4x6': 4.0 / 6.0, # Portrait 4x6
        'a4': 1.0 / 1.414 # Portrait A4
    }
    
    # Handle landscape/portrait variants or just fixed ratios?
    # For MVP, let's check image orientation and adapt the ratio if needed to maximize crop area
    # Or just strictly follow the preset name. Let's try to be smart:
    # If image is landscape and preset is '4x6' (portrait), maybe we should use 6x4?
    # For now, let's stick to the requested presets. 'square' is easy.
    # '16x9' is usually landscape. '4x6' is usually portrait.
    
    target_ratio = ratios.get(preset)
    if not target_ratio:
        # Try to parse if it's like "16:9" or "4:3"
        try:
            if ':' in preset:
                w, h = map(float, preset.split(':'))
                target_ratio = w / h
            else:
                 raise ValueError(f"Unknown crop preset: {preset}")
        except ValueError:
             raise ValueError(f"Invalid crop preset: {preset}")

    try:
        with Image.open(filepath) as img:
            width, height = img.size
            current_ratio = width / height
            
            # Calculate crop box to center the crop
            if current_ratio > target_ratio:
                # Image is wider than target, crop width
                new_width = int(height * target_ratio)
                new_height = height
                left = (width - new_width) // 2
                top = 0
                right = left + new_width
                bottom = height
            else:
                # Image is taller than target, crop height
                new_width = width
                new_height = int(width / target_ratio)
                left = 0
                top = (height - new_height) // 2
                right = width
                bottom = top + new_height
            
            cropped_img = img.crop((left, top, right, bottom))
            cropped_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after crop.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during crop: {e}")


def process_custom_crop(filepath, x, y, width, height):
    """
    Crops the image to the exact coordinates specified.
    x, y: top-left corner of the crop area
    width, height: dimensions of the crop area
    All values are in pixels.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    # Validate parameters
    if not all(isinstance(val, (int, float)) for val in [x, y, width, height]):
        raise ValueError("All crop parameters must be numbers.")
    
    if width <= 0 or height <= 0:
        raise ValueError("Crop width and height must be positive.")
    
    if x < 0 or y < 0:
        raise ValueError("Crop x and y coordinates must be non-negative.")

    try:
        with Image.open(filepath) as img:
            img_width, img_height = img.size
            
            # Validate crop area is within image bounds
            if x + width > img_width or y + height > img_height:
                raise ValueError(f"Crop area exceeds image bounds. Image size: {img_width}x{img_height}, Crop area: {x},{y} to {x+width},{y+height}")
            
            # PIL crop uses (left, upper, right, lower) tuple
            left = int(x)
            upper = int(y)
            right = int(x + width)
            lower = int(y + height)
            
            cropped_img = img.crop((left, upper, right, lower))
            cropped_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
            raise ValueError("Could not get metadata after custom crop.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during custom crop: {e}")



def convert_format(filepath, target_format):
    """
    Converts the image to the target format and returns the path to the new file.
    Does NOT overwrite the original session file.
    Returns (new_filepath, mimetype)
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found.")

    target_format = target_format.lower()
    if target_format not in ['jpeg', 'jpg', 'png', 'gif', 'bmp']:
        raise ValueError("Unsupported target format.")
    
    if target_format == 'jpg': target_format = 'jpeg'

    try:
        # Create a temp file for the download
        directory, filename = os.path.split(filepath)
        name, _ = os.path.splitext(filename)
        new_filename = f"{name}_converted.{target_format}"
        new_filepath = os.path.join(directory, new_filename)
        
        with Image.open(filepath) as img:
            # Convert mode if necessary (e.g. RGBA to JPEG requires RGB)
            if target_format == 'jpeg' and img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            img.save(new_filepath, format=target_format.upper())
            
        return new_filepath
    except Exception as e:
        raise RuntimeError(f"Error converting format: {e}")


def process_brightness(filepath, level):
    """
    Adjusts the brightness of the image.
    level: Integer from -100 to 100.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    try:
        # Map level (-100 to 100) to factor (0.0 to 2.0)
        # 0 -> 1.0 (original)
        # -100 -> 0.0 (black)
        # 100 -> 2.0 (double brightness)
        factor = 1.0 + (float(level) / 100.0)
        factor = max(0.0, factor) # Ensure non-negative

        with Image.open(filepath) as img:
            enhancer = ImageEnhance.Brightness(img)
            enhanced_img = enhancer.enhance(factor)
            enhanced_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after brightness adjustment.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during brightness adjustment: {e}")


def process_contrast(filepath, level):
    """
    Adjusts the contrast of the image.
    level: Integer from -100 to 100.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    try:
        # Map level (-100 to 100) to factor (0.0 to 2.0)
        # 0 -> 1.0 (original)
        # -100 -> 0.0 (gray)
        # 100 -> 2.0 (high contrast)
        factor = 1.0 + (float(level) / 100.0)
        factor = max(0.0, factor)

        with Image.open(filepath) as img:
            enhancer = ImageEnhance.Contrast(img)
            enhanced_img = enhancer.enhance(factor)
            enhanced_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after contrast adjustment.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during contrast adjustment: {e}")


def process_filter(filepath, filter_type, intensity=0):
    """
    Applies a filter to the image.
    filter_type: 'blur', 'sharpen'
    intensity: 0 to 100
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError("Image file not found for processing.")

    if filter_type not in ['blur', 'sharpen']:
        raise ValueError("Invalid filter type. Must be 'blur' or 'sharpen'.")

    try:
        with Image.open(filepath) as img:
            if filter_type == 'blur':
                # Map intensity 0-100 to radius 0-10
                radius = float(intensity) / 10.0
                if radius > 0:
                    filtered_img = img.filter(ImageFilter.GaussianBlur(radius=radius))
                else:
                    filtered_img = img # No change
            elif filter_type == 'sharpen':
                # Map intensity 0-100 to sharpness factor 1.0-3.0
                # 0 -> 1.0 (original)
                # 100 -> 3.0 (extra sharp)
                factor = 1.0 + (float(intensity) / 50.0)
                enhancer = ImageEnhance.Sharpness(img)
                filtered_img = enhancer.enhance(factor)
            
            filtered_img.save(filepath)

        updated_metadata = get_image_metadata(filepath)
        if not updated_metadata:
             raise ValueError("Could not get metadata after filter application.")
        return {
            "new_dimensions": {"width": updated_metadata["width"], "height": updated_metadata["height"]},
            "new_size_bytes": updated_metadata["size_bytes"]
        }
    except FileNotFoundError:
        raise
    except UnidentifiedImageError:
        raise ValueError("Cannot process this image type or image is corrupt.")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during filter application: {e}")

