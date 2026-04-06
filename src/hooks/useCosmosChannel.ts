import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { CosmosUser, ChatMessage, CosmosAction, randomSpawn, randomColor } from "@/lib/cosmos";

interface UseCosmosChannelOptions {
  username: string;
}

export function useCosmosChannel({ username }: UseCosmosChannelOptions) {
  const [myUser, setMyUser] = useState<CosmosUser | null>(null);
  const [otherUsers, setOtherUsers] = useState<CosmosUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<CosmosAction[]>([]);
  const [handRaisedUsers, setHandRaisedUsers] = useState<Set<string>>(new Set());
  const [userReactions, setUserReactions] = useState<Map<string, { emoji: string; ts: number }>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
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
      .on("broadcast", { event: "action" }, ({ payload }) => {
        const action = payload as CosmosAction;
        setActions((prev) => [...prev.slice(-49), action]);

        if (action.type === "hand_raise") {
          setHandRaisedUsers((prev) => new Set(prev).add(action.userId));
        } else if (action.type === "hand_lower") {
          setHandRaisedUsers((prev) => {
            const next = new Set(prev);
            next.delete(action.userId);
            return next;
          });
        } else if (action.type === "reaction") {
          setUserReactions((prev) => {
            const next = new Map(prev);
            next.set(action.userId, { emoji: action.emoji || "👍", ts: action.timestamp });
            return next;
          });
          // Clear reaction after 3 seconds
          setTimeout(() => {
            setUserReactions((prev) => {
              const next = new Map(prev);
              if (next.get(action.userId)?.ts === action.timestamp) {
                next.delete(action.userId);
              }
              return next;
            });
          }, 3000);
        }
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

  const updatePosition = useCallback((x: number, y: number) => {
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
  }, []);

  const sendMessage = useCallback((text: string, imageUrl?: string) => {
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
  }, []);

  const broadcastAction = useCallback((actionType: CosmosAction["type"], emoji?: string) => {
    if (!channelRef.current || !myUserRef.current) return;
    const action: CosmosAction = {
      type: actionType,
      userId: myUserRef.current.id,
      username: myUserRef.current.username,
      emoji,
      timestamp: Date.now(),
    };
    channelRef.current.send({
      type: "broadcast",
      event: "action",
      payload: action,
    });
    // Apply locally too
    if (actionType === "hand_raise") {
      setHandRaisedUsers((prev) => new Set(prev).add(myUserRef.current!.id));
    } else if (actionType === "hand_lower") {
      setHandRaisedUsers((prev) => {
        const next = new Set(prev);
        next.delete(myUserRef.current!.id);
        return next;
      });
    } else if (actionType === "reaction") {
      const ts = action.timestamp;
      setUserReactions((prev) => {
        const next = new Map(prev);
        next.set(myUserRef.current!.id, { emoji: emoji || "👍", ts });
        return next;
      });
      setTimeout(() => {
        setUserReactions((prev) => {
          const next = new Map(prev);
          if (next.get(myUserRef.current!.id)?.ts === ts) {
            next.delete(myUserRef.current!.id);
          }
          return next;
        });
      }, 3000);
    }
  }, []);

  const toggleHandRaise = useCallback(() => {
    if (!myUserRef.current) return;
    const isRaised = handRaisedUsers.has(myUserRef.current.id);
    broadcastAction(isRaised ? "hand_lower" : "hand_raise");
  }, [handRaisedUsers, broadcastAction]);

  const sendReaction = useCallback((emoji: string) => {
    broadcastAction("reaction", emoji);
  }, [broadcastAction]);

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
    broadcastAction(isScreenSharing ? "screen_share_stop" : "screen_share_start");
  }, [isScreenSharing, broadcastAction]);

  return {
    myUser,
    otherUsers,
    messages,
    actions,
    handRaisedUsers,
    userReactions,
    isRecording,
    isScreenSharing,
    updatePosition,
    sendMessage,
    toggleHandRaise,
    sendReaction,
    toggleRecording,
    toggleScreenShare,
    broadcastAction,
  };
}
