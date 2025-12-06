# Deepgram Voice AI Integration

This document describes the Deepgram Voice AI integration for the Meta Growth Agent platform.

## Overview

The Meta Growth Agent now includes voice capabilities powered by Deepgram's Voice AI Agent SDK. This integration enables:

- **Text-to-Speech (TTS)**: Convert AI-generated text to natural-sounding speech
- **Speech-to-Text (STT)**: Transcribe user voice input to text
- **Voice-to-Voice AI**: Complete conversational AI with voice input and output
- **Multi-Provider Support**: Use Claude or Gemini for AI responses with voice output

## Features

### 1. Voice Models

**TTS Models Available:**
- **Female Voices:**
  - `aura-asteria-en` - Friendly female voice (default)
  - `aura-luna-en` - Warm female voice
  - `aura-stella-en` - Energetic female voice
  - `aura-athena-en` - Professional female voice
  - `aura-hera-en` - Authoritative female voice

- **Male Voices:**
  - `aura-orion-en` - Deep male voice
  - `aura-arcas-en` - Friendly male voice
  - `aura-perseus-en` - Professional male voice
  - `aura-angus-en` - Conversational male voice
  - `aura-orpheus-en` - Expressive male voice
  - `aura-helios-en` - Bright male voice
  - `aura-zeus-en` - Commanding male voice

**STT Models Available:**
- `nova-2` - Latest and most accurate (default)
- `nova` - Previous generation
- `enhanced` - Enhanced model
- `base` - Base model

### 2. API Endpoints

All endpoints are available under `/voice` prefix:

#### Health Check
```
GET /voice/health
```
Returns voice service status and available models.

#### Text-to-Speech
```
POST /voice/tts
```
Convert text to speech, returns base64-encoded audio.

**Request:**
```json
{
  "text": "Hello, how can I help you today?",
  "model": "aura-asteria-en",
  "encoding": "linear16",
  "sample_rate": 24000
}
```

**Response:**
```json
{
  "audio": "base64-encoded-audio-data",
  "audio_format": "mp3",
  "text_length": 32,
  "model": "aura-asteria-en"
}
```

#### Text-to-Speech (Raw Audio)
```
POST /voice/tts/raw
```
Returns raw MP3 audio file for direct playback.

#### Speech-to-Text
```
POST /voice/stt
```
Transcribe audio to text.

**Request:**
```json
{
  "audio": "base64-encoded-audio-data",
  "model": "nova-2",
  "language": "en",
  "punctuate": true,
  "diarize": false
}
```

**Response:**
```json
{
  "transcript": "What are my top competitors?",
  "confidence": 0.98,
  "words": [...],
  "metadata": {...}
}
```

#### Voice Query (Voice-to-Voice)
```
POST /voice/query
```
Complete voice pipeline: STT → AI → TTS

**Request:**
```json
{
  "audio": "base64-encoded-audio-data",
  "ai_provider": "claude",
  "context": {}
}
```

**Response:**
```json
{
  "user_question": "What are my top competitors?",
  "user_confidence": 0.98,
  "ai_response": "Based on the analysis...",
  "audio_response": "base64-encoded-audio",
  "audio_format": "mp3",
  "provider": "claude",
  "model": "claude-3-5-sonnet-20240620"
}
```

#### Voice Text Query
```
POST /voice/speak
```
Generate AI response from text with voice output.

**Request:**
```json
{
  "prompt": "What are my top competitors?",
  "ai_provider": "claude",
  "voice_model": "aura-asteria-en"
}
```

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies:**
```bash
pip install deepgram-sdk>=3.0.0
```

2. **Configure API Key:**

Create a `.env` file or set environment variable:
```bash
DEEPGRAM_API_KEY=c10b27e09356ce29237fb05cbfead69cb413cd72
```

3. **Start Backend:**
```bash
uvicorn app.main:app --reload
```

### 2. Frontend Integration

The voice interface is available as a React component: `VoiceAgent.tsx`

**Import and Use:**
```tsx
import VoiceAgent from './components/VoiceAgent';

function App() {
  return (
    <div>
      <VoiceAgent />
    </div>
  );
}
```

### 3. Usage Examples

#### Using Voice Service Directly (Frontend)

```typescript
import voiceService from './services/voiceService';

// Text to Speech
const response = await voiceService.textToSpeech({
  text: "Hello from AI!",
  model: "aura-asteria-en"
});
await voiceService.playAudio(response.audio, response.audio_format);

// Speech to Text
const audioBase64 = await voiceService.recordAudio(5000);
const transcript = await voiceService.speechToText({
  audio: audioBase64
});
console.log(transcript.transcript);

// Voice-to-Voice Query
const voiceResponse = await voiceService.voiceQuery({
  audio: audioBase64,
  ai_provider: "claude"
});
console.log(voiceResponse.ai_response);
await voiceService.playAudio(voiceResponse.audio_response);
```

#### Using Python Service (Backend)

```python
from app.services.deepgram_service import get_deepgram_service

deepgram = get_deepgram_service()

# Text to Speech
audio_data = await deepgram.text_to_speech("Hello from AI!")

# Speech to Text
result = await deepgram.speech_to_text(audio_bytes)
print(result["transcript"])

# Voice Response
response = await deepgram.generate_voice_response(
    prompt="What are my competitors?",
    ai_provider="claude"
)
```

## Architecture

```
┌─────────────┐
│   Frontend  │
│  VoiceAgent │
└──────┬──────┘
       │ HTTP/JSON
       ▼
┌─────────────────┐
│  Voice Router   │
│  /voice/*       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ DeepgramService │─────▶│  Deepgram    │
│                 │      │  Voice AI    │
└────────┬────────┘      └──────────────┘
         │
         │ Uses
         ▼
┌─────────────────┐      ┌──────────────┐
│  AI Providers   │─────▶│ Claude/Gemini│
│  (Claude/Gemini)│      │              │
└─────────────────┘      └──────────────┘
```

## Integration with Marketing Intelligence

The voice agent can be used to:

1. **Voice-Activated Queries**: "What are my top competitors?"
2. **Spoken Reports**: Convert analysis reports to voice
3. **Conversational Analytics**: Ask questions about your metrics
4. **Accessibility**: Make the platform accessible via voice

### Example Marketing Use Cases

```typescript
// Get competitor analysis via voice
const response = await voiceService.voiceTextQuery({
  prompt: "Analyze my top 3 competitors and their traffic sources",
  ai_provider: "gemini"
});

// Voice-enabled dashboard
const summary = await voiceService.voiceTextQuery({
  prompt: "Give me an executive summary of this week's performance",
  ai_provider: "claude",
  voice_model: "aura-athena-en" // Professional voice
});
```

## Configuration

All configuration is in `app/config.py`:

```python
class Settings(BaseSettings):
    # Deepgram Voice AI configuration
    deepgram_api_key: str = Field("", alias="DEEPGRAM_API_KEY")
```

Environment variables:
- `DEEPGRAM_API_KEY` - Your Deepgram API key (required)

## Testing

Test the voice endpoints:

```bash
# Check health
curl http://localhost:8000/voice/health

# Test TTS
curl -X POST http://localhost:8000/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from Deepgram!"}'

# Get raw audio
curl -X POST http://localhost:8000/voice/tts/raw \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!"}' \
  --output speech.mp3
```

## Deployment

When deploying, make sure to:

1. Set `DEEPGRAM_API_KEY` environment variable
2. Ensure frontend can access backend `/voice` endpoints
3. Configure CORS to allow voice API calls

### Railway/Render Deployment

Add to your deployment environment variables:
```
DEEPGRAM_API_KEY=c10b27e09356ce29237fb05cbfead69cb413cd72
```

### Vercel Frontend

The frontend voice component will automatically connect to your backend API:
```
VITE_API_URL=https://your-backend.railway.app
```

## Troubleshooting

### "Deepgram API key not configured"
- Check that `DEEPGRAM_API_KEY` is set in your environment
- Verify the key is valid
- Restart the backend server

### "Failed to connect to voice service"
- Ensure backend is running and accessible
- Check CORS configuration
- Verify `VITE_API_URL` in frontend

### Audio not playing
- Check browser console for errors
- Ensure browser supports Web Audio API
- Verify audio data is valid base64

### Microphone not working
- Grant microphone permissions in browser
- Check if HTTPS is being used (required for mic access)
- Verify MediaDevices API is supported

## API Key Security

**IMPORTANT**: Never commit the API key to version control!

- Store in `.env` file (not committed)
- Use environment variables in production
- Rotate keys regularly
- Use different keys for dev/prod

## Rate Limits

Deepgram has usage limits based on your plan. Monitor usage and upgrade if needed.

## Support

For Deepgram-specific issues, refer to:
- [Deepgram Documentation](https://developers.deepgram.com/)
- [Deepgram Python SDK](https://github.com/deepgram/deepgram-python-sdk)

For integration issues, check the logs:
```bash
# Backend logs
uvicorn app.main:app --reload --log-level debug

# Frontend console
# Open browser DevTools → Console
```

---

**Integration Complete!** 🎉

Your Meta Growth Agent now has voice AI capabilities powered by Deepgram.
