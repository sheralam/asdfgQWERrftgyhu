# Campaign Studio Backend

Backend API for Campaign Studio - a CMS for managing advertising campaigns for car infotainment systems.

## Prerequisites

- **Python 3.12** (recommended) - Python 3.14 may have compatibility issues with some packages
- PostgreSQL 18
- pip

### Installing Python 3.12 on macOS

```bash
brew install python@3.12
```

## Setup

1. Create virtual environment with Python 3.12:
```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and update the configuration values, especially:
   - `SECRET_KEY`: Generate a secure random string (min 32 characters)
   - `ENCRYPTION_KEY`: Generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
   - Database credentials

5. Create database:
```bash
createdb campaign-studio
```

6. Run migrations:
```bash
alembic upgrade head
```

7. Start development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Testing

```bash
pytest
```

## Troubleshooting

### Build errors with pydantic-core or psycopg2-binary

If you encounter build errors during `pip install`, ensure you're using Python 3.12:

```bash
# Check your Python version
python --version  # Should be 3.12.x

# If using a different version, recreate the virtual environment
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** Python 3.14 and newer versions may have compatibility issues with some packages that don't yet have pre-built wheels.

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── routers/          # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   ├── middleware/       # Custom middleware
│   ├── config.py         # Configuration
│   ├── database.py       # Database setup
│   ├── dependencies.py   # FastAPI dependencies
│   └── main.py           # Application entry point
└── tests/                # Tests
```
