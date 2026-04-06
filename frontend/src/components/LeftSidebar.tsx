import { CosmosUser, isNearby } from "@/lib/cosmos";
import { Search, Activity, Clock, Calendar, MessageSquare, Hash, ChevronDown, ChevronRight, X, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LeftSidebarProps {
  users: CosmosUser[];
  myUser: CosmosUser;
  onClose: () => void;
}

export function LeftSidebar({ users, myUser, onClose }: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roomsOpen, setRoomsOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState("Room 1");
  const [selectedChannel, setSelectedChannel] = useState("general-chat");

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nearbyUserIds = new Set(
    users.filter((u) => isNearby(myUser, u)).map((u) => u.id)
  );

  return (
    <div className="absolute left-0 top-12 bottom-14 w-60 z-20 flex flex-col bg-card border-r border-border animate-slide-in overflow-hidden">
      {/* Search */}
      <div className="px-3 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="h-8 pl-8 text-xs bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-0.5">
          <NavItem icon={Activity} label="Activities" />
          <NavItem icon={Clock} label="Recent Conversations" badge={users.length} />
          <NavItem icon={Calendar} label="Today's Calendar" />
        </div>

        {/* Rooms */}
        <div className="px-3 py-1">
          <button
            onClick={() => setRoomsOpen(!roomsOpen)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full py-1.5 hover:text-foreground transition-colors"
          >
            {roomsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Rooms
          </button>
          {roomsOpen && (
            <div className="space-y-0.5 ml-1">
              <NavItem
                icon={Monitor}
                label="Room 1"
                active={selectedRoom === "Room 1"}
                onClick={() => setSelectedRoom("Room 1")}
              />
              <NavItem
                icon={Monitor}
                label="Room 2"
                active={selectedRoom === "Room 2"}
                onClick={() => setSelectedRoom("Room 2")}
              />
              <button
                type="button"
                onClick={() => setSelectedRoom("New Call")}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5" />
                Start New Call
              </button>
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="px-3 py-1">
          <button
            onClick={() => setChannelsOpen(!channelsOpen)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full py-1.5 hover:text-foreground transition-colors"
          >
            {channelsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Channels
          </button>
          {channelsOpen && (
            <div className="space-y-0.5 ml-1">
              <NavItem
                icon={MessageSquare}
                label="Threads"
                active={selectedChannel === "Threads"}
                onClick={() => setSelectedChannel("Threads")}
              />
              <NavItem
                icon={Hash}
                label="general-chat"
                active={selectedChannel === "general-chat"}
                onClick={() => setSelectedChannel("general-chat")}
              />
              <NavItem
                icon={Hash}
                label="announcements"
                active={selectedChannel === "announcements"}
                onClick={() => setSelectedChannel("announcements")}
              />
            </div>
          )}
        </div>

        {/* Team */}
        <div className="px-3 py-1">
          <button
            onClick={() => setTeamOpen(!teamOpen)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full py-1.5 hover:text-foreground transition-colors"
          >
            {teamOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Team
          </button>
          {teamOpen && (
            <div className="space-y-1 ml-1">
              {/* My user */}
              <TeamMember
                username={myUser.username}
                color={myUser.color}
                isMe
                isNearby={false}
                status="Spatial"
              />
              {/* Other users */}
              {filteredUsers.map((user) => (
                <TeamMember
                  key={user.id}
                  username={user.username}
                  color={user.color}
                  isNearby={nearbyUserIds.has(user.id)}
                  status="Spatial"
                />
              ))}
              {filteredUsers.length === 0 && users.length === 0 && (
                <p className="text-[11px] text-muted-foreground px-2 py-2">No one else online</p>
              )}
            </div>
          )}
        </div>

        {/* Offline section */}
        <div className="px-3 py-1 border-t border-border mt-2">
          <button className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full py-1.5">
            <ChevronRight className="w-3 h-3" />
            Offline
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, badge, active, onClick }: { icon: any; label: string; badge?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors ${
        active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto shrink-0 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
          {badge}
        </span>
      )}
    </button>
  );
}

function TeamMember({ username, color, isMe, isNearby, status }: {
  username: string;
  color: number;
  isMe?: boolean;
  isNearby: boolean;
  status: string;
}) {
  const colorHex = `#${color.toString(16).padStart(6, "0")}`;
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
      <div className="relative">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
          style={{ backgroundColor: colorHex }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
          isNearby || isMe ? "bg-cosmos-nearby" : "bg-amber-400"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-foreground truncate">
            {username}{isMe && " (me)"}
          </span>
          {!isMe && (
            <span className="text-[10px] text-muted-foreground uppercase shrink-0">Guest</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{status}</span>
      </div>
    </div>
  );
}
