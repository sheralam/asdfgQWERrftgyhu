.PHONY: help install start stop restart backend-start backend-stop frontend-start frontend-stop setup clean logs

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Process names
BACKEND_PID_FILE := .backend.pid
FRONTEND_PID_FILE := .frontend.pid

help: ## Show this help message
	@echo "$(BLUE)Campaign Studio - Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies (backend + frontend)
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

generate-keys: ## Generate SECRET_KEY and ENCRYPTION_KEY
	@echo "$(BLUE)Generating secure keys...$(NC)"
	@cd backend && python3 generate_keys.py

setup: install ## Complete setup (install + create env files)
	@echo "$(BLUE)Setting up environment...$(NC)"
	@if [ ! -f backend/.env ]; then \
		cp backend/env.example backend/.env; \
		echo "$(YELLOW)⚠ Created backend/.env - Please configure it$(NC)"; \
	fi
	@if [ ! -f frontend/.env ]; then \
		cp frontend/env.example frontend/.env; \
		echo "$(YELLOW)⚠ Created frontend/.env - Please configure it$(NC)"; \
	fi
	@echo "$(GREEN)✓ Setup complete$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Generate keys: $(GREEN)make generate-keys$(NC)"
	@echo "  2. Update backend/.env with generated keys"
	@echo "  3. Create PostgreSQL database: $(GREEN)createdb campaign-studio$(NC)"
	@echo "  4. Run migrations: $(GREEN)make migrate$(NC)"

migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	cd backend && . venv/bin/activate && alembic upgrade head
	@echo "$(GREEN)✓ Migrations complete$(NC)"

backend-start: ## Start backend server
	@echo "$(BLUE)Starting backend...$(NC)"
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		echo "$(YELLOW)Backend already running (PID: $$(cat $(BACKEND_PID_FILE)))$(NC)"; \
	else \
		cd backend && . venv/bin/activate && \
		nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 & echo $$! > ../$(BACKEND_PID_FILE); \
		echo "$(GREEN)✓ Backend started (PID: $$(cat $(BACKEND_PID_FILE)))$(NC)"; \
		echo "$(GREEN)  URL: http://localhost:8000$(NC)"; \
		echo "$(GREEN)  Docs: http://localhost:8000/api/docs$(NC)"; \
	fi

backend-stop: ## Stop backend server
	@echo "$(BLUE)Stopping backend...$(NC)"
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		kill $$(cat $(BACKEND_PID_FILE)) 2>/dev/null || true; \
		rm -f $(BACKEND_PID_FILE); \
		echo "$(GREEN)✓ Backend stopped$(NC)"; \
	else \
		echo "$(YELLOW)Backend not running$(NC)"; \
	fi

frontend-start: ## Start frontend server
	@echo "$(BLUE)Starting frontend...$(NC)"
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		echo "$(YELLOW)Frontend already running (PID: $$(cat $(FRONTEND_PID_FILE)))$(NC)"; \
	else \
		cd frontend && nohup npm run dev > ../frontend.log 2>&1 & echo $$! > ../$(FRONTEND_PID_FILE); \
		echo "$(GREEN)✓ Frontend started (PID: $$(cat $(FRONTEND_PID_FILE)))$(NC)"; \
		echo "$(GREEN)  URL: http://localhost:5173$(NC)"; \
	fi

frontend-stop: ## Stop frontend server
	@echo "$(BLUE)Stopping frontend...$(NC)"
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		kill $$(cat $(FRONTEND_PID_FILE)) 2>/dev/null || true; \
		rm -f $(FRONTEND_PID_FILE); \
		echo "$(GREEN)✓ Frontend stopped$(NC)"; \
	else \
		echo "$(YELLOW)Frontend not running$(NC)"; \
	fi

start: ## Start both backend and frontend
	@$(MAKE) backend-start
	@$(MAKE) frontend-start
	@echo ""
	@echo "$(GREEN)✓ Campaign Studio is running!$(NC)"
	@echo "$(GREEN)  Backend:  http://localhost:8000$(NC)"
	@echo "$(GREEN)  Frontend: http://localhost:5173$(NC)"
	@echo "$(GREEN)  API Docs: http://localhost:8000/api/docs$(NC)"

stop: ## Stop both backend and frontend
	@$(MAKE) backend-stop
	@$(MAKE) frontend-stop
	@echo "$(GREEN)✓ Campaign Studio stopped$(NC)"

restart: ## Restart both backend and frontend
	@echo "$(BLUE)Restarting Campaign Studio...$(NC)"
	@$(MAKE) stop
	@sleep 2
	@$(MAKE) start

status: ## Check status of backend and frontend
	@echo "$(BLUE)Campaign Studio Status:$(NC)"
	@echo ""
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		if ps -p $$(cat $(BACKEND_PID_FILE)) > /dev/null 2>&1; then \
			echo "$(GREEN)✓ Backend:  Running (PID: $$(cat $(BACKEND_PID_FILE)))$(NC)"; \
		else \
			echo "$(RED)✗ Backend:  Dead (stale PID file)$(NC)"; \
			rm -f $(BACKEND_PID_FILE); \
		fi \
	else \
		echo "$(RED)✗ Backend:  Not running$(NC)"; \
	fi
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		if ps -p $$(cat $(FRONTEND_PID_FILE)) > /dev/null 2>&1; then \
			echo "$(GREEN)✓ Frontend: Running (PID: $$(cat $(FRONTEND_PID_FILE)))$(NC)"; \
		else \
			echo "$(RED)✗ Frontend: Dead (stale PID file)$(NC)"; \
			rm -f $(FRONTEND_PID_FILE); \
		fi \
	else \
		echo "$(RED)✗ Frontend: Not running$(NC)"; \
	fi

logs: ## Show logs (tail -f)
	@if [ -f backend.log ] || [ -f frontend.log ]; then \
		echo "$(BLUE)Showing logs (Ctrl+C to exit)...$(NC)"; \
		tail -f backend.log frontend.log 2>/dev/null; \
	else \
		echo "$(YELLOW)No log files found$(NC)"; \
	fi

logs-backend: ## Show backend logs
	@if [ -f backend.log ]; then \
		tail -f backend.log; \
	else \
		echo "$(YELLOW)No backend log file found$(NC)"; \
	fi

logs-frontend: ## Show frontend logs
	@if [ -f frontend.log ]; then \
		tail -f frontend.log; \
	else \
		echo "$(YELLOW)No frontend log file found$(NC)"; \
	fi

clean: ## Clean up PID files and logs
	@echo "$(BLUE)Cleaning up...$(NC)"
	@rm -f $(BACKEND_PID_FILE) $(FRONTEND_PID_FILE)
	@rm -f backend.log frontend.log
	@echo "$(GREEN)✓ Cleaned up$(NC)"

clean-all: clean ## Clean everything (PID files, logs, node_modules, venv)
	@echo "$(BLUE)Deep cleaning...$(NC)"
	@rm -rf backend/venv
	@rm -rf frontend/node_modules
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

dev: ## Start in development mode (foreground, with logs)
	@echo "$(BLUE)Starting Campaign Studio in development mode...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop both services$(NC)"
	@echo ""
	@trap '$(MAKE) stop' INT; \
	$(MAKE) start && \
	$(MAKE) logs

.DEFAULT_GOAL := help
