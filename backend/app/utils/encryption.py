"""Encryption for sensitive data (e.g. bank account numbers)."""

import base64
import hashlib
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings


def _get_fernet() -> Fernet:
    """Create Fernet from app encryption key (32 chars -> base64)."""
    settings = get_settings()
    key = settings.encryption_key
    if len(key) < 32:
        key = key.ljust(32, "0")[:32]
    else:
        key = key[:32]
    b = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
    return Fernet(b)


def encrypt_value(plain: str) -> str:
    """Encrypt string; return base64-encoded ciphertext."""
    if not plain:
        return ""
    f = _get_fernet()
    return f.encrypt(plain.encode()).decode()


def decrypt_value(cipher: str) -> Optional[str]:
    """Decrypt base64 ciphertext; return plain string or None if invalid."""
    if not cipher:
        return ""
    try:
        f = _get_fernet()
        return f.decrypt(cipher.encode()).decode()
    except (InvalidToken, Exception):
        return None
