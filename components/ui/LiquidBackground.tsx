"use client"

import { motion } from "framer-motion"

export function LiquidBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#e0f7fa] dark:bg-[#020617] transition-colors duration-700">
            {/* Aurora / Mesh Gradients */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-cyan-400/30 dark:bg-indigo-600/20 rounded-full blur-[120px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-lime-400/30 dark:bg-purple-600/20 rounded-full blur-[100px]"
                animate={{
                    x: [0, -50, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-blue-400/20 dark:bg-cyan-900/20 rounded-full blur-[80px]"
                animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -50, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Optional: Glossy Overlay Grid/Texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-black/40 dark:to-transparent pointer-events-none transition-colors duration-700" />
        </div>
    )
}
