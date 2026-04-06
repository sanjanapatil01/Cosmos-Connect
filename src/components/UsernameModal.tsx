import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowRight, Users, MessageCircle, Radio } from "lucide-react";

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full bg-primary/3" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Globe className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Virtual Cosmos
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm leading-relaxed">
          A collaborative virtual space for real-time communication and spatial interaction.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground text-sm rounded-xl px-4"
            maxLength={20}
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="h-12 gap-2 text-sm font-semibold rounded-xl"
          >
            Enter Space
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-sm">
          <FeatureCard icon={Users} title="Multiplayer" desc="Real-time sync" />
          <FeatureCard icon={MessageCircle} title="Proximity Chat" desc="Auto-connect" />
          <FeatureCard icon={Radio} title="Spatial Audio" desc="Distance-based" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
      <Icon className="w-5 h-5 text-primary" />
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
