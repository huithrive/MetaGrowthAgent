"""Voice AI router for Deepgram-powered speech capabilities."""
import base64

import structlog
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response

from app.schemas.voice import (
    SpeechToTextRequest,
    SpeechToTextResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    VoiceHealthResponse,
    VoiceQueryRequest,
    VoiceQueryResponse,
    VoiceTextRequest,
    VoiceTextResponse,
)
from app.services.deepgram_service import get_deepgram_service

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("/health", response_model=VoiceHealthResponse)
async def voice_health() -> VoiceHealthResponse:
    """Check voice AI service health and configuration."""
    deepgram = get_deepgram_service()

    return VoiceHealthResponse(
        configured=deepgram.is_configured(),
        api_key_present=bool(deepgram.api_key),
        available_tts_models=[
            "aura-asteria-en",  # Friendly female voice
            "aura-luna-en",      # Warm female voice
            "aura-stella-en",    # Energetic female voice
            "aura-athena-en",    # Professional female voice
            "aura-hera-en",      # Authoritative female voice
            "aura-orion-en",     # Deep male voice
            "aura-arcas-en",     # Friendly male voice
            "aura-perseus-en",   # Professional male voice
            "aura-angus-en",     # Conversational male voice
            "aura-orpheus-en",   # Expressive male voice
            "aura-helios-en",    # Bright male voice
            "aura-zeus-en",      # Commanding male voice
        ],
        available_stt_models=[
            "nova-2",           # Latest and most accurate
            "nova",             # Previous generation
            "enhanced",         # Enhanced model
            "base",             # Base model
        ]
    )


@router.post("/tts", response_model=TextToSpeechResponse)
async def text_to_speech(request: TextToSpeechRequest) -> TextToSpeechResponse:
    """
    Convert text to speech using Deepgram's TTS API.

    This endpoint takes text input and returns base64-encoded audio data.
    """
    deepgram = get_deepgram_service()

    if not deepgram.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Deepgram API key not configured. Please set DEEPGRAM_API_KEY environment variable."
        )

    try:
        logger.info("tts_request", text_length=len(request.text), model=request.model)

        audio_data = await deepgram.text_to_speech(
            text=request.text,
            model=request.model,
            encoding=request.encoding,
            sample_rate=request.sample_rate,
        )

        # Encode audio as base64 for JSON response
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")

        return TextToSpeechResponse(
            audio=audio_base64,
            audio_format="mp3",
            text_length=len(request.text),
            model=request.model,
        )

    except ValueError as e:
        logger.error("tts_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("tts_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech conversion failed: {str(e)}"
        )


@router.post("/tts/raw")
async def text_to_speech_raw(request: TextToSpeechRequest) -> Response:
    """
    Convert text to speech and return raw audio data.

    This endpoint returns the audio directly as an MP3 file instead of JSON.
    Useful for direct audio playback in browsers.
    """
    deepgram = get_deepgram_service()

    if not deepgram.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Deepgram API key not configured"
        )

    try:
        audio_data = await deepgram.text_to_speech(
            text=request.text,
            model=request.model,
            encoding=request.encoding,
            sample_rate=request.sample_rate,
        )

        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )

    except Exception as e:
        logger.error("tts_raw_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech conversion failed: {str(e)}"
        )


@router.post("/stt", response_model=SpeechToTextResponse)
async def speech_to_text(request: SpeechToTextRequest) -> SpeechToTextResponse:
    """
    Convert speech to text using Deepgram's STT API.

    This endpoint accepts base64-encoded audio and returns the transcription.
    """
    deepgram = get_deepgram_service()

    if not deepgram.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Deepgram API key not configured"
        )

    try:
        # Decode base64 audio
        audio_data = base64.b64decode(request.audio)

        logger.info(
            "stt_request",
            audio_size=len(audio_data),
            model=request.model,
            language=request.language
        )

        result = await deepgram.speech_to_text(
            audio_data=audio_data,
            model=request.model,
            language=request.language,
            punctuate=request.punctuate,
            diarize=request.diarize,
        )

        return SpeechToTextResponse(**result)

    except Exception as e:
        logger.error("stt_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech-to-text conversion failed: {str(e)}"
        )


@router.post("/query", response_model=VoiceQueryResponse)
async def voice_query(request: VoiceQueryRequest) -> VoiceQueryResponse:
    """
    Complete voice-to-voice AI agent pipeline.

    This endpoint:
    1. Transcribes user's voice input (STT)
    2. Generates AI response using Claude or Gemini
    3. Converts AI response to speech (TTS)
    4. Returns both text and audio responses
    """
    deepgram = get_deepgram_service()

    if not deepgram.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Deepgram API key not configured"
        )

    try:
        # Decode audio
        audio_data = base64.b64decode(request.audio)

        logger.info(
            "voice_query_request",
            audio_size=len(audio_data),
            ai_provider=request.ai_provider
        )

        # Process voice query
        result = await deepgram.process_voice_query(
            audio_data=audio_data,
            ai_provider=request.ai_provider,
        )

        return VoiceQueryResponse(**result)

    except ValueError as e:
        logger.error("voice_query_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("voice_query_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice query processing failed: {str(e)}"
        )


@router.post("/speak", response_model=VoiceTextResponse)
async def voice_text_query(request: VoiceTextRequest) -> VoiceTextResponse:
    """
    Generate AI response from text and convert to speech.

    This endpoint:
    1. Generates AI response from text prompt
    2. Converts the response to speech
    3. Returns both text and audio

    Useful for text-based chatbots with voice output.
    """
    deepgram = get_deepgram_service()

    if not deepgram.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Deepgram API key not configured"
        )

    try:
        logger.info(
            "voice_text_request",
            prompt_length=len(request.prompt),
            ai_provider=request.ai_provider
        )

        result = await deepgram.generate_voice_response(
            prompt=request.prompt,
            ai_provider=request.ai_provider,
        )

        return VoiceTextResponse(**result)

    except ValueError as e:
        logger.error("voice_text_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("voice_text_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice text processing failed: {str(e)}"
        )
