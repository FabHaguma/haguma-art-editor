import os
from datetime import datetime, timedelta
import config # From backend/config.py
from flask import current_app # For logging if needed

def cleanup_temp_files_job():
    """Scheduled job to clean up old temporary files."""
    if not os.path.exists(config.TEMP_FOLDER):
        # This case should ideally be handled by app startup creating the folder
        if current_app: current_app.logger.warning(f"Temp folder {config.TEMP_FOLDER} does not exist. Cleanup skipped.")
        else: print(f"Warning: Temp folder {config.TEMP_FOLDER} does not exist. Cleanup skipped.")
        return

    now = datetime.now()
    cleaned_count = 0
    error_count = 0

    # Using current_app.logger if available (i.e., when run within Flask context)
    logger = current_app.logger if current_app else None

    for filename in os.listdir(config.TEMP_FOLDER):
        file_path = os.path.join(config.TEMP_FOLDER, filename)
        try:
            # Check if it's a file and not a directory
            if os.path.isfile(file_path):
                file_mod_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                if now - file_mod_time > timedelta(hours=config.SESSION_TIMEOUT_HOURS):
                    os.remove(file_path)
                    cleaned_count += 1
                    if logger: logger.info(f"Cleanup: Deleted old temp file: {filename}")
                    else: print(f"Cleanup: Deleted old temp file: {filename}")
        except Exception as e:
            error_count +=1
            if logger: logger.error(f"Cleanup: Error processing file {filename}: {e}")
            else: print(f"Cleanup: Error processing file {filename}: {e}")
    
    msg = f"Cleanup job finished. Deleted: {cleaned_count} files. Errors: {error_count}."
    if logger: logger.info(msg)
    else: print(msg)