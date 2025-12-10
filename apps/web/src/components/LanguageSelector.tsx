import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function LanguageSelector() {
    const languages = [
        {
            code: "zh",
            label: "Chinese",
            native: "中文",
            gradient: "from-blue-500/20 to-purple-500/20",
            border: "group-hover:border-blue-400/50",
        },
        {
            code: "uk",
            label: "Ukrainian",
            native: "Українська",
            gradient: "from-yellow-500/20 to-blue-500/20", // Ukraine flag colors hint
            border: "group-hover:border-yellow-400/50",
        },
    ];

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
                <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-6xl">
                    God<span className="font-semibold text-primary">Lang</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Select your preferred language
                </p>
            </motion.div>

            <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
                {languages.map((lang, index) => (
                    <Link
                        key={lang.code}
                        to="/stream"
                        search={{ lang: lang.code }}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
                    >
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="relative z-10 flex flex-col items-center gap-4"
                        >
                            <span className="text-5xl font-bold tracking-tighter text-foreground sm:text-7xl">
                                {lang.native}
                            </span>
                            <span className="text-xl uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                                {lang.label}
                            </span>

                            <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-black">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
