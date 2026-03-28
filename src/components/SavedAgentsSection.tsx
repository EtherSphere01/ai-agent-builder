import type { AgentProfile, SavedAgent } from "../types/agent";

type SavedAgentsSectionProps = {
    savedAgents: SavedAgent[];
    profileMap: Map<string, AgentProfile>;
    onLoadAgent: (agent: SavedAgent) => void;
    onRequestDeleteAgent: (agent: SavedAgent) => void;
    onClearAll: () => void;
};

export function SavedAgentsSection({
    savedAgents,
    profileMap,
    onLoadAgent,
    onRequestDeleteAgent,
    onClearAll,
}: SavedAgentsSectionProps) {
    if (savedAgents.length === 0) {
        return (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                    No Saved Agents Yet
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Build an agent configuration and save it. Your saved agents
                    will appear here as reusable cards.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Saved Agents</h2>
                <button
                    onClick={onClearAll}
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
                            {profileMap.get(agent.profileId)?.name ||
                                "None Selected"}
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
                                onClick={() => onLoadAgent(agent)}
                                className="flex-1 rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                            >
                                Load
                            </button>
                            <button
                                onClick={() => onRequestDeleteAgent(agent)}
                                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
