# Haguma Art Editor

A full-stack web application for image editing and manipulation. Built with a modern React frontend and Python Flask backend, featuring real-time image processing with tools for cropping, filtering, resizing, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [License](#license)

## Features

- **Image Upload**: Drag-and-drop image upload functionality
- **Image Cropping**: Preset and custom crop ratios
- **Filters**: Apply various filters including grayscale
- **Brightness & Contrast**: Adjust image brightness and contrast
- **Rotation & Flip**: Rotate and flip images
- **Resize**: Scale images to custom dimensions
- **Download**: Export edited images in multiple formats
- **Metadata Display**: View and track image metadata
- **Real-time Preview**: Instant preview of edits
- **Responsive UI**: Modern, intuitive interface

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **CSS Modules** - Scoped styling
- **JavaScript (ES6+)** - Modern JavaScript

### Backend
- **Python 3** - Backend language
- **Flask** - Web framework
- **Pillow** - Image processing library
- **Flask-CORS** - Cross-origin resource sharing
- **APScheduler** - Background task scheduling
- **python-dotenv** - Environment variable management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
haguma-art-editor/
├── backend/                    # Flask backend
│   ├── app.py                 # Application entry point
│   ├── config.py              # Configuration settings
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile             # Docker configuration
│   ├── routes/                # API route handlers
│   │   └── image_routes.py   # Image processing endpoints
│   ├── services/              # Business logic
│   │   └── image_service.py  # Image processing service
│   ├── utils/                 # Utility functions
│   │   ├── cleanup.py        # Cleanup tasks
│   │   └── file_helpers.py   # File utilities
│   └── temp_images/          # Temporary image storage
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Entry point
│   │   ├── components/        # React components
│   │   │   ├── ImageUploadArea/
│   │   │   ├── MainCanvas/
│   │   │   ├── Sidebar/
│   │   │   ├── MenuBar/
│   │   │   ├── PropertiesPanel/
│   │   │   ├── SaveAsModal/
│   │   │   ├── ToolPalette/
│   │   │   └── Topbar/
│   │   ├── services/          # API services
│   │   └── styles/            # Global styles
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── Dockerfile             # Docker configuration
│   └── index.html             # HTML template
├── docker-compose.yml         # Docker Compose setup
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (3.8 or higher)
- **pip** (Python package manager)
- **Docker** & **Docker Compose** (optional, for containerized deployment)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory (optional):
```env
FLASK_ENV=development
FLASK_DEBUG=True
MAX_CONTENT_LENGTH=16777216
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # or `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
python app.py
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (Vite default)

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```
This creates an optimized build in the `dist/` directory.

## API Documentation

The backend provides the following API endpoints under `/api/`:

### Image Endpoints
- `POST /api/upload` - Upload an image
- `POST /api/process` - Process image with filters/adjustments
- `POST /api/save` - Save the edited image
- `GET /api/image/<id>` - Retrieve image metadata

For detailed API documentation, refer to `backend/routes/image_routes.py`.

## Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
FLASK_DEBUG=True
MAX_CONTENT_LENGTH=16777216
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (Vite)
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

## Docker

### Running with Docker Compose

```bash
docker-compose up --build
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`
- Caddy reverse proxy on `http://localhost:80`

### Building Individual Images

**Backend:**
```bash
cd backend
docker build -t haguma-art-editor-backend .
```

**Frontend:**
```bash
cd frontend
docker build -t haguma-art-editor-frontend .
```

## Development Guidelines

- Use **ESLint** for frontend code quality:
  ```bash
  npm run lint
  ```

- Use **CSS Modules** for component styling
- Follow **component-based architecture** for React
- Use **async/await** for API calls
- Keep backend routes in `routes/` and business logic in `services/`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.