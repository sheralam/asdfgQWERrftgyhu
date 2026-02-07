# Security Keys Configuration

## 🔑 Generated Keys

Run the key generator:
```bash
make generate-keys
# OR
cd backend && python3 generate_keys.py
```

### Current Generated Keys (for this session):

```bash
SECRET_KEY=_0Yj_QztX8qyGm6gY2S2OJuHazwZvlIG15OfK-28qMs
ENCRYPTION_KEY=hVwzIaHF8XOl3cGkczP27xL63ZoiMsdY3NF2P_DIBzc=
```

## 📝 How to Use

### 1. Copy environment template:
```bash
cp backend/env.example backend/.env
```

### 2. Edit `backend/.env` and update these lines:
```bash
SECRET_KEY=_0Yj_QztX8qyGm6gY2S2OJuHazwZvlIG15OfK-28qMs
ENCRYPTION_KEY=hVwzIaHF8XOl3cGkczP27xL63ZoiMsdY3NF2P_DIBzc=
```

### 3. Verify other settings in `backend/.env`:
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=campaign-studio
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

## 🔐 Key Purposes

### SECRET_KEY
- Used for JWT token signing
- Validates access and refresh tokens
- Must be kept secret and changed in production

### ENCRYPTION_KEY
- Used for Fernet encryption
- Encrypts sensitive data (e.g., bank account numbers)
- Must be 32 bytes, base64-encoded
- Changing this key will make encrypted data unreadable

## ⚠️ Security Notes

1. **Never commit** `.env` files to Git (already in `.gitignore`)
2. **Generate new keys** for production environments
3. **Keep keys secret** - don't share them publicly
4. **Backup keys** securely - losing ENCRYPTION_KEY means losing encrypted data
5. **Rotate keys** periodically for better security

## 🚀 Complete Setup Flow

```bash
# 1. Setup project
make setup

# 2. Generate keys
make generate-keys

# 3. Update backend/.env with generated keys

# 4. Create database
createdb campaign-studio

# 5. Run migrations
make migrate

# 6. Start application
make start
```

---

**Note**: The keys shown above are examples. Generate your own keys for actual use!
