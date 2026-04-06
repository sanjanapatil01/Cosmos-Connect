import { useState, useMemo } from "react";
import { UsernameModal } from "@/components/UsernameModal";
import { CosmosCanvas } from "@/components/CosmosCanvas";
import { ChatPanel } from "@/components/ChatPanel";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomToolbar } from "@/components/BottomToolbar";
import { LeftSidebar } from "@/components/LeftSidebar";
import { useCosmosChannel } from "@/hooks/useCosmosChannel";
import { getNearbyUsers } from "@/lib/cosmos";

export default function Index() {
  const [username, setUsername] = useState<string | null>(null);

  if (!username) {
    return <UsernameModal onSubmit={setUsername} />;
  }

  return <CosmosWorld username={username} />;
}

function CosmosWorld({ username }: { username: string }) {
  const { myUser, otherUsers, messages, updatePosition, sendMessage } = useCosmosChannel({ username });
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const nearbyUsers = useMemo(() => {
    if (!myUser) return [];
    return getNearbyUsers(myUser, otherUsers);
  }, [myUser, otherUsers]);

  // Auto-open chat when someone is nearby
  const hasNearby = nearbyUsers.length > 0;

  if (!myUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Connecting to cosmos...</span>
        </div>
      </div>
    );
  }

  const showChat = chatOpen || hasNearby;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Top navigation */}
      <TopNavbar totalUsers={otherUsers.length + 1} />

      {/* Canvas area (between top navbar and bottom toolbar) */}
      <div className="absolute top-12 bottom-14 left-0 right-0">
        <CosmosCanvas myUser={myUser} otherUsers={otherUsers} onMove={updatePosition} />
      </div>

      {/* Left sidebar */}
      {sidebarOpen && (
        <LeftSidebar
          users={otherUsers}
          myUser={myUser}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat panel */}
      {showChat && (
        <ChatPanel
          nearbyUsers={nearbyUsers}
          messages={messages}
          onSendMessage={sendMessage}
          myUserId={myUser.id}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Bottom toolbar */}
      <BottomToolbar
        onToggleChat={() => setChatOpen(!chatOpen)}
        chatOpen={showChat}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        username={myUser.username}
        userColor={myUser.color}
      />
    </div>
  );
}
