import { CosmosUser } from "@/lib/cosmos";
import { Users, Keyboard, MapPin } from "lucide-react";

interface CosmosHUDProps {
  myUser: CosmosUser;
  totalUsers: number;
  nearbyCount: number;
}

export function CosmosHUD({ myUser, totalUsers, nearbyCount }: CosmosHUDProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
      {/* User badge */}
      <div className="rounded-lg border border-border bg-card shadow-soft px-4 py-2.5 flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full ring-2 ring-background"
          style={{ backgroundColor: `#${myUser.color.toString(16).padStart(6, "0")}` }}
        />
        <span className="text-sm font-semibold text-foreground">{myUser.username}</span>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-border bg-card shadow-soft px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {totalUsers} online
        </span>
        {nearbyCount > 0 && (
          <span className="flex items-center gap-1.5 text-cosmos-nearby font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {nearbyCount} nearby
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-lg border border-border bg-card shadow-soft px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
        <Keyboard className="w-3.5 h-3.5" />
        <span>WASD or Arrow keys to move</span>
      </div>
    </div>
  );
}
