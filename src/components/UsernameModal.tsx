import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowRight } from "lucide-react";

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

export function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Subtle decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full bg-primary/3" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
          <Globe className="w-7 h-7 text-primary" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          Virtual Cosmos
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm leading-relaxed">
          A shared virtual space where you can explore, find others, and connect through proximity-based conversations.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 bg-background border-border text-foreground placeholder:text-muted-foreground text-sm"
            maxLength={20}
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="h-11 gap-2 text-sm font-medium"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cosmos-nearby" />
              Proximity chat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Real-time sync
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Multiplayer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
