"use client"

import { motion } from "framer-motion"

export function LiquidBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-white dark:bg-black transition-colors duration-700">
            {/* Aurora / Mesh Gradients */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-cyan-400/10 dark:bg-indigo-900/10 rounded-full blur-[120px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-lime-400/10 dark:bg-purple-900/10 rounded-full blur-[100px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-blue-400/5 dark:bg-cyan-900/5 rounded-full blur-[80px]"
                animate={{
                    x: [0, 20, -20, 0],
                    y: [0, -30, 30, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="absolute inset-0 bg-white/50 dark:bg-black/80 pointer-events-none transition-colors duration-700" />
        </div>
    )
}
