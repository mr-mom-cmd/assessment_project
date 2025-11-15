import React from "react";

export interface TranscriptEntry {
  speaker: "user" | "bot";
  text: string;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ entries }) => {
  return (
    <section className="panel transcript-panel">
      <h2>Transcript</h2>
      <div className="transcript-panel__body">
        {entries.length === 0 && (
          <p className="transcript-panel__empty">
            Start speaking or type a question to see the transcript here.
          </p>
        )}
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className={`transcript-line transcript-line--${entry.speaker}`}
          >
            <span className="transcript-line__speaker">
              {entry.speaker === "user" ? "You" : "Bot"}
            </span>
            <span className="transcript-line__text">{entry.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
