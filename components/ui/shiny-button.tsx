"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const shinyButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-b from-primary/80 to-primary/50 text-primary-foreground shadow-lg hover:brightness-110 hover:scale-[1.02] border border-white/20 active:scale-95",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground",
                glass:
                    "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-sm",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-full px-3 text-xs",
                lg: "h-10 rounded-full px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ShinyButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shinyButtonVariants> {
    asChild?: boolean
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot.Root : "button"
        return (
            <Comp
                className={cn(shinyButtonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {/* Shine effect overlay */}
                {(variant === 'default' || variant === 'glass') && (
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                )}
                {(variant === 'default' || variant === 'glass') && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                )}

                {props.children}
            </Comp>
        )
    }
)
ShinyButton.displayName = "ShinyButton"

export { ShinyButton, shinyButtonVariants }
