# lint:
# 	make -C frontend lint

# install:
# 	npm ci

# start-frontend:
# 	make -C frontend start

# start-backend:
# 	npx start-server -s ./frontend/build

# start:
# 	make start-backend

# develop:
# 	make start-backend & make start-frontend

# build:
# 	rm -rf frontend/build
# 	npm run build

# #alias for TS

# backend-ts:
# 	npx start-server -s ./frontend-ts/dist

# start-ts:
# 	make -C frontend-ts start

# dev:
# 	npx start-server &
# 	make -C frontend-ts start

# build-ts:
# 	rm -rf frontend-ts/dist
# 	make -C frontend-ts build

# lint-ts:
# 	make -C frontend-ts lint

# lint-fix:
# 	make -C frontend-ts lint:fix


.PHONY: clean backend frontend dev build start

# Останавливаем процессы на портах 5001 и 5002
clean:
	@echo "Stopping processes on ports 5001 and 5002..."
	-@lsof -i :5001 -t | xargs kill -9 || true
	-@lsof -i :5002 -t | xargs kill -9 || true

# Запуск backend
backend:
	@echo "Starting backend (chat-server) on port 5001..."
	@npx start-server -s ./frontend-ts/dist &

# Запуск frontend
frontend:
	@echo "Starting frontend (Vite) on port 5002..."
	@cd frontend-ts && npm run dev &

# Полный dev-сервер
dev: clean backend frontend
	@echo "Dev environment started."

# Production-сборка фронтенда
build:
	@echo "Building frontend (frontend-ts)..."
	@rm -rf frontend-ts/dist
	@cd frontend-ts && npm run build

# Production-сервер: API и собранная статика на одном порту
start:
	@echo "Starting production server on port 5001..."
	@npx start-server -s ./frontend-ts/dist



