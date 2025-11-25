# SQLModel Dict Field Fix

## Issue
SQLModel was throwing an error: `ValueError: <class 'dict'> has no matching SQLAlchemy type`

This happened because SQLModel doesn't directly support `dict` types in table models.

## Solution

Updated `app/models/report.py` to use SQLAlchemy `JSON` columns for dict fields:

### Before:
```python
meta_payload: dict[str, Any]
competitor_payload: dict[str, Any]
insight_metadata: dict
metadata: dict[str, Any]
```

### After:
```python
meta_payload: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
competitor_payload: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
insight_metadata: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
metadata: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
```

## Changes Made

1. Added imports: `from sqlalchemy import JSON, Column`
2. Updated all `dict` fields to use `Field` with `sa_column=Column(JSON)`
3. Added `default_factory=dict` to ensure fields have default empty dicts
4. Fixed `insight_metadata` type annotation from `dict` to `dict[str, Any]`
5. Made `artifacts_path` optional with `Optional[str] = None`

## Why This Works

- SQLAlchemy's `JSON` column type stores Python dicts as JSON in the database
- SQLModel's `Field` with `sa_column` allows us to specify the SQLAlchemy column type
- `default_factory=dict` ensures new records have empty dicts by default

## Database Compatibility

This works with:
- ✅ PostgreSQL (native JSON support)
- ✅ SQLite (JSON stored as TEXT, but works)
- ✅ MySQL (JSON column type)

## Testing

After deployment, the models should import and work correctly. The fix has been pushed to GitHub and Railway will automatically redeploy.

---

**Fix applied! Railway should redeploy automatically.** ✅

