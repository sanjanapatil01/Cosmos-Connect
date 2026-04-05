import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-foreground/40 animate-pulse-glow"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-border bg-card/80 p-10 backdrop-blur-xl glow-primary"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Virtual Cosmos
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs text-center">
          Enter the cosmos — move around, find others, and chat when you're close.
        </p>
        <Input
          autoFocus
          placeholder="Choose a username..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-64 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          maxLength={20}
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          className="w-64"
        >
          Enter Cosmos
        </Button>
      </form>
    </div>
  );
}
