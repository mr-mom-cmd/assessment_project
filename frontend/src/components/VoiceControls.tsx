import React from "react";

interface VoiceControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isBusy: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  isBusy
}) => {
  return (
    <section className="panel controls-panel">
      <h2>Voice Controls</h2>
      <div className="controls-panel__buttons">
        {!isRecording ? (
          <button
            className="btn btn-primary"
            onClick={onStartRecording}
            disabled={isBusy}
          >
            🎙 Start Talking
          </button>
        ) : (
          <button className="btn btn-danger" onClick={onStopRecording}>
            ⏹ Stop
          </button>
        )}
      </div>
      {isBusy && <p className="controls-panel__status">Processing…</p>}
      {!isBusy && !isRecording && (
        <p className="controls-panel__tip">
          Tip: Ask things like "What's my order status?" or "How do refunds
          work?"
        </p>
      )}
    </section>
  );
};
