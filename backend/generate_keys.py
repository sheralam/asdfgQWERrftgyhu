#!/usr/bin/env python3
"""
Generate SECRET_KEY and ENCRYPTION_KEY for Campaign Studio backend.
Run this script to generate secure keys for your .env file.
"""

import secrets
import base64
import os

print("=" * 60)
print("Campaign Studio - Key Generator")
print("=" * 60)
print()

# Generate SECRET_KEY (for JWT tokens)
secret_key = secrets.token_urlsafe(32)
print("SECRET_KEY (for JWT authentication):")
print(f"SECRET_KEY={secret_key}")
print()

# Generate ENCRYPTION_KEY (for Fernet encryption - must be 32 bytes, base64-encoded)
encryption_key = base64.urlsafe_b64encode(os.urandom(32)).decode()
print("ENCRYPTION_KEY (for encrypting sensitive data):")
print(f"ENCRYPTION_KEY={encryption_key}")
print()

print("=" * 60)
print("Copy these keys to your backend/.env file")
print("=" * 60)
print()
print("Quick setup:")
print("1. cp backend/env.example backend/.env")
print("2. Edit backend/.env and replace the placeholder keys with above")
print()
