import os
import time
from flask import current_app
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploaded_pdfs')
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
MAX_PDF_AGE_SECONDS = 24 * 3600

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def cleanup_uploaded_pdfs():
    now = time.time()
    for name in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, name)
        if not os.path.isfile(file_path):
            continue
        age = now - os.path.getmtime(file_path)
        if age > MAX_PDF_AGE_SECONDS:
            try:
                os.remove(file_path)
            except Exception:
                pass

cleanup_uploaded_pdfs()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_pdf(file_storage):
    if file_storage and allowed_file(file_storage.filename):
        cleanup_uploaded_pdfs()
        filename = secure_filename(file_storage.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file_storage.save(file_path)
        return file_path
    return None

def get_pdf_path(filename):
    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
    if os.path.exists(file_path):
        return file_path
    return None
