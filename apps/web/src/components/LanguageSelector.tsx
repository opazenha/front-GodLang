import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiClient } from "../services/api";

export function LanguageSelector() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [joinId, setJoinId] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    const [serverStatus, setServerStatus] = useState<"ok" | "error" | "checking">("checking");

    useEffect(() => {
        ApiClient.getSystemHealth()
            .then(() => setServerStatus("ok"))
            .catch(() => setServerStatus("error"));
    }, []);

    const languages = [
        {
            code: "zh",
            label: "Chinese",
            native: "中文",
            gradient: "from-red-500/20 to-orange-500/20",
            border: "border-red-500/50",
        },
        // {
        //     code: "uk",
        //     label: "Ukrainian",
        //     native: "Українська",
        //     gradient: "from-blue-500/20 to-yellow-500/20",
        //     border: "border-blue-500/50",
        // },
    ];

    const handleCreateSession = async (langCode: string) => {
        try {
            setIsLoading(langCode);
            const session = await ApiClient.createSession(langCode);
            if (!session.id) throw new Error("No session ID returned");
            navigate({ to: "/stream/$sessionId", params: { sessionId: session.id } });
        } catch (error) {
            console.error("Failed to create session:", error);
            setIsLoading(null);
        }
    };

    const handleJoinBroadcast = async (langCode: string) => {
        try {
            setIsLoading(langCode);
            // Check if broadcast is active for this language
            const status = await ApiClient.getBroadcastStatus(langCode);
            if (status.status === "idle") {
                alert(`No active broadcast for ${langCode}. Please start a broadcast first.`);
                setIsLoading(null);
                return;
            }
            navigate({ to: "/broadcast/$language", params: { language: langCode } });
        } catch (error) {
            console.error("Failed to join broadcast:", error);
            alert(`Failed to join broadcast: ${error instanceof Error ? error.message : "Unknown error"}`);
            setIsLoading(null);
        }
    };

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedId = joinId.trim();
        if (!trimmedId) return;

        try {
            setIsJoining(true);
            // Verify session exists first
            await ApiClient.getSessionStatus(trimmedId);
            navigate({ to: "/stream/$sessionId", params: { sessionId: trimmedId } });
        } catch (error: any) {
            console.error("Failed to join session:", error);
            alert(`Failed to join: ${error.message || "Unknown error"}`);
            setIsJoining(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12 space-y-4"
            >
                <div className="mx-auto flex justify-center pb-6">
                    <img
                        src="/logo.png"
                        alt="Church Logo"
                        className="h-48 w-auto object-contain"
                    />
                </div>

                {/* Server Status Indicator */}
                <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${serverStatus === 'ok' ? 'bg-green-500' : serverStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span>Server: {serverStatus === 'ok' ? 'Online' : serverStatus === 'error' ? 'Offline' : 'Checking...'}</span>
                    </div>

                    {serverStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-xs text-red-400 max-w-md rounded-lg bg-red-950/20 p-3 border border-red-500/20"
                        >
                            <p className="font-semibold">Connection Failed</p>
                            <p>Please restart your development server to apply proxy settings:</p>
                            <code className="block mt-1 bg-black/30 p-1 rounded">Ctrl+C &rarr; bun run dev</code>
                        </motion.div>
                    )}
                </div>

                <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-6xl">
                    God<span className="font-semibold text-primary">Lang</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Start a new session or join an existing one
                </p>
            </motion.div>

            <div className="mb-12 grid w-full max-w-4xl gap-6 md:grid-cols-1">
                {languages.map((lang, index) => (
                    <div
                        key={lang.code}
                        className={`group relative overflow-hidden rounded-3xl border ${lang.border} bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10`}
                    >
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${lang.gradient}`}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="relative z-10 p-8"
                        >
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-5xl font-bold tracking-tighter text-foreground sm:text-7xl">
                                        {lang.native}
                                    </span>
                                    <span className="text-xl uppercase tracking-widest text-muted-foreground">
                                        {lang.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCreateSession(lang.code)}
                                    disabled={!!isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-black disabled:opacity-50"
                                >
                                    {isLoading === lang.code ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>New Session</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleJoinBroadcast(lang.code)}
                                    disabled={!!isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-black disabled:opacity-50"
                                >
                                    {isLoading === lang.code ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Join Broadcast</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md"
            >
                <form onSubmit={handleJoinSession} className="relative flex items-center">
                    <input
                        type="text"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        placeholder="Enter Session ID to Join..."
                        className="w-full rounded-full border border-border bg-background/50 py-3 pl-6 pr-12 text-foreground backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={isJoining || !joinId}
                        className="absolute right-2 rounded-full bg-primary p-2 text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
                    >
                        {isJoining ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowRight className="h-4 w-4" />
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
