import { CosmosUser } from "@/lib/cosmos";
import { Headphones, Video, Users, Maximize2, ExternalLink } from "lucide-react";

interface TopNavbarProps {
  totalUsers: number;
  spaceName?: string;
}

export function TopNavbar({ totalUsers, spaceName = "Virtual Cosmos" }: TopNavbarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 h-12 flex items-center justify-between px-4 bg-foreground/95 backdrop-blur-sm border-b border-foreground/10">
      {/* Left - Space name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">VC</span>
          </div>
          <span className="text-sm font-semibold text-primary-foreground">{spaceName}</span>
        </div>
      </div>

      {/* Center - Controls */}
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors text-xs">
          <Headphones className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Audio</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors text-xs">
          <Video className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Call</span>
        </button>
      </div>

      {/* Right - User count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-primary-foreground/70 text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{totalUsers}</span>
        </div>
        <button className="p-1.5 rounded-md text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
