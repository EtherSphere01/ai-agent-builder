import { useState, useEffect, useMemo, useCallback } from "react";

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
        <span style={{ fontSize: "0.9rem", color: "#666" }}>
            Session Active: {formatSessionTime(sessionTime)}
        </span>
    );
}

function App() {
    const [data, setData] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [draftAgent, setDraftAgent] = useState<DraftAgent>({
        profileId: "",
        skillIds: [],
        layerIds: [],
        provider: "",
    });

    // Saving states
    const [agentName, setAgentName] = useState("");
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

    const handleDeleteAgent = (indexToRemove: number) => {
        const updatedAgents = savedAgents.filter(
            (_, index) => index !== indexToRemove,
        );
        setSavedAgents(updatedAgents);
    };

    useEffect(() => {
        localStorage.setItem("savedAgents", JSON.stringify(savedAgents));
    }, [savedAgents]);

    const fetchAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate network delay and randomness (1 to 3 seconds)
            const delay = Math.floor(Math.random() * 2000) + 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));

            const response = await fetch("/data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData: AgentData = await response.json();
            setData(jsonData);
        } catch (err: unknown) {
            console.error("Error fetching data:", err);
            const message =
                err instanceof Error ? err.message : "Failed to fetch data";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on initial component mount
    useEffect(() => {
        fetchAPI();
    }, []);

    const handleLayerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const layerId = e.target.value;

        // ensure immutable & safe updates and prevent duplicates
        setDraftAgent((prev) => ({
            ...prev,
            layerIds: prev.layerIds.includes(layerId)
                ? prev.layerIds
                : [...prev.layerIds, layerId],
        }));
        e.target.value = ""; // Reset dropdown
    };

    const handleSkillSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const skillId = e.target.value;

        // ensure immutable & safe updates and prevent duplicates
        setDraftAgent((prev) => ({
            ...prev,
            skillIds: prev.skillIds.includes(skillId)
                ? prev.skillIds
                : [...prev.skillIds, skillId],
        }));
        e.target.value = ""; // Reset dropdown
    };

    const handleSaveAgent = () => {
        if (!agentName.trim()) {
            alert("Please enter a name for your agent.");
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

        const updatedAgents = [...savedAgents, newAgent];
        setSavedAgents(updatedAgents);
        setAgentName("");
        alert(`Agent "${newAgent.name}" saved successfully!`);
    };

    const handleLoadAgent = (agent: SavedAgent) => {
        setDraftAgent({
            profileId: agent.profileId || "",
            skillIds: [...(agent.skillIds || [])],
            layerIds: [...(agent.layerIds || [])],
            provider: agent.provider || "",
        });
        setAgentName(agent.name);
    };

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

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                padding: "1rem",
                fontFamily: "sans-serif",
            }}
        >
            <header style={{ marginBottom: "2rem" }}>
                <h1>AI Agent Builder</h1>
                <p>Design your custom AI personality and capability set.</p>
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                    }}
                >
                    <button onClick={fetchAPI} disabled={loading}>
                        {loading
                            ? "Fetching Configuration..."
                            : "Reload Configuration Data"}
                    </button>
                    <SessionTimer />
                </div>
            </header>

            <main
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    flex: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "2rem",
                        flexDirection: "row",
                    }}
                >
                    {/* Left pane: Selections */}
                    <section
                        style={{
                            flex: "1 1 50%",
                            borderRight: "1px solid #ccc",
                            paddingRight: "1rem",
                        }}
                    >
                        <h2>Configuration Options</h2>
                        {error && (
                            <div style={{ color: "red", marginBottom: "1rem" }}>
                                Error: {error}
                            </div>
                        )}

                        {/* Show loading state explicitly */}
                        {loading && (
                            <div
                                style={{
                                    padding: "2rem",
                                    background: "#f0f8ff",
                                    border: "1px dashed #0066cc",
                                    marginBottom: "1rem",
                                }}
                            >
                                Fetching simulated API... (this takes 1-3
                                seconds to test loading states)
                            </div>
                        )}

                        {!data && !loading && !error && <p>No data loaded.</p>}

                        {data && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.5rem",
                                }}
                            >
                                <div>
                                    <label
                                        htmlFor="profile-select"
                                        style={{
                                            display: "block",
                                            fontWeight: "bold",
                                            marginBottom: "0.5rem",
                                        }}
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
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                        }}
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
                                        style={{
                                            display: "block",
                                            fontWeight: "bold",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Add Skill:
                                    </label>
                                    <select
                                        id="skill-select"
                                        onChange={handleSkillSelect}
                                        defaultValue=""
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                        }}
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
                                        style={{
                                            display: "block",
                                            fontWeight: "bold",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Add Personality Layer:
                                    </label>
                                    <select
                                        id="layer-select"
                                        onChange={handleLayerSelect}
                                        defaultValue=""
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                        }}
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
                                        style={{
                                            display: "block",
                                            fontWeight: "bold",
                                            marginBottom: "0.5rem",
                                        }}
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
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                        }}
                                    >
                                        <option value="">
                                            -- Select an AI Provider --
                                        </option>
                                        {[
                                            "Gemini",
                                            "ChatGPT",
                                            "Kimi",
                                            "Claude",
                                            "DeepSeek",
                                        ].map((provider) => (
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
                    <section style={{ flex: "1 1 50%", paddingLeft: "1rem" }}>
                        <h2>Current Agent Configuration</h2>

                        <div
                            style={{
                                background: "#f5f5f5",
                                padding: "1rem",
                                borderRadius: "8px",
                                minHeight: "300px",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>Profile</h3>
                            {draftAgent.profileId && data ? (
                                <p>
                                    <strong>
                                        {
                                            profileMap.get(draftAgent.profileId)
                                                ?.name
                                        }
                                    </strong>
                                    :{" "}
                                    {profileMap.get(draftAgent.profileId)
                                        ?.description ??
                                        "Profile details unavailable"}
                                </p>
                            ) : (
                                <p style={{ color: "#888" }}>
                                    No profile selected.
                                </p>
                            )}

                            <h3>Selected Skills</h3>

                            {draftAgent.skillIds.length > 0 && data ? (
                                <ul className="pl-6 space-y-2">
                                    {draftAgent.skillIds.map((skillId) => {
                                        const skill = skillMap.get(skillId);

                                        if (!skill) return null;

                                        return (
                                            <li
                                                key={skillId}
                                                className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                                            >
                                                <span className="font-medium">
                                                    {skill.name}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleRemoveSkill(
                                                            skillId,
                                                        )
                                                    }
                                                    className="text-sm text-red-500 hover:text-red-700 transition"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-400">
                                    No skills added.
                                </p>
                            )}

                            <h3>Selected Layers</h3>

                            {draftAgent.layerIds.length > 0 && data ? (
                                <ul className="pl-6 space-y-2">
                                    {draftAgent.layerIds.map((layerId) => {
                                        const layer = layerMap.get(layerId);

                                        if (!layer) return null; // safety guard

                                        return (
                                            <li
                                                key={layerId}
                                                className="flex items-center justify-between bg-purple-50 border border-purple-200 px-3 py-2 rounded-md"
                                            >
                                                <span className="font-medium">
                                                    {layer.name}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleRemoveLayer(
                                                            layerId,
                                                        )
                                                    }
                                                    className="text-sm text-red-500 hover:text-red-700 transition"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-400">
                                    No layers added.
                                </p>
                            )}

                            <h3>Selected Provider</h3>
                            {draftAgent.provider ? (
                                <p>
                                    <strong>{draftAgent.provider}</strong>
                                </p>
                            ) : (
                                <p style={{ color: "#888" }}>
                                    No provider selected.
                                </p>
                            )}

                            <div
                                style={{
                                    marginTop: "2rem",
                                    borderTop: "1px solid #ddd",
                                    paddingTop: "1rem",
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>
                                    Save This Agent
                                </h3>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Enter agent name..."
                                        value={agentName}
                                        onChange={(e) =>
                                            setAgentName(e.target.value)
                                        }
                                        style={{ flex: 1, padding: "0.5rem" }}
                                    />
                                    <button
                                        onClick={handleSaveAgent}
                                        style={{ padding: "0.5rem 1rem" }}
                                    >
                                        Save Agent
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Bottom Panel: Saved Agents */}
                {savedAgents.length > 0 && (
                    <section
                        style={{
                            padding: "1.5rem",
                            background: "#e0f7fa",
                            borderRadius: "8px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "1rem",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>Saved Agents</h2>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Are you sure you want to clear all saved agents?",
                                        )
                                    ) {
                                        setSavedAgents([]);
                                        localStorage.removeItem("savedAgents");
                                    }
                                }}
                                style={{
                                    padding: "0.5rem 1rem",
                                    background: "#d32f2f",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "1.5rem",
                                flexWrap: "wrap",
                            }}
                        >
                            {savedAgents.map((agent, index) => (
                                <div
                                    key={agent.id}
                                    style={{
                                        padding: "1rem",
                                        background: "white",
                                        borderRadius: "8px",
                                        border: "1px solid #b2ebf2",
                                        minWidth: "220px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    <h3
                                        style={{
                                            marginTop: 0,
                                            color: "#006064",
                                        }}
                                    >
                                        {agent.name}
                                    </h3>
                                    <p
                                        style={{
                                            margin: "0.5rem 0",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <strong>Profile:</strong>{" "}
                                        {data?.agentProfiles.find(
                                            (p) => p.id === agent.profileId,
                                        )?.name || "None Selected"}
                                    </p>
                                    <p
                                        style={{
                                            margin: "0.5rem 0",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <strong>Skills:</strong>{" "}
                                        {agent.skillIds?.length || 0} included
                                    </p>
                                    <p
                                        style={{
                                            margin: "0.5rem 0",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <strong>Layers:</strong>{" "}
                                        {agent.layerIds?.length || 0} included
                                    </p>
                                    <p
                                        style={{
                                            margin: "0.5rem 0",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <strong>Provider:</strong>{" "}
                                        {agent.provider || "None"}
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            marginTop: "1rem",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                handleLoadAgent(agent)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "0.5rem",
                                                background: "#00838f",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteAgent(index)
                                            }
                                            style={{
                                                padding: "0.5rem",
                                                background: "#d32f2f",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
