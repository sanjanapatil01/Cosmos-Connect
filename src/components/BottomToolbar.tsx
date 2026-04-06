import { useState } from "react";
import {
  Share2, UserPlus, Circle, Move, Hand, ThumbsUp, Zap, MessageCircle, LayoutGrid, Home,
} from "lucide-react";

interface BottomToolbarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  username: string;
  userColor: number;
}

export function BottomToolbar({ onToggleChat, chatOpen, onToggleSidebar, sidebarOpen, username, userColor }: BottomToolbarProps) {
  const [activeTool, setActiveTool] = useState<string>("move");

  const tools = [
    { id: "share", icon: Share2, label: "Share" },
    { id: "invite", icon: UserPlus, label: "Invite" },
    { id: "record", icon: Circle, label: "Record", accent: true },
    { id: "move", icon: Move, label: "Move" },
    { id: "hand", icon: Hand, label: "Hand" },
    { id: "react", icon: ThumbsUp, label: "React" },
    { id: "action", icon: Zap, label: "Action" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-foreground/95 backdrop-blur-sm border-t border-foreground/10">
      {/* Left - User avatar */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-primary-foreground/20"
          style={{ backgroundColor: `#${userColor.toString(16).padStart(6, "0")}` }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-medium text-primary-foreground hidden sm:inline">{username}</span>
      </div>

      {/* Center - Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${
              activeTool === tool.id
                ? "bg-primary text-primary-foreground"
                : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
            }`}
          >
            <tool.icon className={`w-4 h-4 ${tool.accent && activeTool !== tool.id ? "text-destructive" : ""}`} />
            <span className="text-[10px] leading-none">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Right - Chat & Apps */}
      <div className="flex items-center gap-0.5 min-w-[120px] justify-end">
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${
            chatOpen
              ? "bg-primary text-primary-foreground"
              : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] leading-none">Chat</span>
        </button>
        <button
          onClick={onToggleSidebar}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${
            sidebarOpen
              ? "bg-primary text-primary-foreground"
              : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] leading-none">Apps</span>
        </button>
      </div>
    </div>
  );
}
