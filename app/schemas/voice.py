"""Pydantic schemas for voice AI endpoints."""
from pydantic import BaseModel, Field


class TextToSpeechRequest(BaseModel):
    """Request schema for text-to-speech conversion."""

    text: str = Field(..., description="Text to convert to speech", min_length=1, max_length=10000)
    model: str = Field(
        "aura-asteria-en",
        description="Deepgram TTS model (aura-asteria-en, aura-luna-en, aura-stella-en, etc.)"
    )
    encoding: str = Field("linear16", description="Audio encoding format")
    sample_rate: int = Field(24000, description="Audio sample rate in Hz", ge=8000, le=48000)


class TextToSpeechResponse(BaseModel):
    """Response schema for text-to-speech conversion."""

    audio: str = Field(..., description="Base64-encoded audio data")
    audio_format: str = Field(..., description="Audio format (e.g., mp3, wav)")
    text_length: int = Field(..., description="Length of input text")
    model: str = Field(..., description="Model used for generation")


class SpeechToTextRequest(BaseModel):
    """Request schema for speech-to-text conversion."""

    audio: str = Field(..., description="Base64-encoded audio data")
    model: str = Field("nova-2", description="Deepgram STT model")
    language: str = Field("en", description="Language code (e.g., en, es, fr)")
    punctuate: bool = Field(True, description="Add punctuation to transcript")
    diarize: bool = Field(False, description="Enable speaker diarization")


class SpeechToTextResponse(BaseModel):
    """Response schema for speech-to-text conversion."""

    transcript: str = Field(..., description="Transcribed text")
    confidence: float = Field(..., description="Transcription confidence score", ge=0.0, le=1.0)
    words: list[dict] = Field(default_factory=list, description="Word-level timing information")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")


class VoiceQueryRequest(BaseModel):
    """Request schema for voice-to-voice AI query."""

    audio: str = Field(..., description="Base64-encoded audio of user's question")
    ai_provider: str = Field(
        "claude",
        description="AI provider to use for response (claude or gemini)"
    )
    context: dict | None = Field(
        None,
        description="Optional context data (e.g., account info, previous conversation)"
    )


class VoiceQueryResponse(BaseModel):
    """Response schema for voice-to-voice AI query."""

    user_question: str = Field(..., description="Transcribed user question")
    user_confidence: float = Field(..., description="Transcription confidence")
    ai_response: str = Field(..., description="AI-generated text response")
    audio_response: str = Field(..., description="Base64-encoded audio response")
    audio_format: str = Field(..., description="Audio format of response")
    provider: str = Field(..., description="AI provider used")
    model: str = Field(..., description="Model used for AI generation")


class VoiceTextRequest(BaseModel):
    """Request schema for text-based voice AI response."""

    prompt: str = Field(..., description="Text prompt for AI", min_length=1, max_length=5000)
    ai_provider: str = Field(
        "claude",
        description="AI provider to use (claude or gemini)"
    )
    voice_model: str = Field(
        "aura-asteria-en",
        description="Deepgram TTS model for voice response"
    )
    context: dict | None = Field(
        None,
        description="Optional context data for the AI"
    )


class VoiceTextResponse(BaseModel):
    """Response schema for text-based voice AI response."""

    text: str = Field(..., description="AI-generated text response")
    audio: str = Field(..., description="Base64-encoded audio response")
    audio_format: str = Field(..., description="Audio format")
    provider: str = Field(..., description="AI provider used")
    model: str = Field(..., description="AI model used")


class VoiceHealthResponse(BaseModel):
    """Response schema for voice service health check."""

    configured: bool = Field(..., description="Whether Deepgram is configured")
    api_key_present: bool = Field(..., description="Whether API key is present")
    available_tts_models: list[str] = Field(..., description="Available TTS models")
    available_stt_models: list[str] = Field(..., description="Available STT models")
