import React, { useEffect, useState, useRef } from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { VoiceRecognitionProps } from '../types';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  [index: number]: SpeechRecognitionResult;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onnomatch: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onResult,
  isListening,
  setIsListening
}) => {
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSound, setHasSound] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [suggestion, setSuggestion] = useState<{ original: string; suggestion: string; fullName: string } | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearMessageTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const hasRecognizedRef = useRef<boolean>(false);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (clearMessageTimeout.current) {
      clearTimeout(clearMessageTimeout.current);
      clearMessageTimeout.current = null;
    }
  };

  const showTemporaryMessage = (message: string, isError: boolean = false, duration: number = 2000) => {
    if (isError) {
      setError(message);
      setInterimTranscript('');
    } else {
      setError(null);
      setInterimTranscript(message);
    }

    if (clearMessageTimeout.current) {
      clearTimeout(clearMessageTimeout.current);
    }
    clearMessageTimeout.current = setTimeout(() => {
      if (isError) {
        setError(null);
      } else {
        setInterimTranscript('');
      }
    }, duration);
  };

  const startRecognition = (recognitionInstance: ISpeechRecognition) => {
    try {
      recognitionInstance.start();
      setIsListening(true);
      retryCountRef.current = 0;
      hasRecognizedRef.current = false;
    } catch (err) {
      console.error('Error starting recognition:', err);
      showTemporaryMessage('Failed to start voice recognition', true);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setHasSound(false);
      setInterimTranscript('');
      clearTimeouts();
    }
  };

  const startListening = () => {
    if (recognition) {
      startRecognition(recognition);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      showTemporaryMessage('Speech recognition not supported', true);
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    const handleCustomError = (event: CustomEvent) => {
      showTemporaryMessage(event.detail.error, true);
    };

    const handleSuggestion = (event: CustomEvent) => {
      setSuggestion(event.detail);
      setAwaitingConfirmation(true);
      showTemporaryMessage('Do you mean ' + event.detail.fullName + '? Say yes or no.');
    };

    window.addEventListener('voiceRecognitionError', handleCustomError as EventListener);
    window.addEventListener('voiceRecognitionSuggestion', handleSuggestion as EventListener);

    return () => {
      window.removeEventListener('voiceRecognitionError', handleCustomError as EventListener);
      window.removeEventListener('voiceRecognitionSuggestion', handleSuggestion as EventListener);
      clearTimeouts();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognitionInstance: ISpeechRecognition = new SpeechRecognitionAPI();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 10;
        recognitionInstance.lang = 'en-IN';

        recognitionInstance.onstart = () => {
          setError(null);
          setHasSound(false);
          setInterimTranscript('');
          
          timeoutRef.current = setTimeout(() => {
            if (!hasSound && !interimTranscript && isListening && !hasRecognizedRef.current) {
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                startRecognition(recognitionInstance);
              } else {
                showTemporaryMessage('No speech detected. Please try again.', true);
                setIsListening(false);
              }
            }
          }, 2000);
        };

        recognitionInstance.onsoundstart = () => {
          setHasSound(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognitionInstance.onsoundend = () => {
          if (!hasRecognizedRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isListening) {
                recognitionInstance.stop();
              }
            }, 800);
          }
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const results = event.results;
          const lastResultIndex = results.length - 1;
          const lastResult = results[lastResultIndex];
          const transcript = lastResult[0].transcript.trim().toLowerCase();

          // Always show what user is saying
          showTemporaryMessage(transcript);

          if (lastResult.isFinal) {
            if (awaitingConfirmation) {
              if (transcript === 'yes' || transcript.includes('yes')) {
                if (suggestion) {
                  onResult(suggestion.suggestion);
                  hasRecognizedRef.current = true;
                  setSuggestion(null);
                  setAwaitingConfirmation(false);
                  recognitionInstance.stop();
                }
              } else if (transcript === 'no' || transcript.includes('no')) {
                setSuggestion(null);
                setAwaitingConfirmation(false);
                showTemporaryMessage('Please try saying the symbol again.');
              } else {
                showTemporaryMessage('Please say yes or no. Do you mean ' + suggestion?.fullName + '?');
              }
            } else {
              onResult(transcript);
              hasRecognizedRef.current = true;
              recognitionInstance.stop();
            }
          }
        };

        recognitionInstance.onerror = (event: { error: string }) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            showTemporaryMessage('No speech detected. Please try again.', true);
          } else {
            showTemporaryMessage('Error: ' + event.error, true);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setIsListening(false);
        };

        recognitionInstance.onnomatch = () => {
          if (!hasRecognizedRef.current) {
            showTemporaryMessage('Could not recognize speech. Please try again.', true);
          }
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          if (!hasRecognizedRef.current && isListening && retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            startRecognition(recognitionInstance);
          } else {
            setIsListening(false);
          }
        };

        setRecognition(recognitionInstance);
      } else {
        showTemporaryMessage('Speech recognition not supported in this browser', true);
      }
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
      clearTimeouts();
    };
  }, [onResult, setIsListening, hasSound, isListening]);

  useEffect(() => {
    return () => {
      if (clearMessageTimeout.current) {
        clearTimeout(clearMessageTimeout.current);
      }
    };
  }, []);

  return (
    <Box sx={{ 
      position: { xs: 'fixed', sm: 'relative' },
      right: { xs: '1rem', sm: 'auto' },
      bottom: { xs: '1rem', sm: 'auto' },
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: { xs: 'flex-end', sm: 'center' },
      zIndex: { xs: 1100, sm: 1 }
    }}>
      {(interimTranscript || error) && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: { xs: '0', sm: '50%' },
            transform: { xs: 'none', sm: 'translateX(50%)' },
            marginBottom: '0.5rem',
            color: error ? 'error.main' : (awaitingConfirmation ? 'primary.main' : 'text.secondary'),
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
            textAlign: { xs: 'right', sm: 'center' },
            backgroundColor: { xs: 'rgba(255, 255, 255, 0.9)', sm: 'transparent' }
          }}
        >
          {error || interimTranscript}
        </Typography>
      )}
      <Tooltip title={isListening ? 'Stop listening' : 'Start listening'}>
        <IconButton
          onClick={toggleListening}
          color={isListening ? 'primary' : 'default'}
          sx={{
            bgcolor: { 
              xs: 'rgba(255, 255, 255, 0.9)', 
              sm: isListening ? 'rgba(25, 118, 210, 0.08)' : 'transparent' 
            },
            width: { xs: '3rem', sm: '2.5rem' },
            height: { xs: '3rem', sm: '2.5rem' },
            boxShadow: { 
              xs: '0 0.125rem 0.5rem rgba(0, 0, 0, 0.1)', 
              sm: 'none' 
            },
            '&:hover': {
              bgcolor: { 
                xs: 'rgba(255, 255, 255, 1)',
                sm: isListening ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
              }
            }
          }}
        >
          {isListening ? (
            <MicIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.25rem' } }} />
          ) : (
            <MicOffIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.25rem' } }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default VoiceRecognition;