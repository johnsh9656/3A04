from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from threading import Lock
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

_TABLE_CONFIG = {
    "telemetry": {"file": "telemetry.json", "id_field": "telemetry_id"},
    "alerts": {"file": "alerts.json", "id_field": "alert_id"},
    "devices": {"file": "devices.json", "id_field": "device_id"},
    "audit": {"file": "audit.json", "id_field": "audit_id"},
    "users": {"file": "users.json", "id_field": "user_id"},
}

_FILE_LOCK = Lock()

class DatabaseError(Exception):
    """Raised when a database operation fails."""

def _validate_table(table: str) -> dict[str, str]:
    if table not in _TABLE_CONFIG:
        valid_tables = ", ".join(sorted(_TABLE_CONFIG.keys()))
        raise DatabaseError(f"Unknown table '{table}'. Valid tables: {valid_tables}")
    return _TABLE_CONFIG[table]

def _file_path(table: str) -> Path:
    config = _validate_table(table)
    return DATA_DIR / config["file"]

def _ensure_file_exists(table: str) -> None:
    path = _file_path(table)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("[]", encoding="utf-8")

def _read_table(table: str) -> list[dict[str, Any]]:
    _ensure_file_exists(table)
    path = _file_path(table)

    with _FILE_LOCK:
        try:
            raw_text = path.read_text(encoding="utf-8").strip()
            if not raw_text:
                return []

            data = json.loads(raw_text)
            if not isinstance(data, list):
                raise DatabaseError(f"{path.name} must contain a JSON array.")
            return data
        except json.JSONDecodeError as exc:
            raise DatabaseError(f"Invalid JSON in {path.name}: {exc}") from exc


def _write_table(table: str, records: list[dict[str, Any]]) -> None:
    path = _file_path(table)
    with _FILE_LOCK:
        path.write_text(json.dumps(records, indent=2), encoding="utf-8")


def get_all(table: str) -> list[dict[str, Any]]:
    """Return all records in a table."""
    return deepcopy(_read_table(table))

def get_by_id(table: str, record_id: int, id_field: str | None = None) -> dict[str, Any] | None:
    """Return a single record by ID, or None if not found."""
    records = _read_table(table)
    if id_field is None:
        id_field = _TABLE_CONFIG[table]["id_field"]

    for record in records:
        if record.get(id_field) == record_id:
            return deepcopy(record)
    return None

def find_one(table: str, **filters: Any) -> dict[str, Any] | None:
    """Return the first record that matches all filters."""
    records = _read_table(table)
    for record in records:
        if all(record.get(key) == value for key, value in filters.items()):
            return deepcopy(record)
    return None

def find_many(table: str, **filters: Any) -> list[dict[str, Any]]:
    """
    Return all records that match all filters.
    Example: find_many("telemetry", device_id=2)
    """
    records = _read_table(table)
    matched = [
        record for record in records
        if all(record.get(key) == value for key, value in filters.items())
    ]
    return deepcopy(matched)

def insert(table: str, record: dict[str, Any], id_field: str | None = None) -> dict[str, Any]:
    """
    Insert a new record. If the ID field is missing, it is auto-generated.
    Returns the inserted record.
    """
    records = _read_table(table)
    record_to_insert = deepcopy(record)

    if id_field is None:
        id_field = _TABLE_CONFIG[table]["id_field"]

    if id_field not in record_to_insert:
        record_to_insert[id_field] = _next_id(records, id_field)
    else:
        existing_ids = {row.get(id_field) for row in records}
        if record_to_insert[id_field] in existing_ids:
            raise DatabaseError(
                f"Cannot insert into '{table}': {id_field}={record_to_insert[id_field]} already exists."
            )

    records.append(record_to_insert)
    _write_table(table, records)
    return deepcopy(record_to_insert)

def update(
    table: str,
    record_id: int,
    updates: dict[str, Any],
    id_field: str | None = None
) -> dict[str, Any] | None:
    """
    Update a record by ID. Returns the updated record, or None if not found.
    """
    records = _read_table(table)

    if id_field is None:
        id_field = _TABLE_CONFIG[table]["id_field"]

    for index, record in enumerate(records):
        if record.get(id_field) == record_id:
            updated_record = deepcopy(record)
            updated_record.update(updates)
            updated_record[id_field] = record_id  # prevent changing the primary ID
            records[index] = updated_record
            _write_table(table, records)
            return deepcopy(updated_record)

    return None

def delete(table: str, record_id: int, id_field: str | None = None) -> bool:
    """
    Delete a record by ID.
    Returns True if a record was deleted, otherwise False.
    """
    records = _read_table(table)

    if id_field is None:
        id_field = _TABLE_CONFIG[table]["id_field"]

    original_count = len(records)
    filtered_records = [record for record in records if record.get(id_field) != record_id]

    if len(filtered_records) == original_count:
        return False

    _write_table(table, filtered_records)
    return True

def replace_all(table: str, records: list[dict[str, Any]]) -> None:
    """Replace the entire table with the provided records."""
    _write_table(table, deepcopy(records))

def _next_id(records: list[dict[str, Any]], id_field: str) -> int:
    existing_ids = [record.get(id_field, 0) for record in records if isinstance(record.get(id_field), int)]
    return (max(existing_ids) + 1) if existing_ids else 1
