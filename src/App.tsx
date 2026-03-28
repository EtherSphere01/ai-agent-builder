import { useState, useEffect, useMemo, useCallback } from "react";
import { toast, Toaster } from "sonner";

// Define the types based on data.json
interface AgentProfile {
    id: string;
    name: string;
    description: string;
}

interface Skill {
    id: string;
    name: string;
    category: string;
    description: string;
}

interface Layer {
    id: string;
    name: string;
    type: string;
    description: string;
}

interface AgentData {
    agentProfiles: AgentProfile[];
    skills: Skill[];
    layers: Layer[];
}

interface SavedAgent {
    id: string;
    name: string;
    profileId: string;
    skillIds: string[];
    layerIds: string[];
    provider?: string;
}

type DraftAgent = {
    profileId: string;
    skillIds: string[];
    layerIds: string[];
    provider: string;
};

const INITIAL_DRAFT_AGENT: DraftAgent = {
    profileId: "",
    skillIds: [],
    layerIds: [],
    provider: "",
};

const PROVIDERS = ["Gemini", "ChatGPT", "Kimi", "Claude", "DeepSeek"];

function SessionTimer() {
    const [sessionTime, setSessionTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatSessionTime = (totalSeconds: number) => {
        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const ss = String(seconds).padStart(2, "0");

        if (hours < 1) {
            return `${minutes}m ${ss}s`;
        }

        const mm = String(minutes).padStart(2, "0");
        return `${hours}h ${mm}m ${ss}s`;
    };

    return (
        <span className="text-sm text-slate-600">
            Session Active: {formatSessionTime(sessionTime)}
        </span>
    );
}

function App() {
    const [data, setData] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [draftAgent, setDraftAgent] =
        useState<DraftAgent>(INITIAL_DRAFT_AGENT);

    // Saving states
    const [agentName, setAgentName] = useState("");
    const [pendingDeleteAgent, setPendingDeleteAgent] =
        useState<SavedAgent | null>(null);
    const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => {
        const saved = localStorage.getItem("savedAgents");
        if (!saved) return [];

        try {
            return JSON.parse(saved) as SavedAgent[];
        } catch (e) {
            console.error("Failed to parse saved agents", e);
            return [];
        }
    });

    const handleDeleteAgent = useCallback((id: string) => {
        setSavedAgents((prev) => prev.filter((agent) => agent.id !== id));
        toast.success("Saved agent deleted");
    }, []);

    const handleRequestDeleteAgent = useCallback((agent: SavedAgent) => {
        setPendingDeleteAgent(agent);
    }, []);

    const handleCancelDeleteAgent = useCallback(() => {
        setPendingDeleteAgent(null);
    }, []);

    const handleConfirmDeleteAgent = useCallback(() => {
        if (!pendingDeleteAgent) return;
        handleDeleteAgent(pendingDeleteAgent.id);
        setPendingDeleteAgent(null);
    }, [handleDeleteAgent, pendingDeleteAgent]);

    useEffect(() => {
        localStorage.setItem("savedAgents", JSON.stringify(savedAgents));
    }, [savedAgents]);

    const fetchAPI = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/data.json", { signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData: AgentData = await response.json();
            if (signal?.aborted) return;
            setData(jsonData);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                return;
            }
            console.error("Error fetching data:", err);
            const message =
                err instanceof Error ? err.message : "Failed to fetch data";
            setError(message);
            toast.error(message);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    // Fetch data on initial component mount
    useEffect(() => {
        const controller = new AbortController();
        void fetchAPI(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchAPI]);

    const handleLayerSelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const layerId = e.target.value;
            if (!layerId) return;

            setDraftAgent((prev) => ({
                ...prev,
                layerIds: prev.layerIds.includes(layerId)
                    ? prev.layerIds
                    : [...prev.layerIds, layerId],
            }));
            e.target.value = "";
        },
        [],
    );

    const handleSkillSelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const skillId = e.target.value;
            if (!skillId) return;

            setDraftAgent((prev) => ({
                ...prev,
                skillIds: prev.skillIds.includes(skillId)
                    ? prev.skillIds
                    : [...prev.skillIds, skillId],
            }));
            e.target.value = "";
        },
        [],
    );

    const handleSaveAgent = useCallback(() => {
        if (!agentName.trim()) {
            toast.error("Please enter a name for your agent");
            return;
        }

        const newAgent: SavedAgent = {
            id: crypto.randomUUID(),
            name: agentName,
            profileId: draftAgent.profileId,
            skillIds: draftAgent.skillIds,
            layerIds: draftAgent.layerIds,
            provider: draftAgent.provider,
        };

        setSavedAgents((prev) => [...prev, newAgent]);
        setAgentName("");
        toast.success(`Agent "${newAgent.name}" saved successfully`);
    }, [agentName, draftAgent]);

    const handleLoadAgent = useCallback((agent: SavedAgent) => {
        setDraftAgent({
            profileId: agent.profileId || "",
            skillIds: [...(agent.skillIds || [])],
            layerIds: [...(agent.layerIds || [])],
            provider: agent.provider || "",
        });
        setAgentName(agent.name);
        toast.success(`Loaded "${agent.name}"`);
    }, []);

    const handleResetBuilder = useCallback(() => {
        setDraftAgent(INITIAL_DRAFT_AGENT);
        setAgentName("");
        toast.message("Builder reset");
    }, []);

    const handleClearAllSavedAgents = useCallback(() => {
        if (savedAgents.length === 0) {
            toast.message("No saved agents to clear");
            return;
        }

        setSavedAgents([]);
        toast.success("Cleared all saved agents");
    }, [savedAgents.length]);

    const handleRemoveSkill = useCallback((skillId: string) => {
        setDraftAgent((prev) => ({
            ...prev,
            skillIds: prev.skillIds.filter((id) => id !== skillId),
        }));
    }, []);

    const handleRemoveLayer = useCallback((layerId: string) => {
        setDraftAgent((prev) => ({
            ...prev,
            layerIds: prev.layerIds.filter((id) => id !== layerId),
        }));
    }, []);

    const profileMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(data.agentProfiles.map((prof) => [prof.id, prof]));
    }, [data]);

    const skillMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(data.skills.map((skill) => [skill.id, skill]));
    }, [data]);

    const layerMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(data.layers.map((layer) => [layer.id, layer]));
    }, [data]);

    const selectedProfile = profileMap.get(draftAgent.profileId);

    return (
        <div className="min-h-screen bg-[linear-gradient(120deg,#f8fafc_0%,#e2e8f0_45%,#f1f5f9_100%)] px-4 py-6 text-slate-900">
            <Toaster richColors position="top-right" />
            <header className="mx-auto mb-8 flex w-full max-w-7xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        AI Agent Builder
                    </h1>
                    <p className="mt-1 text-slate-600">
                        Design your custom AI personality and capability set.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => void fetchAPI()}
                        disabled={loading}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {loading
                            ? "Refreshing..."
                            : "Reload Configuration Data"}
                    </button>
                    <button
                        onClick={handleResetBuilder}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Reset Builder
                    </button>
                    <SessionTimer />
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left pane: Selections */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Configuration Options
                        </h2>
                        {error && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                Error: {error}
                            </div>
                        )}

                        {loading && (
                            <div className="mt-4 rounded-xl border border-dashed border-sky-400 bg-sky-50 p-4 text-sm text-sky-800">
                                Fetching configuration...
                            </div>
                        )}

                        {!data && !loading && !error && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                                No configuration loaded yet. Click "Reload
                                Configuration Data" to fetch your agent building
                                blocks.
                            </div>
                        )}

                        {data && (
                            <div className="mt-5 space-y-5">
                                <div>
                                    <label
                                        htmlFor="profile-select"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Base Profile:
                                    </label>
                                    <select
                                        id="profile-select"
                                        value={draftAgent.profileId}
                                        onChange={(e) => {
                                            setDraftAgent((prev) => ({
                                                ...prev,
                                                profileId: e.target.value,
                                            }));
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                                    >
                                        <option value="">
                                            -- Select a Profile --
                                        </option>
                                        {data.agentProfiles.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="skill-select"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Add Skill:
                                    </label>
                                    <select
                                        id="skill-select"
                                        onChange={handleSkillSelect}
                                        defaultValue=""
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                                    >
                                        <option value="" disabled>
                                            -- Select a Skill to Add --
                                        </option>
                                        {data.skills.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="layer-select"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Add Personality Layer:
                                    </label>
                                    <select
                                        id="layer-select"
                                        onChange={handleLayerSelect}
                                        defaultValue=""
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                                    >
                                        <option value="" disabled>
                                            -- Select a Layer to Add --
                                        </option>
                                        {data.layers.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name} ({l.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="provider-select"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        AI Provider:
                                    </label>
                                    <select
                                        id="provider-select"
                                        value={draftAgent.provider}
                                        onChange={(e) =>
                                            setDraftAgent((prev) => ({
                                                ...prev,
                                                provider: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                                    >
                                        <option value="">
                                            -- Select an AI Provider --
                                        </option>
                                        {PROVIDERS.map((provider) => (
                                            <option
                                                key={provider}
                                                value={provider}
                                            >
                                                {provider}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Right pane: Selected configuration preview */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Current Agent Configuration
                        </h2>

                        <div className="mt-5 space-y-5 rounded-xl bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Profile
                            </h3>
                            {draftAgent.profileId && data ? (
                                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                                    <span className="mr-2 inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                        {selectedProfile?.name}
                                    </span>
                                    {selectedProfile?.description ??
                                        "Profile details unavailable"}
                                </p>
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                                    No profile selected.
                                </p>
                            )}

                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Selected Skills
                            </h3>

                            {draftAgent.skillIds.length > 0 && data ? (
                                <ul className="pl-6 space-y-2">
                                    {draftAgent.skillIds.map((skillId) => {
                                        const skill = skillMap.get(skillId);

                                        if (!skill) return null;

                                        return (
                                            <li
                                                key={skillId}
                                                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
                                            >
                                                <span className="font-medium text-slate-800">
                                                    {skill.name}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleRemoveSkill(
                                                            skillId,
                                                        )
                                                    }
                                                    className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                                    No skills added.
                                </p>
                            )}

                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Selected Layers
                            </h3>

                            {draftAgent.layerIds.length > 0 && data ? (
                                <ul className="pl-6 space-y-2">
                                    {draftAgent.layerIds.map((layerId) => {
                                        const layer = layerMap.get(layerId);

                                        if (!layer) return null; // safety guard

                                        return (
                                            <li
                                                key={layerId}
                                                className="flex items-center justify-between rounded-md border border-violet-200 bg-violet-50 px-3 py-2"
                                            >
                                                <span className="font-medium text-violet-900">
                                                    {layer.name}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleRemoveLayer(
                                                            layerId,
                                                        )
                                                    }
                                                    className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                                    No layers added.
                                </p>
                            )}

                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Selected Provider
                            </h3>
                            {draftAgent.provider ? (
                                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                    <strong className="inline-flex rounded-md bg-sky-100 px-2 py-0.5 text-sky-700">
                                        {draftAgent.provider}
                                    </strong>
                                </p>
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                                    No provider selected.
                                </p>
                            )}

                            <div className="mt-6 border-t border-slate-200 pt-4">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                                    Save This Agent
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter agent name..."
                                        value={agentName}
                                        onChange={(e) =>
                                            setAgentName(e.target.value)
                                        }
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                                    />
                                    <button
                                        onClick={handleSaveAgent}
                                        disabled={!agentName.trim()}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                                    >
                                        Save Agent
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Bottom Panel: Saved Agents */}
                {savedAgents.length > 0 ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold">Saved Agents</h2>
                            <button
                                onClick={handleClearAllSavedAgents}
                                className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {savedAgents.map((agent) => (
                                <article
                                    key={agent.id}
                                    className="group rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                                >
                                    <h3 className="mb-2 text-lg font-bold text-cyan-900">
                                        {agent.name}
                                    </h3>
                                    <p className="my-1 text-sm text-slate-700">
                                        <strong>Profile:</strong>{" "}
                                        {profileMap.get(agent.profileId)
                                            ?.name || "None Selected"}
                                    </p>
                                    <p className="my-1 text-sm text-slate-700">
                                        <strong>Skills:</strong>{" "}
                                        {agent.skillIds?.length || 0} included
                                    </p>
                                    <p className="my-1 text-sm text-slate-700">
                                        <strong>Layers:</strong>{" "}
                                        {agent.layerIds?.length || 0} included
                                    </p>
                                    <p className="my-1 text-sm text-slate-700">
                                        <strong>Provider:</strong>{" "}
                                        {agent.provider || "None"}
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleLoadAgent(agent)
                                            }
                                            className="flex-1 rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRequestDeleteAgent(agent)
                                            }
                                            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800">
                            No Saved Agents Yet
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Build an agent configuration and save it. Your saved
                            agents will appear here as reusable cards.
                        </p>
                    </section>
                )}
            </main>

            {pendingDeleteAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">
                            Confirm Deletion
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Delete saved agent "{pendingDeleteAgent.name}"? This
                            action cannot be undone.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={handleCancelDeleteAgent}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeleteAgent}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
