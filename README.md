Career Cracker

## Overview

This project is a web application that consists of a **Django REST Framework** backend and a **React** frontend. The application is containerized using **Docker** for easy setup and deployment.

## Prerequisites

Before running the project, ensure you have the following installed on your machine:

- **Docker** (https://www.docker.com/get-started)
- **Docker Compose** (Included with Docker Desktop)
- **Node.js** (https://nodejs.org/) (Only if running frontend without Docker)

## Project Structure

```
project-root/
│-- backend/               # Django backend (REST API)
│   ├── accounts/          # User authentication app
│   ├── manage.py          # Django management script
│   ├── requirements.txt   # Python dependencies
│   ├── settings.py        # Django settings
│   └── ...
│
│-- frontend/              # React frontend
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── ...
│
│-- docker-compose.yml     # Docker Compose configuration
│-- README.md              # Documentation
```

## Running the Project with Docker

Docker is the recommended way to run this project as it eliminates setup issues.

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Build and Start the Containers

```sh
docker-compose up --build
```

This command will:

- Build the **backend** (Django)
- Build the **frontend** (React)
- Start the database (if applicable)

Once done, the backend will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.

### 3. Stop the Containers

To stop the running containers, press `CTRL + C` or run:

```sh
docker-compose down
```

## Running Backend (Django) Without Docker

If you want to run the backend manually, follow these steps:

### 1. Navigate to Backend Directory

```sh
cd backend
```

### 2. Create a Virtual Environment

```sh
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies

```sh
pip install -r requirements.txt
```

### 4. Run Database Migrations

```sh
python manage.py migrate
```

### 5. Start the Backend Server

```sh
python manage.py runserver
```

This starts the server at `http://localhost:8000`.

## Running Frontend (React) Without Docker

If you want to run the frontend manually, follow these steps:

### 1. Navigate to Frontend Directory

```sh
cd frontend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start the Frontend Server

```sh
npm run dev
```

This starts the frontend at `http://localhost:5173`.
