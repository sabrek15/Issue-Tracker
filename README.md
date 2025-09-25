# Issue-Tracker

A simple web-based issue tracking system using Angular (frontend) and Flask (backend) with PostgreSQL for data storage. This app allows users to create, view, filter, and update issues with details such as title, status, priority, and assignee.

---

## Features

- Create, view, update, and filter issues
- Search by title, status, priority, and assignee
- View detailed info for each issue
- Responsive and modern UI

---

## Technology Stack

- **Frontend:** Angular
- **Backend:** Flask (Python)
- **Database:** PostgreSQL

---

## Prerequisites

- Node.js & npm (for Angular frontend)
- Python 3.x (for Flask backend)
- PostgreSQL installed and running
- `pip` for Python package management

---

## Installation & Setup Guide

### 1. Clone the Repository

```sh
git clone https://github.com/sabrek15/Issue-Tracker.git
cd Issue-Tracker
```

---

### 2. Backend Setup (Flask + PostgreSQL)

#### a. Create and Configure PostgreSQL Database

1. Start PostgreSQL server.
2. Open your PostgreSQL client (psql, DBeaver, etc.).
3. Run the following commands to set up the database and user:

```sql
-- Replace 'issue_tracker_db', 'issue_user', and 'your_password' as needed
CREATE DATABASE issue_tracker_db;
CREATE USER issue_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE issue_tracker_db TO issue_user;

-- Enable UUID extension for primary key generation
\c issue_tracker_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### b. Python Environment & Dependencies

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> _If `requirements.txt` does not exist, install: `Flask`, `SQLAlchemy`, `psycopg2-binary`_

#### c. Configure Database Connection

Edit `backend/app.py` and set the connection string according to your database credentials:

```python
DATABASE_URL = "postgresql+psycopg2://issue_user:your_password@localhost/issue_tracker_db"
```

#### d. Create Tables

The tables will be auto-created when you run the backend (see `Base.metadata.create_all(bind=engine)`).

##### Table: `issues` (Defined in backend/app.py)

```sql
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    assignee VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
> You do **not** need to run this manually; it's handled by SQLAlchemy.

#### e. Run the Backend Server

```sh
python app.py
```

The backend API should be running at `http://127.0.0.1:5000`.

---

### 3. Frontend Setup (Angular)

```sh
cd frontend
npm install
npm start
```

The Angular app will start at `http://localhost:4200`. Make sure the backend server is running for API calls to work.

---

## How to Use

1. Navigate to the frontend in your browser (`http://localhost:4200`).
2. Use the UI to view, create, and update issues.
3. Click on an issue to see its details.
4. Use filters to search by status, priority, assignee, or title.

---

## API Endpoints (Backend)

- `GET /issues`: List issues (supports search/filter via query params)
- `POST /issues`: Create a new issue
- `GET /issues/<id>`: Get details of an issue
- `PUT /issues/<id>`: Update an issue

---

## Troubleshooting

- Ensure PostgreSQL is running, and credentials are correct.
- If you see UUID errors, confirm `uuid-ossp` extension is enabled.
- Make sure backend and frontend servers are running and accessible at their respective ports.

---