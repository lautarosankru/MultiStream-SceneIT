"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="glossy-btn w-9 h-9 rounded-full ring-2 ring-white/20 dark:ring-white/10 text-slate-700 dark:text-cyan-400 hover:scale-110 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            title="Cambiar Tema"
        >
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500 drop-shadow-[0_0_8px_rgba(255,165,0,0.6)]" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            </div>

            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-yellow-400/20 dark:from-indigo-600/40 dark:to-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
    )
}
