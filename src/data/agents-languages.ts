// src/lib/ai/agents-languages.ts

export type AgentLanguageId = "en" | "es" | "fr" | "de" | "it" | "ja" | "nl";

export interface AgentLanguage {
  id: AgentLanguageId;
  name: string;
  nativeName: string;
  flag: string;
  // Agent Details
  agentName: string;
  agentImage: string; // Path in /public/agents/
  // Deepgram Voice Details
  voiceId: string;
  voiceName: string;
  voiceGender: "female";
}

export const AGENT_LANGUAGES: AgentLanguage[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    agentName: "Emma",
    agentImage: "/agents/emma.png",
    voiceId: "aura-2-thalia-en",
    voiceName: "Thalia",
    voiceGender: "female",
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    agentName: "Elena",
    agentImage: "/agents/elena.png",
    voiceId: "aura-2-celeste-es",
    voiceName: "Celeste",
    voiceGender: "female",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    agentName: "Marie",
    agentImage: "/agents/marie.png",
    voiceId: "aura-2-agathe-fr",
    voiceName: "Agathe",
    voiceGender: "female",
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    agentName: "Anna",
    agentImage: "/agents/anna.png",
    voiceId: "aura-2-viktoria-de",
    voiceName: "Viktoria",
    voiceGender: "female",
  },
  {
    id: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    agentName: "Giulia",
    agentImage: "/agents/giulia.png",
    voiceId: "aura-2-livia-it",
    voiceName: "Livia",
    voiceGender: "female",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    agentName: "Yuki",
    agentImage: "/agents/yuki.png",
    voiceId: "aura-2-izanami-ja",
    voiceName: "Izanami",
    voiceGender: "female",
  },
  {
    id: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    agentName: "Sanne",
    agentImage: "/agents/sanne.png",
    voiceId: "aura-2-beatrix-nl",
    voiceName: "Beatrix",
    voiceGender: "female",
  },
];

// Helper function to get agent by ID
export function getAgentLanguage(id: string): AgentLanguage | undefined {
  return AGENT_LANGUAGES.find((agent) => agent.id === id);
}