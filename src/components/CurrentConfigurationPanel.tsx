import type { AgentProfile, DraftAgent, Layer, Skill } from "../types/agent";

type CurrentConfigurationPanelProps = {
    dataReady: boolean;
    draftAgent: DraftAgent;
    selectedProfile?: AgentProfile;
    skillMap: Map<string, Skill>;
    layerMap: Map<string, Layer>;
    agentName: string;
    onAgentNameChange: (name: string) => void;
    onSave: () => void;
    onRemoveSkill: (skillId: string) => void;
    onRemoveLayer: (layerId: string) => void;
};

export function CurrentConfigurationPanel({
    dataReady,
    draftAgent,
    selectedProfile,
    skillMap,
    layerMap,
    agentName,
    onAgentNameChange,
    onSave,
    onRemoveSkill,
    onRemoveLayer,
}: CurrentConfigurationPanelProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Current Agent Configuration</h2>

            <div className="mt-5 space-y-5 rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Profile
                </h3>
                {draftAgent.profileId && dataReady ? (
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
                {draftAgent.skillIds.length > 0 && dataReady ? (
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
                                        onClick={() => onRemoveSkill(skillId)}
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
                {draftAgent.layerIds.length > 0 && dataReady ? (
                    <ul className="pl-6 space-y-2">
                        {draftAgent.layerIds.map((layerId) => {
                            const layer = layerMap.get(layerId);
                            if (!layer) return null;

                            return (
                                <li
                                    key={layerId}
                                    className="flex items-center justify-between rounded-md border border-violet-200 bg-violet-50 px-3 py-2"
                                >
                                    <span className="font-medium text-violet-900">
                                        {layer.name}
                                    </span>
                                    <button
                                        onClick={() => onRemoveLayer(layerId)}
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
                            onChange={(e) => onAgentNameChange(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                        />
                        <button
                            onClick={onSave}
                            disabled={!agentName.trim()}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                            Save Agent
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
