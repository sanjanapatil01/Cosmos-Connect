import { useEffect, useRef, useState, useCallback } from "react";
import { CosmosUser, ChatMessage, CosmosAction, randomSpawn, randomColor } from "@/lib/cosmos";

interface UseCosmosChannelOptions {
  username: string;
}

type ServerEvent =
  | { type: "presence"; users: CosmosUser[] }
  | { type: "chat"; payload: ChatMessage }
  | { type: "action"; payload: CosmosAction }
  | { type: "error"; message: string };

export function useCosmosChannel({ username }: UseCosmosChannelOptions) {
  const [myUser, setMyUser] = useState<CosmosUser | null>(null);
  const [otherUsers, setOtherUsers] = useState<CosmosUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<CosmosAction[]>([]);
  const [handRaisedUsers, setHandRaisedUsers] = useState<Set<string>>(new Set());
  const [userReactions, setUserReactions] = useState<Map<string, { emoji: string; ts: number }>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
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

    const serverUrl = import.meta.env.VITE_CHAT_SERVER_URL ?? "ws://localhost:4000";
    const socket = new WebSocket(serverUrl);
    socketRef.current = socket;

    const sendEvent = (event: unknown) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(event));
      }
    };

    socket.addEventListener("open", () => {
      sendEvent({ type: "join", user });
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data.toString()) as ServerEvent;

        if (data.type === "presence") {
          const users = data.users.filter((u) => u.id !== userId);
          setOtherUsers(users);
          return;
        }

        if (data.type === "chat") {
          if (!data.payload || !data.payload.id) return;
          setMessages((prev) => [...prev.slice(-99), data.payload]);
          return;
        }

        if (data.type === "action") {
          const action = data.payload;
          if (!action || !action.type) return;

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
          return;
        }
      } catch (error) {
        console.error("Invalid websocket message:", error);
      }
    });

    socket.addEventListener("close", () => {
      setOtherUsers([]);
    });

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave", userId }));
      }
      socket.close();
    };
  }, [username]);

  const updatePosition = useCallback((x: number, y: number) => {
    if (!socketRef.current || !myUserRef.current) return;
    const updated = { ...myUserRef.current, x, y };
    myUserRef.current = updated;
    setMyUser(updated);

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "position", user: updated }));
    }
  }, []);

  const sendMessage = useCallback((text: string, imageUrl?: string) => {
    if (!socketRef.current || !myUserRef.current) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: myUserRef.current.id,
      senderName: myUserRef.current.username,
      text,
      timestamp: Date.now(),
      imageUrl,
    };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "chat", payload: msg }));
    } else {
      console.warn("WebSocket is not connected. Message will be shown locally.");
    }

    setMessages((prev) => [...prev.slice(-99), msg]);
  }, []);

  const broadcastAction = useCallback((actionType: CosmosAction["type"], emoji?: string) => {
    if (!socketRef.current || !myUserRef.current) return;
    const action: CosmosAction = {
      type: actionType,
      userId: myUserRef.current.id,
      username: myUserRef.current.username,
      emoji,
      timestamp: Date.now(),
    };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "action", payload: action }));
    }

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
