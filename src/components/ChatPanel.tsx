import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, CosmosUser } from "@/lib/cosmos";
import { Send, MessageCircle } from "lucide-react";

interface ChatPanelProps {
  nearbyUsers: CosmosUser[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myUserId: string;
}

export function ChatPanel({ nearbyUsers, messages, onSendMessage, myUserId }: ChatPanelProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages to only show from nearby users and self
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

  return (
    <div className="absolute right-4 bottom-4 top-4 w-80 flex flex-col rounded-2xl border border-border bg-card/90 backdrop-blur-xl animate-slide-in overflow-hidden z-20">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageCircle className="w-4 h-4 text-cosmos-nearby" />
        <span className="text-sm font-medium text-foreground">
          Nearby Chat
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {nearbyUsers.length} nearby
        </span>
      </div>

      {/* Nearby users */}
      <div className="flex gap-1.5 px-4 py-2 border-b border-border overflow-x-auto">
        {nearbyUsers.map((u) => (
          <span
            key={u.id}
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
          >
            {u.username}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {visibleMessages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Say hello to nearby explorers!
          </p>
        )}
        {visibleMessages.map((msg) => {
          const isMine = msg.senderId === myUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && (
                <span className="text-[10px] text-muted-foreground mb-0.5">{msg.senderName}</span>
              )}
              <div
                className={`rounded-2xl px-3 py-1.5 text-sm max-w-[85%] ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 px-3 py-3 border-t border-border">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border-border text-foreground text-sm placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" disabled={!text.trim()} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
