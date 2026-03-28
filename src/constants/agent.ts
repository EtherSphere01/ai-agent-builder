import type { DraftAgent } from "../types/agent";

export const INITIAL_DRAFT_AGENT: DraftAgent = {
    profileId: "",
    skillIds: [],
    layerIds: [],
    provider: "",
};

export const PROVIDERS = ["Gemini", "ChatGPT", "Kimi", "Claude", "DeepSeek"];
