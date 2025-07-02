"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "h-5 w-9 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        >
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow-lg transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }