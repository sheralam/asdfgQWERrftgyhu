#!/bin/bash
# Campaign Studio - Complete Setup Script

set -e  # Exit on error

echo "🚀 Campaign Studio - Complete Setup"
echo "===================================="
echo ""

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL connection...${NC}"
if PGPASSWORD=postgres psql -h localhost -U postgres -d campaign-studio -c "\q" 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running and database exists${NC}"
else
    echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
    echo "Make sure PostgreSQL is running on localhost:5432"
    echo "Database: campaign-studio, User: postgres, Password: postgres"
    exit 1
fi

# Backend setup
echo ""
echo -e "${BLUE}Setting up backend...${NC}"
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating backend/.env from template...${NC}"
    cp env.example .env
    
    # Update keys
    sed -i '' 's/SECRET_KEY=.*/SECRET_KEY=_0Yj_QztX8qyGm6gY2S2OJuHazwZvlIG15OfK-28qMs/' .env
    sed -i '' 's/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=hVwzIaHF8XOl3cGkczP27xL63ZoiMsdY3NF2P_DIBzc=/' .env
    echo -e "${GREEN}✓ Created backend/.env with secure keys${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Check Python version
PYTHON_CMD="python3.12"
if ! command -v $PYTHON_CMD &> /dev/null; then
    echo -e "${YELLOW}⚠ Python 3.12 not found. Checking for other versions...${NC}"
    PYTHON_CMD="python3"
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    if [[ ! $PYTHON_VERSION =~ ^3\.12 ]]; then
        echo -e "${RED}✗ Python 3.12 is recommended${NC}"
        echo "Current version: $PYTHON_VERSION"
        echo "Install Python 3.12: brew install python@3.12"
        echo ""
        read -p "Continue with current Python version? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo -e "${BLUE}Creating Python virtual environment with $PYTHON_CMD...${NC}"
    $PYTHON_CMD -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment and install dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
alembic upgrade head
echo -e "${GREEN}✓ Database migrations complete${NC}"

cd ..

# Frontend setup
echo ""
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating frontend/.env...${NC}"
    cp env.example .env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

# Install node dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

cd ..

# Done
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the application: ${GREEN}make start${NC}"
echo "  2. Backend will be at: ${GREEN}http://localhost:8000${NC}"
echo "  3. Frontend will be at: ${GREEN}http://localhost:5173${NC}"
echo "  4. API docs at: ${GREEN}http://localhost:8000/api/docs${NC}"
echo ""
