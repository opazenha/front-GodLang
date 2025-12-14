import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiClient, type Translation, type BroadcastStatus } from "../services/api";

interface BroadcastViewProps {
    language: string;
}

export function BroadcastView({ language }: BroadcastViewProps) {
    const [transcript, setTranscript] = useState<string>("");
    const [translation, setTranslation] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Auto-scroll ref
    const bottomRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let mounted = true;

        const initBroadcast = async () => {
            try {
                // 1. Check broadcast status
                const status = await ApiClient.getBroadcastStatus(language);
                if (mounted) setBroadcastStatus(status);

                if (status.status === "idle") {
                    if (mounted) setError("No active broadcast for this language");
                    return;
                }

                if (!mounted) return;

                // 2. Connect to broadcast SSE
                const sseUrl = ApiClient.getBroadcastSSEEndpoint(language);
                const eventSource = new EventSource(sseUrl);
                eventSourceRef.current = eventSource;

                eventSource.onopen = () => {
                    console.log("Broadcast SSE Connected");
                };

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log("Broadcast SSE Event:", data);

                        if (data.type === 'connected') {
                            setIsConnected(true);
                            if (data.session_id && mounted) {
                                setSessionId(data.session_id);
                            }
                        } else if (data.type === 'translation') {
                            if (mounted) {
                                setTranscript(data.transcription?.transcript || "");
                                setTranslation(data.translation?.translation || "");
                            }
                        } else if (data.type === 'broadcast_ended') {
                            if (mounted) {
                                setError("Broadcast has ended");
                                setIsConnected(false);
                            }
                        } else if (data.type === 'error') {
                            console.error("Broadcast SSE Error Message:", data.message);
                            if (mounted) setError(data.message);
                        }
                    } catch (err) {
                        console.error("Error parsing broadcast SSE data:", err);
                    }
                };

                eventSource.onerror = (err) => {
                    console.error("Broadcast SSE Connection Error:", err);
                    setIsConnected(false);
                    // EventSource automatically retries, but we handle UI state here
                };

            } catch (err: any) {
                console.error("Failed to init broadcast:", err);
                if (mounted) setError(err.message || "Failed to connect to broadcast");
            }
        };

        if (language) {
            initBroadcast();
        }

        return () => {
            mounted = false;
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [language]);

    return (
        <div className="flex h-screen flex-col bg-background font-sans text-foreground">
            {/* Header: Transcript (Source) */}
            <header className="sticky top-0 z-50 border-b border-border/10 bg-background/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Leave Broadcast</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isConnected ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                        </span>
                        <span className={`hidden text-xs font-medium uppercase tracking-widest sm:inline-block ${isConnected ? 'text-red-500' : 'text-yellow-500'}`}>
                            {isConnected ? 'Live Broadcast' : 'Connecting'}
                        </span>
                    </div>
                </div>

                {/* English Transcript Ticker */}
                <div className="mx-auto mt-4 max-w-3xl overflow-hidden text-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={transcript}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="truncate text-sm font-medium italic text-muted-foreground sm:text-base"
                        >
                            {transcript || "Listening for audio..."}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </header>

            {/* Main Body: Translation */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {error ? (
                    <div className="flex flex-col items-center gap-4 text-destructive">
                        <p>{error}</p>
                        <Link to="/" className="underline">Go back</Link>
                    </div>
                ) : !isConnected && !translation ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Connecting to GodLang broadcast...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={translation}
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="max-w-4xl"
                        >
                            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
                                {translation || "..."}
                            </h1>
                        </motion.div>
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </main>

            {/* Footer Branding */}
            <footer className="py-6 text-center opacity-30">
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">GodLang Premium</p>
            </footer>
        </div>
    );
}