import time

import jwt
from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()
settings = get_settings()


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    # Placeholder: accept any credential for now.
    if not payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    exp = int(time.time()) + settings.jwt_exp_minutes * 60
    token = jwt.encode({"sub": payload.email, "exp": exp}, settings.jwt_secret, algorithm="HS256")
    return LoginResponse(access_token=token)

