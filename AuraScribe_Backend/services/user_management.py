# User and clinic management, plus audit trail
import datetime
import hashlib
import json
import os
import secrets
import uuid

from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
DATA_DIR.mkdir(exist_ok=True)
USERS_FILE = DATA_DIR / 'users.json'
AUDIT_FILE = DATA_DIR / 'audit_log.json'

USERS = {}
CLINICS = {}
AUDIT_LOG = []


def _hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 120000)
    return salt, hashed.hex()


def _load_json(path: Path, default):
    if path.exists():
        try:
            with path.open('r', encoding='utf-8') as fh:
                return json.load(fh)
        except json.JSONDecodeError:
            return default
    return default


def _persist_users():
    records = [user.to_dict() for user in USERS.values()]
    with USERS_FILE.open('w', encoding='utf-8') as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)


def _persist_audit_log():
    records = [entry.to_dict() for entry in AUDIT_LOG]
    with AUDIT_FILE.open('w', encoding='utf-8') as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)


class User:
    def __init__(
        self,
        username: str,
        role: str,
        clinic_id: str,
        password_hash: str,
        salt: str,
        user_id: str | None = None
    ):
        self.id = user_id or str(uuid.uuid4())
        self.username = username
        self.password_hash = password_hash
        self.salt = salt
        self.role = role
        self.clinic_id = clinic_id

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'password_hash': self.password_hash,
            'salt': self.salt,
            'role': self.role,
            'clinic_id': self.clinic_id
        }


class Clinic:
    def __init__(self, name: str):
        self.id = str(uuid.uuid4())
        self.name = name


class AuditEntry:
    def __init__(self, user_id: str, action: str, details: str):
        self.timestamp = datetime.datetime.utcnow().isoformat()
        self.user_id = user_id
        self.action = action
        self.details = details

    def to_dict(self):
        return {
            'timestamp': self.timestamp,
            'user_id': self.user_id,
            'action': self.action,
            'details': self.details
        }


def register_user(username: str, password: str, role: str, clinic_id: str):
    salt, hashed = _hash_password(password)
    user = User(username, role, clinic_id, password_hash=hashed, salt=salt)
    USERS[user.id] = user
    _persist_users()
    return user


def login_user(username: str, password: str):
    for user in USERS.values():
        if user.username != username:
            continue
        _, hashed = _hash_password(password, salt=user.salt)
        if hashed == user.password_hash:
            return user
    return None


def create_clinic(name: str):
    clinic = Clinic(name)
    CLINICS[clinic.id] = clinic
    return clinic


def log_audit(user_id: str, action: str, details: str):
    entry = AuditEntry(user_id, action, details)
    AUDIT_LOG.append(entry)
    _persist_audit_log()
    return entry


def _load_existing_store():
    users = _load_json(USERS_FILE, [])
    for record in users:
        user = User(
            username=record['username'],
            role=record['role'],
            clinic_id=record['clinic_id'],
            password_hash=record['password_hash'],
            salt=record['salt'],
            user_id=record.get('id')
        )
        USERS[user.id] = user
    audits = _load_json(AUDIT_FILE, [])
    for record in audits:
        entry = AuditEntry(
            user_id=record.get('user_id', ''),
            action=record.get('action', ''),
            details=record.get('details', '')
        )
        entry.timestamp = record.get('timestamp', entry.timestamp)
        AUDIT_LOG.append(entry)


_load_existing_store()
