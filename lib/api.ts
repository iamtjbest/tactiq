// lib/api.ts — Tactica backend client (adapted from native app for web)
// Backend: https://tactica-backend-hdbd.onrender.com

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://tactica-backend-hdbd.onrender.com";

export interface FormResponse {
  team: string;
  matches: Array<{
    opponent: string;
    competition: string;
    scored: number;
    conceded: number;
    result: "W" | "D" | "L";
    formation: string;
    date?: string;
  }>;
  attack: number;
  defence: number;
  best_formation: string | null;
  cached: boolean;
}

export interface PredictResponse {
  best_formation: string;
  probability: number;
  my_attack: number;
  my_defence: number;
  opp_attack: number;
  opp_defence: number;
  all_formations: Array<{ formation: string; probability: number }>;
}

export interface ChatMessage { role: "user" | "assistant"; content: string }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => apiFetch<{ status: string }>("/api/health"),

  /** Get team form + best formation recommendation */
  form: (team: string) =>
    apiFetch<FormResponse>(`/api/form?team=${encodeURIComponent(team)}`),

  /** Get head-to-head win probability */
  predict: (myTeam: string, oppTeam: string) =>
    apiFetch<PredictResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify({ my_team: myTeam, opp_team: oppTeam }),
    }),

  /** AI tactical chat — powers free AI tip */
  chat: (myTeam: string, oppTeam: string, message: string, history: ChatMessage[]) =>
    apiFetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ my_team: myTeam, opp_team: oppTeam, message, history }),
    }),
};

// Formation display helpers
export const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2", "4-1-4-1", "4-5-1"] as const;
export type Formation = typeof FORMATIONS[number];

/** Normalise backend probability (may be 0–1 or 0–100) to 0–100 */
export function toPercent(raw: number): number {
  return raw <= 1 ? Math.round(raw * 100 * 10) / 10 : Math.round(raw * 10) / 10;
}
