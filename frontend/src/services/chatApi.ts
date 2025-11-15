import { TranscriptEntry } from "../components/TranscriptPanel";

interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatTurn[];
}

interface ChatResponse {
  reply: string;
}

export async function sendChat(
  message: string,
  transcript: TranscriptEntry[]
): Promise<string> {
  const history: ChatTurn[] = transcript.map((entry) => ({
    role: entry.speaker === "user" ? "user" : "assistant",
    content: entry.text
  }));

  const payload: ChatRequest = {
    message,
    history
  };

  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Chat request failed");
  }

  const data = (await resp.json()) as ChatResponse;
  return data.reply;
}
