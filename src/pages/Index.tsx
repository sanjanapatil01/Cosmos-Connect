import { useState, useMemo } from "react";
import { UsernameModal } from "@/components/UsernameModal";
import { CosmosCanvas } from "@/components/CosmosCanvas";
import { ChatPanel } from "@/components/ChatPanel";
import { CosmosHUD } from "@/components/CosmosHUD";
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

  const nearbyUsers = useMemo(() => {
    if (!myUser) return [];
    return getNearbyUsers(myUser, otherUsers);
  }, [myUser, otherUsers]);

  if (!myUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Entering cosmos...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <CosmosCanvas myUser={myUser} otherUsers={otherUsers} onMove={updatePosition} />
      <CosmosHUD myUser={myUser} totalUsers={otherUsers.length + 1} nearbyCount={nearbyUsers.length} />
      {nearbyUsers.length > 0 && (
        <ChatPanel
          nearbyUsers={nearbyUsers}
          messages={messages}
          onSendMessage={sendMessage}
          myUserId={myUser.id}
        />
      )}
    </div>
  );
}
