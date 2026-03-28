import type { SavedAgent } from "../types/agent";

const SAVED_AGENTS_KEY = "savedAgents";

export function loadSavedAgents(): SavedAgent[] {
    const raw = localStorage.getItem(SAVED_AGENTS_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed) ? (parsed as SavedAgent[]) : [];
    } catch {
        return [];
    }
}

export function saveSavedAgents(savedAgents: SavedAgent[]): void {
    localStorage.setItem(SAVED_AGENTS_KEY, JSON.stringify(savedAgents));
}
