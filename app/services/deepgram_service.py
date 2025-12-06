"""Deepgram Voice AI service for text-to-speech and speech-to-text capabilities."""
from __future__ import annotations

import asyncio
import base64
from typing import Any, AsyncGenerator

import structlog
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
    PrerecordedOptions,
    SpeakOptions,
)

from app.config import get_settings

logger = structlog.get_logger(__name__)


class DeepgramService:
    """Service for interacting with Deepgram Voice AI."""

    def __init__(self):
        """Initialize Deepgram service with API key from settings."""
        settings = get_settings()
        self.api_key = settings.deepgram_api_key

        if not self.api_key:
            logger.warning("Deepgram API key not configured")
            self.client = None
        else:
            # Initialize Deepgram client
            config = DeepgramClientOptions(
                options={"keepalive": "true"}
            )
            self.client = DeepgramClient(self.api_key, config)
            logger.info("Deepgram service initialized")

    def is_configured(self) -> bool:
        """Check if Deepgram is properly configured."""
        return self.client is not None

    async def text_to_speech(
        self,
        text: str,
        model: str = "aura-asteria-en",
        encoding: str = "linear16",
        sample_rate: int = 24000,
    ) -> bytes:
        """
        Convert text to speech using Deepgram's TTS API.

        Args:
            text: Text to convert to speech
            model: Deepgram TTS model to use (default: aura-asteria-en)
                   Available models: aura-asteria-en, aura-luna-en, aura-stella-en, etc.
            encoding: Audio encoding format (default: linear16)
            sample_rate: Audio sample rate in Hz (default: 24000)

        Returns:
            Audio data as bytes

        Raises:
            ValueError: If Deepgram is not configured
            Exception: If TTS request fails
        """
        if not self.is_configured():
            raise ValueError("Deepgram API key not configured")

        try:
            options = SpeakOptions(
                model=model,
                encoding=encoding,
                sample_rate=sample_rate,
            )

            logger.info(
                "generating_speech",
                text_length=len(text),
                model=model,
                encoding=encoding,
                sample_rate=sample_rate
            )

            response = self.client.speak.v("1").save(
                filename="output.mp3",  # This will be in-memory
                source={"text": text},
                options=options
            )

            # Read the audio data
            with open("output.mp3", "rb") as audio_file:
                audio_data = audio_file.read()

            logger.info("speech_generated", audio_size=len(audio_data))
            return audio_data

        except Exception as e:
            logger.error("text_to_speech_error", error=str(e))
            raise

    async def speech_to_text(
        self,
        audio_data: bytes,
        model: str = "nova-2",
        language: str = "en",
        punctuate: bool = True,
        diarize: bool = False,
    ) -> dict[str, Any]:
        """
        Convert speech to text using Deepgram's STT API.

        Args:
            audio_data: Audio data as bytes
            model: Deepgram STT model (default: nova-2)
            language: Language code (default: en)
            punctuate: Add punctuation to transcript (default: True)
            diarize: Enable speaker diarization (default: False)

        Returns:
            Transcription result with text and metadata

        Raises:
            ValueError: If Deepgram is not configured
            Exception: If STT request fails
        """
        if not self.is_configured():
            raise ValueError("Deepgram API key not configured")

        try:
            options = PrerecordedOptions(
                model=model,
                language=language,
                punctuate=punctuate,
                diarize=diarize,
                smart_format=True,
            )

            logger.info(
                "transcribing_audio",
                audio_size=len(audio_data),
                model=model,
                language=language
            )

            # Create payload with audio data
            payload = {"buffer": audio_data}

            response = self.client.listen.prerecorded.v("1").transcribe_file(
                payload,
                options
            )

            # Extract transcript
            result = response.to_dict()
            transcript = ""

            if result.get("results", {}).get("channels"):
                channel = result["results"]["channels"][0]
                if channel.get("alternatives"):
                    transcript = channel["alternatives"][0].get("transcript", "")

            logger.info("transcription_complete", transcript_length=len(transcript))

            return {
                "transcript": transcript,
                "confidence": result.get("results", {}).get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                    .get("confidence", 0.0),
                "words": result.get("results", {}).get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                    .get("words", []),
                "metadata": result.get("metadata", {}),
            }

        except Exception as e:
            logger.error("speech_to_text_error", error=str(e))
            raise

    async def generate_voice_response(
        self,
        prompt: str,
        ai_provider: str = "claude",
    ) -> dict[str, Any]:
        """
        Generate an AI response and convert it to speech.

        This combines the AI providers (Claude/Gemini) with Deepgram TTS
        to create a voice-enabled AI agent.

        Args:
            prompt: User prompt/question
            ai_provider: Which AI provider to use (claude or gemini)

        Returns:
            Dictionary with text response and audio data
        """
        if not self.is_configured():
            raise ValueError("Deepgram API key not configured")

        try:
            # Import AI providers
            from app.services.ai_providers import AIProviderFactory

            # Generate text response using AI
            logger.info("generating_ai_response", provider=ai_provider)
            ai = AIProviderFactory.get_provider(ai_provider)
            ai_response = ai.generate(prompt)

            text_response = ai_response.content

            # Convert response to speech
            logger.info("converting_to_speech", text_length=len(text_response))
            audio_data = await self.text_to_speech(text_response)

            return {
                "text": text_response,
                "audio": base64.b64encode(audio_data).decode("utf-8"),
                "audio_format": "mp3",
                "provider": ai_provider,
                "model": ai_response.model,
            }

        except Exception as e:
            logger.error("voice_response_error", error=str(e))
            raise

    async def process_voice_query(
        self,
        audio_data: bytes,
        ai_provider: str = "claude",
    ) -> dict[str, Any]:
        """
        Complete voice-to-voice pipeline: STT -> AI -> TTS.

        Args:
            audio_data: User's voice input as audio bytes
            ai_provider: Which AI provider to use for response

        Returns:
            Dictionary with transcribed question, text answer, and audio response
        """
        if not self.is_configured():
            raise ValueError("Deepgram API key not configured")

        try:
            # Step 1: Transcribe user's voice input
            logger.info("transcribing_user_input")
            transcription = await self.speech_to_text(audio_data)
            user_question = transcription["transcript"]

            if not user_question:
                raise ValueError("Could not transcribe audio")

            # Step 2: Generate AI response with voice
            logger.info("generating_voice_response", question=user_question)
            response = await self.generate_voice_response(
                prompt=user_question,
                ai_provider=ai_provider
            )

            return {
                "user_question": user_question,
                "user_confidence": transcription["confidence"],
                "ai_response": response["text"],
                "audio_response": response["audio"],
                "audio_format": response["audio_format"],
                "provider": response["provider"],
                "model": response["model"],
            }

        except Exception as e:
            logger.error("voice_query_error", error=str(e))
            raise


# Singleton instance
_deepgram_service: DeepgramService | None = None


def get_deepgram_service() -> DeepgramService:
    """Get or create the Deepgram service singleton."""
    global _deepgram_service
    if _deepgram_service is None:
        _deepgram_service = DeepgramService()
    return _deepgram_service
