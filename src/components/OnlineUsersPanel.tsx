import { CosmosUser, isNearby } from "@/lib/cosmos";
import { Circle } from "lucide-react";

interface OnlineUsersPanelProps {
  users: CosmosUser[];
  myUser: CosmosUser;
}

export function OnlineUsersPanel({ users, myUser }: OnlineUsersPanelProps) {
  if (users.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 w-52">
      <div className="rounded-lg border border-border bg-card shadow-soft px-4 py-3">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Online Users
        </h4>
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          {users.map((user) => {
            const nearby = isNearby(myUser, user);
            return (
              <div key={user.id} className="flex items-center gap-2 py-1">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: `#${user.color.toString(16).padStart(6, "0")}` }}
                />
                <span className={`text-xs truncate ${nearby ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {user.username}
                </span>
                {nearby && (
                  <Circle className="w-2 h-2 fill-cosmos-nearby text-cosmos-nearby ml-auto shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
