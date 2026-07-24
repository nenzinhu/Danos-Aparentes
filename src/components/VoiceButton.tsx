import React from 'react';

interface VoiceButtonProps {
  text: string;
}

export default function VoiceButton({ text }: VoiceButtonProps) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  return (
    <button
      type="button"
      onClick={speak}
      className="ml-2 text-primary hover:text-primary-light transition-colors"
      aria-label="Reproduzir áudio"
    >
      🔊
    </button>
  );
}
