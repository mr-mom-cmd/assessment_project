import { apiFetch } from "./apiClient";

interface STTResponse {
  text: string;
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/voice/stt`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "STT request failed");
  }

  const data = (await resp.json()) as STTResponse;
  return data.text;
}

export async function synthesizeVoice(text: string): Promise<Blob> {
  const resp = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    }/api/voice/tts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    }
  );

  if (!resp.ok) {
    const textResp = await resp.text();
    throw new Error(textResp || "TTS request failed");
  }

  const blob = await resp.blob();
  return blob;
}
