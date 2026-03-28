import type { SavedAgent } from "../types/agent";

type DeleteAgentModalProps = {
    pendingDeleteAgent: SavedAgent | null;
    onCancel: () => void;
    onConfirm: () => void;
};

export function DeleteAgentModal({
    pendingDeleteAgent,
    onCancel,
    onConfirm,
}: DeleteAgentModalProps) {
    if (!pendingDeleteAgent) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900">
                    Confirm Deletion
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    Delete saved agent "{pendingDeleteAgent.name}"? This action
                    cannot be undone.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
