import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Mock Data for specific languages
const MOCK_DATA = {
    en: [
        "Welcome to our service today.",
        "We are gathered here to find peace.",
        "Let us open our hearts to the message.",
        "Understanding transcends language.",
        "Peace be with you all.",
        "The Lord is my shepherd; I shall not want.",
        "He makes me lie down in green pastures.",
        "He leads me beside still waters.",
        "He restores my soul.",
        "Even though I walk through the darkest valley,",
        "I will fear no evil, for you are with me.",
        "Let faith be the bridge that connects us.",
        "Love is patient, love is kind.",
        "May grace abound in your lives.",
    ],
    zh: [
        "欢迎来到我们今天的聚会。",
        "我们聚集在这里寻找平安。",
        "让我们敞开心扉接受这信息。",
        "理解超越了语言的界限。",
        "愿平安与你们同在。",
        "耶和华是我的牧者，我必不致缺乏。",
        "他使我躺卧在青草地上。",
        "领我在可安歇的水边。",
        "他使我的灵魂苏醒。",
        "我虽然行过死荫的幽谷，",
        "也不怕遭害，因为你与我同在。",
        "让信心成为连接我们的桥梁。",
        "爱是恒久忍耐，又有恩慈。",
        "愿恩典在你们的生命中加增。",
    ],
    uk: [
        "Ласкаво просимо на наше служіння сьогодні.",
        "Ми зібралися тут, щоб знайти мир.",
        "Відкриймо наші серця для цього послання.",
        "Розуміння виходить за межі мови.",
        "Мир вам усім.",
        "Господь — мій Пастир; я нічого не буду потребувати.",
        "Він дає мені лежати на зелених луках.",
        "Він веде мене до тихої води.",
        "Він підкріпляє мою душу.",
        "Навіть якщо я піду долиною смертної тіні,",
        "Я не побоюсь зла, бо Ти зі мною.",
        "Нехай віра буде мостом, що з'єднує нас.",
        "Любов довготерпить, любов милосердствує.",
        "Нехай благодать збагачує ваші життя.",
    ],
};

interface StreamViewProps {
    language: "zh" | "uk";
}

export function StreamView({ language }: StreamViewProps) {
    const [transcript, setTranscript] = useState<string>("");
    const [translation, setTranslation] = useState<string>("");
    const [index, setIndex] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Auto-scroll ref
    const bottomRef = useRef<HTMLDivElement>(null);

    // Mock Connection & Streaming
    useEffect(() => {
        const connectTimer = setTimeout(() => setIsConnected(true), 1500);

        const streamInterval = setInterval(() => {
            if (!isConnected) return;

            setIndex((prev) => {
                const next = (prev + 1) % MOCK_DATA.en.length;
                setTranscript(MOCK_DATA.en[next]);
                // Simulate slight translation delay
                setTimeout(() => {
                    setTranslation(MOCK_DATA[language][next]);
                }, 600);
                return next;
            });
        }, 4000); // New sentence every 4s

        return () => {
            clearTimeout(connectTimer);
            clearInterval(streamInterval);
        };
    }, [isConnected, language]);

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
                        <span>Language</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                        <span className="hidden text-xs font-medium uppercase tracking-widest text-red-500 sm:inline-block">
                            Live
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
                {!isConnected ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Connecting to GodLang stream...</p>
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
