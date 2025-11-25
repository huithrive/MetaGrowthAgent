# Testing Guide

## Current Status

✅ **Frontend**: Running on http://localhost:5173
❌ **Backend**: Needs Python dependencies installed

## Quick Start Instructions

### Option 1: Install Dependencies Manually

```bash
# Create virtual environment (recommended)
cd /Users/huithrive/meta-growth-agent
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install fastapi uvicorn[standard] sqlmodel pydantic-settings pyjwt python-dotenv

# Start backend
uvicorn app.main:app --reload
```

### Option 2: Use pip with SSL workaround

If you're experiencing SSL errors:

```bash
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org fastapi uvicorn sqlmodel pydantic-settings pyjwt python-dotenv
```

### Option 3: Install from pyproject.toml

```bash
pip install -e .
```

## Testing the Application

### 1. Start Backend
```bash
cd /Users/huithrive/meta-growth-agent
uvicorn app.main:app --reload
```

Backend should be available at: http://localhost:8000
API docs: http://localhost:8000/docs

### 2. Frontend is Already Running
Frontend is available at: http://localhost:5173

### 3. Test Flow

1. **Open Browser**: http://localhost:5173
2. **Enter Website URL**: e.g., "example.com"
3. **Login**: Use any email/password (demo mode)
4. **Wait for Analysis**: The app will trigger backend analysis
5. **View Dashboard**: See competitor intelligence and growth opportunities

## Expected Behavior

### Frontend Flow:
1. Hero page with URL input
2. Authentication modal (if not logged in)
3. Loading sequence while analyzing
4. Competitor selection screen
5. Final dashboard with insights

### Backend Endpoints:
- `GET /health` - Should return `{"status": "ok", "environment": "local"}`
- `POST /auth/login` - Accepts email/password, returns JWT token
- `GET /reports/{account_id}` - Returns analysis report
- `POST /reports/{account_id}/refresh` - Triggers new analysis

## Troubleshooting

### Backend won't start
- Check Python version: `python3 --version` (needs 3.11+)
- Install dependencies: `pip install fastapi uvicorn`
- Check for import errors: `python3 -c "from app.main import app"`

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:8000/health`
- Check `.env.local` has: `VITE_API_URL=http://localhost:8000`
- Check browser console for CORS errors

### Authentication fails
- Backend accepts any password (demo mode)
- Check JWT_SECRET is set (default: "change-me")
- Verify token is stored in localStorage

## Next Steps After Testing

1. **Configure API Keys**: Add Meta Ads, competitor intelligence, and LLM keys
2. **Set up Database**: Configure PostgreSQL connection
3. **Set up Redis**: For Celery workers and caching
4. **Customize**: Adjust UI, branding, and analysis prompts

## Manual Testing Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:8000/health
- [ ] Can enter website URL
- [ ] Authentication modal appears
- [ ] Can login successfully
- [ ] Loading sequence displays
- [ ] Competitor selection works
- [ ] Dashboard displays results
- [ ] Meta Connect widget functions

---

**Note**: The backend requires Python dependencies to be installed. The frontend is already running and ready to test once the backend is started.

