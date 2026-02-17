"use client"

import { motion } from "framer-motion"
import { LayoutTemplate, PlusCircle, Sparkles } from "lucide-react"

export function EmptyState() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none overflow-hidden">
            {/* Background Glow Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-lime-500/10 dark:bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Central Hub Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center max-w-lg w-full"
            >
                {/* Visual Icon Group */}
                <div className="relative mb-10 group">
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center relative z-20 overflow-hidden"
                    >
                        {/* Inner Shine - Even softer and slower */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000 ease-in-out pointer-events-none" />

                        <LayoutTemplate className="h-16 w-16 text-blue-900/40 dark:text-cyan-400/50" />

                        {/* Floating Accents */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-4 right-4"
                        >
                            <Sparkles className="h-6 w-6 text-lime-500/40 dark:text-lime-400/40" />
                        </motion.div>
                    </motion.div>

                    {/* Ring Decoration */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-[-20px] border-[1px] border-blue-500/20 dark:border-cyan-400/20 rounded-full z-0"
                    />
                </div>

                {/* Typography Section */}
                <div className="text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight"
                    >
                        <span className="text-slate-900 dark:text-white">Sin </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-lime-600 dark:from-cyan-400 dark:to-lime-400 italic pr-2">Escenas</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-sm mx-auto leading-relaxed"
                    >
                        Agregá tus streams favoritos.
                    </motion.p>
                </div>

                {/* Bottom Action Suggestion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-lime-500/20 backdrop-blur-sm border border-white/20 dark:border-white/5 flex items-center gap-3 px-6 py-3 shadow-inner"
                >
                    <PlusCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        USA EL BOTÓN &quot;ADD&quot; PARA COMENZAR
                    </span>
                </motion.div>
            </motion.div>

            {/* Decorative Floating Dots */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -40, 0],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                    }}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400/30"
                    style={{
                        top: `${20 + (i * 15)}%`,
                        left: `${10 + (i * 18)}%`
                    }}
                />
            ))}
        </div>
    )
}
