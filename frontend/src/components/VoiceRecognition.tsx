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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const hasRecognizedRef = useRef<boolean>(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout>();
  const [showMessage, setShowMessage] = useState(false);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
  };

  const setErrorWithTimeout = (errorMessage: string) => {
    setError(errorMessage);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError('');
    }, 3000); // Error message will disappear after 3 seconds
  };

  const startRecognition = (recognitionInstance: ISpeechRecognition) => {
    try {
      recognitionInstance.start();
      setIsListening(true);
      retryCountRef.current = 0;
      hasRecognizedRef.current = false;
    } catch (err) {
      console.error('Error starting recognition:', err);
      setErrorWithTimeout('Failed to start voice recognition');
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
      setErrorWithTimeout('Speech recognition not supported');
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
      setErrorWithTimeout(event.detail.error);
    };

    window.addEventListener('voiceRecognitionError', handleCustomError as EventListener);

    return () => {
      window.removeEventListener('voiceRecognitionError', handleCustomError as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognitionInstance: ISpeechRecognition = new SpeechRecognitionAPI();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 5;
        recognitionInstance.lang = 'en-IN';

        recognitionInstance.onstart = () => {
          console.log('Voice recognition started');
          setError('');
          setHasSound(false);
          setInterimTranscript('');
          
          timeoutRef.current = setTimeout(() => {
            if (!hasSound && !interimTranscript && isListening && !hasRecognizedRef.current) {
              console.log('No speech detected, stopping...');
              recognitionInstance.stop();
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                startRecognition(recognitionInstance);
              } else {
                setErrorWithTimeout('No speech detected. Please try again.');
                setIsListening(false);
              }
            }
          }, 5000);
        };

        recognitionInstance.onsoundstart = () => {
          console.log('Sound detected');
          setHasSound(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognitionInstance.onsoundend = () => {
          console.log('Sound ended');
          if (!hasRecognizedRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isListening) {
                recognitionInstance.stop();
              }
            }, 1500);
          }
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const results = event.results;
          const lastResultIndex = results.length - 1;
          const lastResult = results[lastResultIndex];
          
          if (lastResult) {
            const mostConfidentResult = Array.from({ length: lastResult.length })
              .map((_, i) => lastResult[i])
              .reduce((prev, current) => 
                current.confidence > prev.confidence ? current : prev
              );

            const transcript = mostConfidentResult.transcript.trim();
            
            if (lastResult.isFinal) {
              console.log('Final transcript:', transcript);
              if (transcript) {
                hasRecognizedRef.current = true;
                clearTimeouts();
                retryCountRef.current = maxRetries;
                setError('');
                onResult(transcript);
                recognitionInstance.stop();
                setIsListening(false);
                // Reset message after final result
                if (messageTimeoutRef.current) {
                  clearTimeout(messageTimeoutRef.current);
                }
                messageTimeoutRef.current = setTimeout(() => {
                  setShowMessage(false);
                  setInterimTranscript('');
                }, 3000);
              }
            } else {
              setInterimTranscript(transcript);
            }
          }
        };

        recognitionInstance.onerror = (event: { error: string }) => {
          console.error('Speech recognition error:', event.error);
          if (!hasRecognizedRef.current && event.error !== 'no-speech') {
            setErrorWithTimeout(event.error);
          }
          setIsListening(false);
          clearTimeouts();
        };

        recognitionInstance.onnomatch = () => {
          console.log('No match found');
          if (!hasRecognizedRef.current) {
            setErrorWithTimeout('Could not recognize speech. Please try again.');
          }
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          console.log('Voice recognition ended');
          setIsListening(false);
          clearTimeouts();
          
          if (!hasSound && !hasRecognizedRef.current && retryCountRef.current >= maxRetries) {
            setErrorWithTimeout('No speech detected. Please try again.');
          }
        };

        setRecognition(recognitionInstance);
      } else {
        setErrorWithTimeout('Speech recognition not supported in this browser');
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
    if (error || (isListening && hasSound)) {
      setShowMessage(true);
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setShowMessage(false);
        setInterimTranscript('');
      }, 3000);
    }
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [error, isListening, hasSound]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      position: { xs: 'fixed', sm: 'relative' },
      right: { xs: '16px', sm: 'auto' },
      bottom: { xs: '16px', sm: 'auto' },
      zIndex: { xs: 1000, sm: 1 }
    }}>
      {showMessage && (
        <Typography 
          variant="caption" 
          color={error ? "error" : "primary"} 
          sx={{ 
            position: 'fixed',
            bottom: '88px',
            right: '16px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 32px)',
            transition: 'opacity 0.3s ease',
            '@media (min-width: 600px)': {
              position: 'absolute',
              bottom: '100%',
              right: '50%',
              transform: 'translateX(50%)',
              textAlign: 'center',
              mb: 1
            }
          }}
        >
          {error || (interimTranscript || 'Listening...')}
        </Typography>
      )}
      <Tooltip title={isListening ? "Stop listening" : "Start voice search"}>
        <IconButton 
          onClick={toggleListening}
          color={isListening ? "primary" : "default"}
          sx={{
            width: { xs: '56px', sm: '40px' },
            height: { xs: '56px', sm: '40px' },
            backgroundColor: { xs: 'rgba(255, 255, 255, 0.05)', sm: 'rgba(255, 255, 255, 0.8)' },
            backdropFilter: { xs: 'blur(16px)', sm: 'blur(8px)' },
            WebkitBackdropFilter: { xs: 'blur(16px)', sm: 'blur(8px)' },
            border: { xs: '1px solid rgba(255, 255, 255, 0.1)', sm: 'none' },
            boxShadow: { 
              xs: '0 8px 32px rgba(0, 0, 0, 0.1)', 
              sm: 'none' 
            },
            '&:hover': {
              backgroundColor: { 
                xs: 'rgba(255, 255, 255, 0.1)',
                sm: 'rgba(255, 255, 255, 0.9)'
              },
            },
            ...(isListening && {
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)',
                },
                '70%': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                },
                '100%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                },
              },
            }),
          }}
        >
          {isListening ? 
            <MicIcon sx={{ fontSize: { xs: '24px', sm: '20px' } }} /> : 
            <MicOffIcon sx={{ fontSize: { xs: '24px', sm: '20px' } }} />
          }
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default VoiceRecognition;
