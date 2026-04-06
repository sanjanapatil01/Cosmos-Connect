import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, CosmosUser } from "@/lib/cosmos";
import {
  Send, X, Smile, Paperclip, Bold, Italic, Code, Link2, ImagePlus, AtSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatPanelProps {
  nearbyUsers: CosmosUser[];
  messages: ChatMessage[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  myUserId: string;
  onClose: () => void;
}

const EMOJI_LIST = ["👍", "👋", "😂", "❤️", "🔥", "🎉", "👀", "✅", "💯", "🙌", "😊", "🤔"];

export function ChatPanel({ nearbyUsers, messages, onSendMessage, myUserId, onClose }: ChatPanelProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setShowEmoji(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(data.path);
      onSendMessage(`📎 Shared an image`, urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getNearbyUser = (id: string) => nearbyUsers.find((u) => u.id === id);

  return (
    <div className="absolute right-0 top-12 bottom-14 w-[360px] flex flex-col bg-card border-l border-border shadow-panel z-20 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Chat</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Connection info */}
      {nearbyUsers.length > 0 && (
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 flex-wrap">
            {nearbyUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `#${u.color.toString(16).padStart(6, "0")}` }}
                />
                <span className="text-xs font-medium text-foreground">{u.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {visibleMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <AtSign className="w-6 h-6 text-primary/50" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              This is the beginning of your chat history
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
              Send messages, attachments, links, emojis, and more.
            </p>
          </div>
        )}
        {visibleMessages.map((msg) => {
          const isMine = msg.senderId === myUserId;
          const sender = getNearbyUser(msg.senderId);
          const senderColor = sender
            ? `#${sender.color.toString(16).padStart(6, "0")}`
            : "#0ea5e9";

          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                style={{ backgroundColor: senderColor }}
              >
                {msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%]`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{isMine ? "You" : msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                </div>
                <div
                  className={`rounded-xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Shared"
                    className="mt-1.5 rounded-lg max-w-full max-h-48 object-cover border border-border"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText((prev) => prev + emoji);
                  setShowEmoji(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border">
        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border">
          <ToolbarBtn icon={Smile} active={showEmoji} onClick={() => setShowEmoji(!showEmoji)} />
          <ToolbarBtn icon={Paperclip} onClick={() => fileInputRef.current?.click()} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn icon={Bold} />
          <ToolbarBtn icon={Italic} />
          <ToolbarBtn icon={Link2} />
          <ToolbarBtn icon={Code} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-2.5">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message the group..."
            className="flex-1 h-9 bg-muted/30 border-0 text-sm placeholder:text-muted-foreground focus-visible:ring-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim() && !uploading} className="h-9 w-9 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

function ToolbarBtn({ icon: Icon, active, onClick }: { icon: any; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
