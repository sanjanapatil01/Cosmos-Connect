import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, CosmosUser } from "@/lib/cosmos";
import { Send, MessageCircle, Users } from "lucide-react";

interface ChatPanelProps {
  nearbyUsers: CosmosUser[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myUserId: string;
}

export function ChatPanel({ nearbyUsers, messages, onSendMessage, myUserId }: ChatPanelProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const nearbyIds = new Set([myUserId, ...nearbyUsers.map((u) => u.id)]);
  const visibleMessages = messages.filter((m) => nearbyIds.has(m.senderId));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="absolute right-4 bottom-4 top-4 w-[340px] flex flex-col rounded-xl bg-card border border-border shadow-panel animate-slide-in overflow-hidden z-20">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-tight">Proximity Chat</h3>
          <p className="text-[11px] text-muted-foreground">{nearbyUsers.length} {nearbyUsers.length === 1 ? "person" : "people"} nearby</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-cosmos-nearby font-medium">
          <span className="w-2 h-2 rounded-full bg-cosmos-nearby animate-pulse" />
          Active
        </div>
      </div>

      {/* Nearby users */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-muted/30">
        <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="flex gap-1.5 overflow-x-auto">
          {nearbyUsers.map((u) => (
            <span
              key={u.id}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium bg-background border border-border text-foreground"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: `#${u.color.toString(16).padStart(6, "0")}` }}
              />
              {u.username}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        {visibleMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No messages yet</p>
            <p className="text-xs text-muted-foreground">Say hello to start a conversation</p>
          </div>
        )}
        {visibleMessages.map((msg) => {
          const isMine = msg.senderId === myUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {!isMine && <span className="text-[11px] font-medium text-foreground">{msg.senderName}</span>}
                <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className={`rounded-xl px-3.5 py-2 text-[13px] leading-relaxed max-w-[85%] ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/20">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-9 bg-background border-border text-foreground text-sm placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" disabled={!text.trim()} className="h-9 w-9 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
