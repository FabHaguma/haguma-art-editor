from flask import Blueprint, request, jsonify, send_from_directory, current_app
from services import image_service
import config # For TEMP_FOLDER if needed directly, though service should handle paths
import os
from PIL import UnidentifiedImageError # For specific exception handling

image_bp = Blueprint('image_bp', __name__, url_prefix='/api')

@image_bp.route('/upload', methods=['POST'])
def upload_image_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    file = request.files['file']
    
    try:
        # Service function handles file saving, validation, and metadata extraction
        upload_data = image_service.save_uploaded_file(file)
        
        # Return only what the client needs for the session
        return jsonify({
            "image_session_id": upload_data["image_session_id"],
            "filename": upload_data["filename"],
            "original_extension": upload_data["original_extension"],
            "initial_dimensions": upload_data["initial_dimensions"],
            "format": upload_data["format"],
            "size_bytes": upload_data["size_bytes"]
        }), 200
    except ValueError as e: # Catch custom validation errors from service
        current_app.logger.warning(f"Upload validation error: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except UnidentifiedImageError as e: # Catch specific Pillow error
        current_app.logger.warning(f"Upload UnidentifiedImageError: {str(e)}")
        return jsonify({"error": str(e)}), 415 # Unsupported Media Type
    except Exception as e: # Catch-all for unexpected errors
        current_app.logger.error(f"Unexpected upload error: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred during upload."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/resize', methods=['POST'])
def resize_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON payload."}), 400

    try:
        new_metadata = image_service.process_resize(
            filepath,
            width_px=data.get('width_px'),
            height_px=data.get('height_px'),
            percentage=data.get('percentage'),
            maintain_aspect_ratio=data.get('maintain_aspect_ratio', True)
        )
        return jsonify(new_metadata), 200
    except FileNotFoundError: # Should be caught by the check above, but good practice
        return jsonify({"error": "Image file not found for processing."}), 404
    except ValueError as e: # Validation errors from service (e.g. bad params)
        current_app.logger.warning(f"Resize input error for {image_session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e: # Unexpected errors during processing
        current_app.logger.error(f"Resize runtime error for {image_session_id}: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected resize error for {image_session_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred during resize."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/rotate', methods=['POST'])
def rotate_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'angle' not in data:
        return jsonify({"error": "Missing JSON payload or 'angle' parameter."}), 400

    try:
        new_metadata = image_service.process_rotate(filepath, data['angle'])
        return jsonify(new_metadata), 200
    except FileNotFoundError:
        return jsonify({"error": "Image file not found for processing."}), 404
    except ValueError as e: # Validation errors (e.g. bad angle)
        current_app.logger.warning(f"Rotate input error for {image_session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e: # Unexpected errors
        current_app.logger.error(f"Rotate runtime error for {image_session_id}: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected rotate error for {image_session_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred during rotation."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/flip', methods=['POST'])
def flip_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'axis' not in data:
        return jsonify({"error": "Missing JSON payload or 'axis' parameter."}), 400

    try:
        new_metadata = image_service.process_flip(filepath, data['axis'])
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Flip error: {e}", exc_info=True)
        return jsonify({"error": "Server error during flip."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/crop', methods=['POST'])
def crop_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'preset' not in data:
        return jsonify({"error": "Missing JSON payload or 'preset' parameter."}), 400

    try:
        new_metadata = image_service.process_crop(filepath, data['preset'])
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Crop error: {e}", exc_info=True)
        return jsonify({"error": "Server error during crop."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/crop-custom', methods=['POST'])
def crop_custom_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON payload."}), 400

    # Validate required parameters
    required_params = ['x', 'y', 'width', 'height']
    if not all(param in data for param in required_params):
        return jsonify({"error": f"Missing required parameters. Need: {', '.join(required_params)}"}), 400

    try:
        new_metadata = image_service.process_custom_crop(
            filepath, 
            x=data['x'], 
            y=data['y'], 
            width=data['width'], 
            height=data['height']
        )
        return jsonify(new_metadata), 200
    except ValueError as e:
        current_app.logger.warning(f"Custom crop validation error for {image_session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Custom crop error for {image_session_id}: {e}", exc_info=True)
        return jsonify({"error": "Server error during custom crop."}), 500



@image_bp.route('/process/<image_session_id>/<original_extension>/grayscale', methods=['POST'])
def grayscale_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    # Default to 100 if not provided (backward compatibility)
    intensity = data.get('intensity', 100) if data else 100

    try:
        new_metadata = image_service.process_grayscale(filepath, intensity)
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Grayscale error: {e}", exc_info=True)
        return jsonify({"error": "Server error during grayscale conversion."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/brightness', methods=['POST'])
def brightness_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'level' not in data:
        return jsonify({"error": "Missing JSON payload or 'level' parameter."}), 400

    try:
        new_metadata = image_service.process_brightness(filepath, data['level'])
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Brightness error: {e}", exc_info=True)
        return jsonify({"error": "Server error during brightness adjustment."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/contrast', methods=['POST'])
def contrast_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'level' not in data:
        return jsonify({"error": "Missing JSON payload or 'level' parameter."}), 400

    try:
        new_metadata = image_service.process_contrast(filepath, data['level'])
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Contrast error: {e}", exc_info=True)
        return jsonify({"error": "Server error during contrast adjustment."}), 500


@image_bp.route('/process/<image_session_id>/<original_extension>/filter', methods=['POST'])
def filter_image_route(image_session_id, original_extension):
    filepath = image_service.get_temp_filepath(image_session_id, original_extension)
    if not os.path.exists(filepath):
        return jsonify({"error": "Image session not found or file does not exist."}), 404

    data = request.get_json()
    if not data or 'type' not in data:
        return jsonify({"error": "Missing JSON payload or 'type' parameter."}), 400

    intensity = data.get('intensity', 0)

    try:
        new_metadata = image_service.process_filter(filepath, data['type'], intensity)
        return jsonify(new_metadata), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Filter error: {e}", exc_info=True)
        return jsonify({"error": "Server error during filter application."}), 500


@image_bp.route('/download/<image_session_id>/<original_extension>', methods=['GET'])
def download_image_route(image_session_id, original_extension):
    filepath_on_server = image_service.get_temp_filepath(image_session_id, original_extension)

    if not os.path.exists(filepath_on_server):
        return jsonify({"error": "Image not found or session expired."}), 404
    
    # Touch the file to update its modification time for cleanup logic
    try:
        os.utime(filepath_on_server, None)
    except Exception as e:
        current_app.logger.warning(f"Could not update timestamp for {filepath_on_server}: {e}")

    target_format = request.args.get('format')
    
    if target_format:
        try:
            # Convert and get path to temporary converted file
            converted_filepath = image_service.convert_format(filepath_on_server, target_format)
            
            # Serve the converted file
            directory, filename = os.path.split(converted_filepath)
            download_name = f"edited_haguma_art.{target_format.lower()}"
            mime_type = f'image/{target_format.lower()}'
            if target_format.lower() == 'jpg': mime_type = 'image/jpeg'

            # Use send_file or send_from_directory. 
            # Note: send_from_directory is safer but we need to know the dir.
            # We know it's in the same dir as original (TEMP_FOLDER)
            
            return send_from_directory(
                directory=directory,
                path=filename,
                as_attachment=True,
                download_name=download_name,
                mimetype=mime_type
            )
            # Note: The converted file is left in temp folder. 
            # The cleanup script should handle it eventually.
            
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            current_app.logger.error(f"Download conversion error: {e}", exc_info=True)
            return jsonify({"error": "Error converting image for download."}), 500

    # Default download (original format)
    download_name = f"edited_haguma_art.{original_extension.lower()}"
    
    # Determine MIME type (Pillow can also help here if format changed)
    mime_type = f'image/{original_extension.lower()}'
    if original_extension.lower() == 'jpg':
        mime_type = 'image/jpeg'
    
    return send_from_directory(
        directory=config.TEMP_FOLDER,
        path=image_service.get_session_filename(image_session_id, original_extension), # just the filename
        as_attachment=True,
        download_name=download_name,
        mimetype=mime_type
    )

@image_bp.app_errorhandler(413) # Register for the blueprint or app
def request_entity_too_large_handler(error):
    return jsonify(error=f"File is too large. Maximum size is {config.MAX_FILE_SIZE_MB}MB."), 413