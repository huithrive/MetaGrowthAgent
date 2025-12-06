import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageSquare } from 'lucide-react';
import voiceService, { VoiceHealthResponse } from '../services/voiceService';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  audio?: string;
  timestamp: Date;
}

const VoiceAgent: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [aiProvider, setAiProvider] = useState<'claude' | 'gemini'>('claude');
  const [voiceModel, setVoiceModel] = useState('aura-asteria-en');
  const [health, setHealth] = useState<VoiceHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check voice service health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const healthStatus = await voiceService.checkHealth();
      setHealth(healthStatus);
      if (!healthStatus.configured) {
        setError('Voice service is not configured. Please check DEEPGRAM_API_KEY.');
      }
    } catch (err) {
      setError('Failed to connect to voice service');
      console.error('Health check failed:', err);
    }
  };

  const handleVoiceQuery = async () => {
    if (isRecording || isProcessing) return;

    try {
      setError(null);
      setIsRecording(true);

      // Record audio for 5 seconds (or until stopped)
      const audioBase64 = await voiceService.recordAudio(5000);

      setIsRecording(false);
      setIsProcessing(true);

      // Process voice query
      const response = await voiceService.voiceQuery({
        audio: audioBase64,
        ai_provider: aiProvider,
      });

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: response.user_question,
        timestamp: new Date(),
      };

      // Add agent response
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        text: response.ai_response,
        audio: response.audio_response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, agentMessage]);

      // Play audio response
      setIsPlaying(true);
      await voiceService.playAudio(response.audio_response, response.audio_format);
      setIsPlaying(false);

      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Voice query failed');
      setIsRecording(false);
      setIsProcessing(false);
      setIsPlaying(false);
      console.error('Voice query error:', err);
    }
  };

  const handleTextQuery = async () => {
    if (!textInput.trim() || isProcessing) return;

    try {
      setError(null);
      setIsProcessing(true);

      const userText = textInput;
      setTextInput('');

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: userText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response with voice
      const response = await voiceService.voiceTextQuery({
        prompt: userText,
        ai_provider: aiProvider,
        voice_model: voiceModel,
      });

      // Add agent response
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        text: response.text,
        audio: response.audio,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);

      // Play audio response
      setIsPlaying(true);
      await voiceService.playAudio(response.audio, response.audio_format);
      setIsPlaying(false);

      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Text query failed');
      setIsProcessing(false);
      setIsPlaying(false);
      console.error('Text query error:', err);
    }
  };

  const playMessageAudio = async (audio: string, format: string = 'mp3') => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      await voiceService.playAudio(audio, format);
      setIsPlaying(false);
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    }
  };

  if (!health) {
    return (
      <div className="voice-agent-container loading">
        <Loader2 className="spinner" />
        <p>Connecting to voice service...</p>
      </div>
    );
  }

  return (
    <div className="voice-agent-container">
      <div className="voice-agent-header">
        <h2>🎙️ Voice AI Agent</h2>
        <div className="status">
          <span className={`status-indicator ${health.configured ? 'active' : 'inactive'}`}>
            {health.configured ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="settings">
        <div className="setting-group">
          <label>AI Provider:</label>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value as 'claude' | 'gemini')}
            disabled={isProcessing}
          >
            <option value="claude">Claude (Strategic)</option>
            <option value="gemini">Gemini (Data-focused)</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Voice:</label>
          <select
            value={voiceModel}
            onChange={(e) => setVoiceModel(e.target.value)}
            disabled={isProcessing}
          >
            <optgroup label="Female Voices">
              <option value="aura-asteria-en">Asteria (Friendly)</option>
              <option value="aura-luna-en">Luna (Warm)</option>
              <option value="aura-stella-en">Stella (Energetic)</option>
              <option value="aura-athena-en">Athena (Professional)</option>
            </optgroup>
            <optgroup label="Male Voices">
              <option value="aura-orion-en">Orion (Deep)</option>
              <option value="aura-arcas-en">Arcas (Friendly)</option>
              <option value="aura-perseus-en">Perseus (Professional)</option>
              <option value="aura-angus-en">Angus (Conversational)</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} opacity={0.3} />
            <p>Start a conversation with voice or text</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-header">
                <span className="message-sender">
                  {message.type === 'user' ? '👤 You' : '🤖 AI Agent'}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{message.text}</div>
              {message.audio && (
                <button
                  className="play-audio-btn"
                  onClick={() => playMessageAudio(message.audio!, 'mp3')}
                  disabled={isPlaying}
                >
                  <Volume2 size={16} />
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="input-container">
        <div className="text-input-group">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTextQuery()}
            placeholder="Type your message or use voice..."
            disabled={isProcessing || !health.configured}
          />
          <button
            className="send-btn"
            onClick={handleTextQuery}
            disabled={!textInput.trim() || isProcessing || !health.configured}
          >
            Send
          </button>
        </div>

        <div className="voice-controls">
          <button
            className={`voice-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={handleVoiceQuery}
            disabled={isProcessing || isPlaying || !health.configured}
          >
            {isRecording ? (
              <>
                <MicOff size={24} />
                <span>Recording...</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="spinner" size={24} />
                <span>Processing...</span>
              </>
            ) : isPlaying ? (
              <>
                <Volume2 size={24} />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Mic size={24} />
                <span>Push to Talk</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .voice-agent-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .voice-agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .voice-agent-header h2 {
          margin: 0;
          color: #fff;
          font-size: 1.5rem;
        }

        .status-indicator {
          font-size: 0.875rem;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          background: rgba(31, 41, 55, 0.8);
        }

        .status-indicator.active {
          color: #10b981;
        }

        .status-indicator.inactive {
          color: #ef4444;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .settings {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .setting-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-group label {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .setting-group select {
          padding: 0.5rem;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 0.875rem;
        }

        .messages-container {
          height: 400px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
        }

        .message {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 8px;
        }

        .message.user {
          background: rgba(59, 130, 246, 0.1);
          border-left: 3px solid #3b82f6;
        }

        .message.agent {
          background: rgba(99, 102, 241, 0.1);
          border-left: 3px solid #6366f1;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .message-text {
          color: #e2e8f0;
          line-height: 1.5;
        }

        .play-audio-btn {
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 6px;
          color: #a5b4fc;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .play-audio-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.3);
        }

        .play-audio-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .text-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .text-input-group input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 0.875rem;
        }

        .send-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          color: #a5b4fc;
          cursor: pointer;
          font-weight: 500;
        }

        .send-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-controls {
          display: flex;
          justify-content: center;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 999px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .voice-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .voice-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-btn.recording {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-btn.processing {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default VoiceAgent;
