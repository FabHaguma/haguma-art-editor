from flask import Flask
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import os
import logging # Import Python's logging module

# Import configurations and blueprints
import config # from backend/config.py
from routes.image_routes import image_bp
from utils.cleanup import cleanup_temp_files_job


def create_app():
    app = Flask(__name__)

    # Configure logging
    # For more robust logging, consider Flask's app.logger configurations
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    app.logger.handlers.clear() # Clear default handlers if any
    app.logger.addHandler(logging.StreamHandler()) # Log to console
    app.logger.setLevel(logging.INFO)


    # Load configurations
    app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
    # Add other app.config settings if needed, e.g., SECRET_KEY

    # Initialize CORS
    # For production, specify origins: CORS(app, origins=["https://yourfrontend.com"])
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all for dev on /api prefix

    # Create temp_images directory if it doesn't exist
    if not os.path.exists(config.TEMP_FOLDER):
        try:
            os.makedirs(config.TEMP_FOLDER)
            app.logger.info(f"Created temp_images directory at {config.TEMP_FOLDER}")
        except OSError as e:
            app.logger.error(f"Error creating temp_images directory {config.TEMP_FOLDER}: {e}")
            # Potentially raise an error or exit if this is critical

    # Register Blueprints
    app.register_blueprint(image_bp)
    app.logger.info("Image blueprint registered.")

    # Initialize and start APScheduler for background tasks
    scheduler = BackgroundScheduler(daemon=True) # daemon=True allows app to exit even if scheduler thread is running
    
    # Check if scheduler is already running to prevent multiple instances during reloads
    # This check might not be fully effective with some Flask dev server reloaders.
    # A more robust way is to ensure scheduler is initialized once globally.
    if not hasattr(app, 'scheduler_running') or not app.scheduler_running:
        scheduler.add_job(
            func=cleanup_temp_files_job,
            trigger="interval",
            hours=config.SESSION_TIMEOUT_HOURS,
            id="cleanup_job", # Give the job an ID
            replace_existing=True # Important for reloads
        )
        try:
            scheduler.start()
            app.scheduler_running = True # Mark that scheduler has been started
            app.logger.info(f"APScheduler started. Cleanup job scheduled every {config.SESSION_TIMEOUT_HOURS} hour(s).")
        except Exception as e:
            app.logger.error(f"Failed to start APScheduler: {e}")
            app.scheduler_running = False

        # Ensure scheduler shuts down gracefully when the app exits
        atexit.register(lambda: scheduler.shutdown() if app.scheduler_running and scheduler.running else None)
    
    else:
        app.logger.info("APScheduler already running or marked as such.")


    @app.route('/')
    def health_check():
        # A simple health check endpoint
        return "Haguma Art Editor Backend is Alive!"

    return app

# This part is for running with `python app.py` directly (Flask's dev server)
# For production, you'd use a WSGI server like Gunicorn.
if __name__ == '__main__':
    flask_app = create_app()
    # Use environment variables for host/port/debug for more flexibility
    flask_app.run(
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true',
        host=os.environ.get('FLASK_HOST', '0.0.0.0'),
        port=int(os.environ.get('FLASK_PORT', 5001))
    )