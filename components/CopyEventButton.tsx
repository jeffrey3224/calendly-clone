"use client"

import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyEventButtonProps 
  extends Omit<React.ComponentProps<"button">, "children" | "onClick">,

  VariantProps<typeof buttonVariants>{
    eventId: string
    clerkUserId: string
  }


  type CopyState = "idle" | "copied" | "error"

  function getCopyLabel(state: CopyState) {
    switch (state) {
      case "copied":
        return "Copied!"
      case "error":
        return "Error"
      case "idle":
      default: 
        return "Copy Link"
    }
  }

export function CopyEventButton({
  eventId,
  clerkUserId,
  className,
  variant,
  size,
  ...props 
}: CopyEventButtonProps) {

  const [ copyState, setCopyState] = useState<CopyState>("idle")

  const handleCopy = () => {
    const url = `${location.origin}/book/${clerkUserId}/${eventId}`

    navigator.clipboard
    .writeText(url) 
    .then(() => {
      setCopyState("copied") 
      toast("Link copied successfully.", {
        duration: 3000
      })
      setTimeout(() => setCopyState("idle"), 2000)
    })
    .catch(() => {
      setCopyState("error") 
      setTimeout(() => setCopyState("idle"), 2000)
    })
}

  return (
    <Button
      onClick={handleCopy}
      className={cn(buttonVariants({ variant, size }), 'cursor-pointer', className)}
      variant={variant}
      size={size}
      {...props}>
        <CopyIcon className="size-4 mr-2" />
        {getCopyLabel(copyState)}
      </Button>
  )
}