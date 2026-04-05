import { CosmosUser } from "@/lib/cosmos";
import { Users, Move } from "lucide-react";

interface CosmosHUDProps {
  myUser: CosmosUser;
  totalUsers: number;
  nearbyCount: number;
}

export function CosmosHUD({ myUser, totalUsers, nearbyCount }: CosmosHUDProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl px-4 py-2.5 flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: `#${myUser.color.toString(16).padStart(6, "0")}` }}
        />
        <span className="text-sm font-medium text-foreground">{myUser.username}</span>
      </div>

      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5" />
        <span>{totalUsers} online</span>
        {nearbyCount > 0 && (
          <span className="text-cosmos-nearby font-medium">• {nearbyCount} nearby</span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-2">
        <Move className="w-3 h-3" />
        WASD / Arrow keys to move
      </div>
    </div>
  );
}
