import { useEffect, useRef, useState } from "react";
import { TranscriptEntry } from "../components/TranscriptPanel";
import { transcribeAudio, synthesizeVoice } from "../services/voiceApi";
import { sendChat } from "../services/chatApi";

export const useVoiceChat = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      audioContextRef.current?.close();
    };
  }, []);

  const addTranscript = (entry: TranscriptEntry) => {
    setTranscript((prev) => [...prev, entry]);
  };

  const playAudioBlob = async (blob: Blob) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await handleRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRecordedBlob = async (blob: Blob) => {
    setIsBusy(true);
    try {
      const text = await transcribeAudio(blob);
      if (text.trim()) {
        addTranscript({ speaker: "user", text });
        const reply = await sendChat(text, transcript);
        addTranscript({ speaker: "bot", text: reply });
        const audioBlob = await synthesizeVoice(reply);
        await playAudioBlob(audioBlob);
      }
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong processing your voice.");
    } finally {
      setIsBusy(false);
    }
  };

  const sendTextMessage = async (message: string) => {
    setError(null);
    setIsBusy(true);
    try {
      addTranscript({ speaker: "user", text: message });
      const reply = await sendChat(message, transcript);
      addTranscript({ speaker: "bot", text: reply });
      const audioBlob = await synthesizeVoice(reply);
      await playAudioBlob(audioBlob);
    } catch (err: any) {
      console.error(err);
      setError("Failed to send chat message.");
    } finally {
      setIsBusy(false);
    }
  };

  return {
    transcript,
    isRecording,
    isBusy,
    error,
    startRecording,
    stopRecording,
    sendTextMessage
  };
};
