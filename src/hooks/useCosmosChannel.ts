import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { CosmosUser, ChatMessage, randomSpawn, randomColor } from "@/lib/cosmos";

interface UseCosmosChannelOptions {
  username: string;
}

export function useCosmosChannel({ username }: UseCosmosChannelOptions) {
  const [myUser, setMyUser] = useState<CosmosUser | null>(null);
  const [otherUsers, setOtherUsers] = useState<CosmosUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myUserRef = useRef<CosmosUser | null>(null);

  useEffect(() => {
    const userId = crypto.randomUUID();
    const spawn = randomSpawn();
    const user: CosmosUser = {
      id: userId,
      username,
      x: spawn.x,
      y: spawn.y,
      color: randomColor(),
    };
    setMyUser(user);
    myUserRef.current = user;

    const channel = supabase.channel("cosmos-world", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: CosmosUser[] = [];
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== userId && presences.length > 0) {
            const p = presences[0] as any;
            users.push({
              id: key,
              username: p.username,
              x: p.x,
              y: p.y,
              color: p.color,
            });
          }
        });
        setOtherUsers(users);
      })
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setMessages((prev) => [...prev.slice(-99), msg]);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            username: user.username,
            x: user.x,
            y: user.y,
            color: user.color,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [username]);

  const updatePosition = useCallback(
    (x: number, y: number) => {
      if (!channelRef.current || !myUserRef.current) return;
      const updated = { ...myUserRef.current, x, y };
      myUserRef.current = updated;
      setMyUser(updated);
      channelRef.current.track({
        username: updated.username,
        x: updated.x,
        y: updated.y,
        color: updated.color,
      });
    },
    []
  );

  const sendMessage = useCallback(
    (text: string, imageUrl?: string) => {
      if (!channelRef.current || !myUserRef.current) return;
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: myUserRef.current.id,
        senderName: myUserRef.current.username,
        text,
        timestamp: Date.now(),
        imageUrl,
      };
      channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: msg,
      });
      setMessages((prev) => [...prev.slice(-99), msg]);
    },
    []
  );

  return { myUser, otherUsers, messages, updatePosition, sendMessage };
}
