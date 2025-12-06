// Voice AI service for Deepgram integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface VoiceHealthResponse {
  configured: boolean;
  api_key_present: boolean;
  available_tts_models: string[];
  available_stt_models: string[];
}

export interface TextToSpeechRequest {
  text: string;
  model?: string;
  encoding?: string;
  sample_rate?: number;
}

export interface TextToSpeechResponse {
  audio: string; // Base64-encoded
  audio_format: string;
  text_length: number;
  model: string;
}

export interface SpeechToTextRequest {
  audio: string; // Base64-encoded
  model?: string;
  language?: string;
  punctuate?: boolean;
  diarize?: boolean;
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  metadata: Record<string, any>;
}

export interface VoiceQueryRequest {
  audio: string; // Base64-encoded
  ai_provider?: 'claude' | 'gemini';
  context?: Record<string, any>;
}

export interface VoiceQueryResponse {
  user_question: string;
  user_confidence: number;
  ai_response: string;
  audio_response: string; // Base64-encoded
  audio_format: string;
  provider: string;
  model: string;
}

export interface VoiceTextRequest {
  prompt: string;
  ai_provider?: 'claude' | 'gemini';
  voice_model?: string;
  context?: Record<string, any>;
}

export interface VoiceTextResponse {
  text: string;
  audio: string; // Base64-encoded
  audio_format: string;
  provider: string;
  model: string;
}

class VoiceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/voice`;
  }

  /**
   * Check if voice service is available and configured
   */
  async checkHealth(): Promise<VoiceHealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('Voice service health check failed');
    }
    return response.json();
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const response = await fetch(`${this.baseUrl}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        model: request.model || 'aura-asteria-en',
        encoding: request.encoding || 'linear16',
        sample_rate: request.sample_rate || 24000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Text-to-speech failed');
    }

    return response.json();
  }

  /**
   * Get raw audio URL for text-to-speech (for direct playback)
   */
  getTtsAudioUrl(text: string, model: string = 'aura-asteria-en'): string {
    const params = new URLSearchParams({
      text,
      model,
    });
    return `${this.baseUrl}/tts/raw?${params.toString()}`;
  }

  /**
   * Convert speech to text
   */
  async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    const response = await fetch(`${this.baseUrl}/stt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: request.audio,
        model: request.model || 'nova-2',
        language: request.language || 'en',
        punctuate: request.punctuate ?? true,
        diarize: request.diarize ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Speech-to-text failed');
    }

    return response.json();
  }

  /**
   * Process voice query (STT -> AI -> TTS)
   */
  async voiceQuery(request: VoiceQueryRequest): Promise<VoiceQueryResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: request.audio,
        ai_provider: request.ai_provider || 'claude',
        context: request.context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Voice query failed');
    }

    return response.json();
  }

  /**
   * Generate AI response with voice output from text input
   */
  async voiceTextQuery(request: VoiceTextRequest): Promise<VoiceTextResponse> {
    const response = await fetch(`${this.baseUrl}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        ai_provider: request.ai_provider || 'claude',
        voice_model: request.voice_model || 'aura-asteria-en',
        context: request.context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Voice text query failed');
    }

    return response.json();
  }

  /**
   * Play base64-encoded audio
   */
  playAudio(base64Audio: string, format: string = 'mp3'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: `audio/${format}` });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };

        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Record audio from microphone
   */
  async recordAudio(durationMs?: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());

          resolve(base64);
        };

        mediaRecorder.start();

        if (durationMs) {
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, durationMs);
        } else {
          // Return a function to stop recording manually
          (window as any).__stopRecording = () => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          };
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new VoiceService();
