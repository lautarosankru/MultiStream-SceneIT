"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { AddStream } from "@/components/grid/AddStream"
import { ShareButton } from "@/components/grid/ShareButton"
import { TotalViewers } from "@/components/ui/TotalViewers"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { LayoutModeToggle } from "@/components/grid/LayoutModeToggle"
import { LayoutTemplate, PanelRightOpen, PanelRightClose, Edit2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Header() {
    const { isLocked, toggleLock, isSidebarOpen, toggleSidebar } = useSceneStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/50 dark:border-white/5 bg-gradient-to-b from-white/70 to-white/40 dark:from-black/80 dark:to-black/60 backdrop-blur-md shrink-0 z-50 shadow-sm relative">
            {/* Left: Branding */}
            <div className="flex items-center gap-2 w-auto lg:w-40 group cursor-default shrink-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-white/50 shrink-0">
                    <LayoutTemplate className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-blue-900 dark:text-white tracking-tight drop-shadow-sm hidden sm:inline whitespace-nowrap">
                    Scene<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-lime-600 dark:from-cyan-400 dark:to-lime-400 italic">It</span>
                </span>
                <div className="hidden sm:block">
                    <TotalViewers />
                </div>
            </div>

            {/* Center: Controls (Desktop) */}
            <div className="hidden md:flex flex-1 items-center justify-center mx-2">
                <AddStream />
            </div>

            {/* Right: Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 w-auto lg:w-44 justify-end shrink-0">
                <ShinyButton
                    variant={!isLocked ? "default" : "glass"}
                    size="sm"
                    onClick={toggleLock}
                    className={cn(
                        "transition-all duration-300 min-w-[90px]",
                        !isLocked
                            ? "ring-2 ring-green-400 from-green-500 to-emerald-600 hover:brightness-110"
                            : "hover:bg-white/20"
                    )}
                >
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span>{!isLocked ? "Listo" : "Editar"}</span>
                </ShinyButton>

                <ShareButton />

                <LayoutModeToggle />

                <div className="w-px h-6 bg-slate-200 mx-1 dark:bg-slate-800" />

                <ThemeToggle />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className={cn(
                        "h-9 w-9 transition-all duration-300 hover:bg-white/40 rounded-full",
                        isSidebarOpen ? "text-cyan-600 shadow-[0_0_15px_rgba(0,255,255,0.4)] bg-white/50" : "text-slate-600 dark:text-slate-400"
                    )}
                    title="Chat Sidebar"
                >
                    {isSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2">
                    <AddStream />

                    <div className="flex items-center justify-between">
                        <TotalViewers />
                        <LayoutModeToggle />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <ShinyButton
                            variant={!isLocked ? "default" : "glass"}
                            size="sm"
                            onClick={() => {
                                toggleLock()
                                setIsMobileMenuOpen(false)
                            }}
                            className={cn(
                                "w-full justify-center transition-all duration-300",
                                !isLocked
                                    ? "ring-2 ring-green-400 from-green-500 to-emerald-600 hover:brightness-110"
                                    : "bg-white/10 dark:bg-white/5 hover:bg-white/20"
                            )}
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            <span>{!isLocked ? "Listo" : "Editar Layout"}</span>
                        </ShinyButton>
                        <div className="flex justify-center">
                            <ShareButton />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => {
                            toggleSidebar()
                            setIsMobileMenuOpen(false)
                        }}
                        className="w-full"
                    >
                        {isSidebarOpen ? "Cerrar Chat" : "Abrir Chat"}
                    </Button>
                </div>
            )}
        </header>
    )
}
