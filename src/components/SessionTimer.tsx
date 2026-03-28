import { useEffect, useState } from "react";
import { formatSessionTime } from "../utils/formatSessionTime";

export function SessionTimer() {
    const [sessionTime, setSessionTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span className="text-sm text-slate-600">
            Session Active: {formatSessionTime(sessionTime)}
        </span>
    );
}
