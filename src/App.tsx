import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
} from "react";
import { Toaster, toast } from "sonner";
import { INITIAL_DRAFT_AGENT } from "./constants/agent";
import { AppHeader } from "./components/AppHeader";
import { ConfigurationOptionsPanel } from "./components/ConfigurationOptionsPanel";
import { CurrentConfigurationPanel } from "./components/CurrentConfigurationPanel";
import { SavedAgentsSection } from "./components/SavedAgentsSection";
import { DeleteAgentModal } from "./components/DeleteAgentModal";
import type { AgentData, DraftAgent, SavedAgent } from "./types/agent";
import { loadSavedAgents, saveSavedAgents } from "./utils/savedAgentsStorage";

function App() {
    const [data, setData] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [draftAgent, setDraftAgent] =
        useState<DraftAgent>(INITIAL_DRAFT_AGENT);
    const [agentName, setAgentName] = useState("");
    const [pendingDeleteAgent, setPendingDeleteAgent] =
        useState<SavedAgent | null>(null);

    const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() =>
        loadSavedAgents(),
    );

    useEffect(() => {
        saveSavedAgents(savedAgents);
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
            if (!signal?.aborted) {
                setData(jsonData);
            }
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

    useEffect(() => {
        const controller = new AbortController();
        void fetchAPI(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchAPI]);

    const handleProfileChange = useCallback((profileId: string) => {
        setDraftAgent((prev) => ({ ...prev, profileId }));
    }, []);

    const handleProviderChange = useCallback((provider: string) => {
        setDraftAgent((prev) => ({ ...prev, provider }));
    }, []);

    const handleLayerSelect = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
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
        (e: ChangeEvent<HTMLSelectElement>) => {
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

    const handleClearAllSavedAgents = useCallback(() => {
        if (savedAgents.length === 0) {
            toast.message("No saved agents to clear");
            return;
        }

        setSavedAgents([]);
        toast.success("Cleared all saved agents");
    }, [savedAgents.length]);

    const handleResetBuilder = useCallback(() => {
        setDraftAgent(INITIAL_DRAFT_AGENT);
        setAgentName("");
        toast.message("Builder reset");
    }, []);

    const profileMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(
            data.agentProfiles.map((profile) => [profile.id, profile]),
        );
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

            <AppHeader
                loading={loading}
                onReload={() => void fetchAPI()}
                onReset={handleResetBuilder}
            />

            <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    <ConfigurationOptionsPanel
                        data={data}
                        loading={loading}
                        error={error}
                        draftAgent={draftAgent}
                        onProfileChange={handleProfileChange}
                        onSkillSelect={handleSkillSelect}
                        onLayerSelect={handleLayerSelect}
                        onProviderChange={handleProviderChange}
                    />

                    <CurrentConfigurationPanel
                        dataReady={Boolean(data)}
                        draftAgent={draftAgent}
                        selectedProfile={selectedProfile}
                        skillMap={skillMap}
                        layerMap={layerMap}
                        agentName={agentName}
                        onAgentNameChange={setAgentName}
                        onSave={handleSaveAgent}
                        onRemoveSkill={handleRemoveSkill}
                        onRemoveLayer={handleRemoveLayer}
                    />
                </div>

                <SavedAgentsSection
                    savedAgents={savedAgents}
                    profileMap={profileMap}
                    onLoadAgent={handleLoadAgent}
                    onRequestDeleteAgent={handleRequestDeleteAgent}
                    onClearAll={handleClearAllSavedAgents}
                />
            </main>

            <DeleteAgentModal
                pendingDeleteAgent={pendingDeleteAgent}
                onCancel={handleCancelDeleteAgent}
                onConfirm={handleConfirmDeleteAgent}
            />
        </div>
    );
}

export default App;
