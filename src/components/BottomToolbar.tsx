import { useState } from "react";
import {
  Share2, UserPlus, Circle, Move, Hand, ThumbsUp, Zap, MessageCircle, LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

interface BottomToolbarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  username: string;
  userColor: number;
  onHandRaise: () => void;
  handRaised: boolean;
  onReaction: (emoji: string) => void;
  onRecord: () => void;
  isRecording: boolean;
  onScreenShare: () => void;
  isScreenSharing: boolean;
}

const REACTION_EMOJIS = ["👍", "👋", "😂", "❤️", "🔥", "🎉", "👀", "👏"];

export function BottomToolbar({
  onToggleChat, chatOpen, onToggleSidebar, sidebarOpen,
  username, userColor, onHandRaise, handRaised,
  onReaction, onRecord, isRecording, onScreenShare, isScreenSharing,
}: BottomToolbarProps) {
  const [activeTool, setActiveTool] = useState<string>("move");
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!", { description: "Share it with others to join your space." });
    });
    setActiveTool("share");
  };

  const handleInvite = () => {
    const url = window.location.href;
    const subject = encodeURIComponent("Join me on Virtual Cosmos!");
    const body = encodeURIComponent(`Hey! Come join me on Virtual Cosmos: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast.info("Opening email to send invite...");
    setActiveTool("invite");
  };

  const handleRecord = () => {
    onRecord();
    setActiveTool("record");
    toast[isRecording ? "info" : "success"](isRecording ? "Recording stopped" : "Recording started", {
      description: isRecording ? "Your session recording has been saved." : "Recording your session...",
    });
  };

  const handleHand = () => {
    onHandRaise();
    setActiveTool("hand");
    toast[handRaised ? "info" : "success"](handRaised ? "Hand lowered" : "✋ Hand raised!", {
      description: handRaised ? "" : "Others can see your raised hand.",
    });
  };

  const handleReactionClick = () => {
    setShowReactions(!showReactions);
    setShowActions(false);
    setActiveTool("react");
  };

  const handleActionClick = () => {
    setShowActions(!showActions);
    setShowReactions(false);
    setActiveTool("action");
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-foreground/95 backdrop-blur-sm border-t border-foreground/10">
      {/* Reaction popup */}
      {showReactions && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-elevated px-2 py-2 flex items-center gap-1 animate-fade-in">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReaction(emoji);
                setShowReactions(false);
                toast(`${emoji} Reaction sent!`);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-xl transition-all hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Actions popup */}
      {showActions && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-elevated px-3 py-2 flex flex-col gap-1 animate-fade-in min-w-[180px]">
          <button
            onClick={() => {
              onScreenShare();
              setShowActions(false);
              toast[isScreenSharing ? "info" : "success"](
                isScreenSharing ? "Screen sharing stopped" : "Screen sharing started"
              );
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </button>
          <button
            onClick={() => {
              setShowActions(false);
              toast.info("Spotlight mode activated!");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Spotlight
          </button>
        </div>
      )}

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
        <ToolBtn icon={Share2} label="Share" active={activeTool === "share"} onClick={handleShare} />
        <ToolBtn icon={UserPlus} label="Invite" active={activeTool === "invite"} onClick={handleInvite} />
        <ToolBtn
          icon={Circle}
          label="Record"
          active={isRecording}
          onClick={handleRecord}
          accent={!isRecording}
          recording={isRecording}
        />
        <ToolBtn icon={Move} label="Move" active={activeTool === "move"} onClick={() => setActiveTool("move")} />
        <ToolBtn icon={Hand} label="Hand" active={handRaised} onClick={handleHand} />
        <ToolBtn icon={ThumbsUp} label="React" active={showReactions} onClick={handleReactionClick} />
        <ToolBtn icon={Zap} label="Action" active={showActions} onClick={handleActionClick} />
      </div>

      {/* Right - Chat & Apps */}
      <div className="flex items-center gap-0.5 min-w-[120px] justify-end">
        <ToolBtn icon={MessageCircle} label="Chat" active={chatOpen} onClick={onToggleChat} />
        <ToolBtn icon={LayoutGrid} label="Apps" active={sidebarOpen} onClick={onToggleSidebar} />
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, label, active, onClick, accent, recording }: {
  icon: any; label: string; active: boolean; onClick: () => void; accent?: boolean; recording?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
      }`}
    >
      <div className="relative">
        <Icon className={`w-4 h-4 ${accent ? "text-destructive" : ""}`} />
        {recording && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        )}
      </div>
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  );
}
