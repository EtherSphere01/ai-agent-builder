import { SessionTimer } from "./SessionTimer";

type AppHeaderProps = {
    loading: boolean;
    onReload: () => void;
    onReset: () => void;
};

export function AppHeader({ loading, onReload, onReset }: AppHeaderProps) {
    return (
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
                    onClick={onReload}
                    disabled={loading}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {loading ? "Refreshing..." : "Reload Configuration Data"}
                </button>
                <button
                    onClick={onReset}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Reset Builder
                </button>
                <SessionTimer />
            </div>
        </header>
    );
}
