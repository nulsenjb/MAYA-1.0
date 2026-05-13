'use client';

import { useState } from 'react';

type AnyWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  SpeechRecognition?: new () => SpeechRecognitionLike;
};

type SpeechAlternative = { transcript: string };
type SpeechResult = { [index: number]: SpeechAlternative };
type SpeechResultList = { [index: number]: SpeechResult; length: number };

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
  onresult: ((event: { results: SpeechResultList }) => void) | null;
  start: () => void;
  stop: () => void;
};

export function useVoiceInput(appendTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);

  function toggleVoice() {
    const w = window as AnyWindow;
    const Ctor = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!Ctor) {
      alert('Voice input is not supported in this browser. Try Chrome or Safari.');
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      appendTranscript(transcript);
    };
    recognition.start();
  }

  return { isListening, toggleVoice };
}
