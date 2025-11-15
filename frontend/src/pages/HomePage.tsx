import React from "react";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { VoiceControls } from "../components/VoiceControls";
import { ChatInput } from "../components/ChatInput";
import { useVoiceChat } from "../hooks/useVoiceChat";

export const HomePage: React.FC = () => {
  const {
    transcript,
    isRecording,
    isBusy,
    error,
    startRecording,
    stopRecording,
    sendTextMessage
  } = useVoiceChat();

  return (
    <div className="page-grid">
      <div className="column column--main">
        <TranscriptPanel entries={transcript} />
        {error && <p className="error-banner">{error}</p>}
      </div>
      <div className="column column--side">
        <VoiceControls
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isBusy={isBusy}
        />
        <ChatInput onSend={sendTextMessage} disabled={isBusy || isRecording} />
      </div>
    </div>
  );
};
