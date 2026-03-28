import type { ChangeEvent } from "react";
import { PROVIDERS } from "../constants/agent";
import type { AgentData, DraftAgent } from "../types/agent";

type ConfigurationOptionsPanelProps = {
    data: AgentData | null;
    loading: boolean;
    error: string | null;
    draftAgent: DraftAgent;
    onProfileChange: (profileId: string) => void;
    onSkillSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
    onLayerSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
    onProviderChange: (provider: string) => void;
};

export function ConfigurationOptionsPanel({
    data,
    loading,
    error,
    draftAgent,
    onProfileChange,
    onSkillSelect,
    onLayerSelect,
    onProviderChange,
}: ConfigurationOptionsPanelProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Configuration Options</h2>
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
                    No configuration loaded yet. Click "Reload Configuration
                    Data" to fetch your agent building blocks.
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
                            onChange={(e) => onProfileChange(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                        >
                            <option value="">-- Select a Profile --</option>
                            {data.agentProfiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name}
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
                            onChange={onSkillSelect}
                            defaultValue=""
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                        >
                            <option value="" disabled>
                                -- Select a Skill to Add --
                            </option>
                            {data.skills.map((skill) => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name} ({skill.category})
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
                            onChange={onLayerSelect}
                            defaultValue=""
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                        >
                            <option value="" disabled>
                                -- Select a Layer to Add --
                            </option>
                            {data.layers.map((layer) => (
                                <option key={layer.id} value={layer.id}>
                                    {layer.name} ({layer.type})
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
                            onChange={(e) => onProviderChange(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
                        >
                            <option value="">
                                -- Select an AI Provider --
                            </option>
                            {PROVIDERS.map((provider) => (
                                <option key={provider} value={provider}>
                                    {provider}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </section>
    );
}
