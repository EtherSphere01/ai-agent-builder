export function formatSessionTime(totalSeconds: number): string {
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
}
