import { useEffect, useRef, useCallback } from "react";
import * as PIXI from "pixi.js";
import {
  CosmosUser,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MOVE_SPEED,
  AVATAR_RADIUS,
  PROXIMITY_RADIUS,
  isNearby,
} from "@/lib/cosmos";

interface CosmosCanvasProps {
  myUser: CosmosUser;
  otherUsers: CosmosUser[];
  onMove: (x: number, y: number) => void;
  handRaisedUsers: Set<string>;
  userReactions: Map<string, { emoji: string; ts: number }>;
}

export function CosmosCanvas({ myUser, otherUsers, onMove, handRaisedUsers, userReactions }: CosmosCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: 0, y: 0 });
  const myPosRef = useRef({ x: myUser.x, y: myUser.y });
  const otherUsersRef = useRef<CosmosUser[]>(otherUsers);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const handRaisedRef = useRef(handRaisedUsers);
  const reactionsRef = useRef(userReactions);

  otherUsersRef.current = otherUsers;
  handRaisedRef.current = handRaisedUsers;
  reactionsRef.current = userReactions;

  const drawScene = useCallback(() => {
    const gfx = graphicsRef.current;
    if (!gfx) return;
    gfx.clear();

    const cam = cameraRef.current;
    const me = myPosRef.current;
    const app = appRef.current!;

    // Warm tile grid
    const gridSize = 64;
    const startX = Math.floor(cam.x / gridSize) * gridSize - cam.x;
    const startY = Math.floor(cam.y / gridSize) * gridSize - cam.y;
    for (let x = startX; x < app.screen.width; x += gridSize) {
      for (let y = startY; y < app.screen.height; y += gridSize) {
        const worldX = x + cam.x;
        const worldY = y + cam.y;
        const checker = (Math.floor(worldX / gridSize) + Math.floor(worldY / gridSize)) % 2 === 0;
        gfx.beginFill(checker ? 0xf0e6d3 : 0xe8dcc8, 1);
        gfx.drawRect(x, y, gridSize, gridSize);
        gfx.endFill();
      }
    }

    // Rooms
    const rooms = [
      { x: 400, y: 300, w: 500, h: 350 },
      { x: 1200, y: 300, w: 500, h: 350 },
    ];
    for (const room of rooms) {
      const rx = room.x - cam.x;
      const ry = room.y - cam.y;
      gfx.beginFill(0x000000, 0.03);
      gfx.drawRoundedRect(rx, ry, room.w, room.h, 16);
      gfx.endFill();
      gfx.lineStyle(1.5, 0xc4a882, 0.4);
      gfx.drawRoundedRect(rx, ry, room.w, room.h, 16);
    }

    // World border
    gfx.lineStyle(3, 0xc4a882, 0.3);
    gfx.drawRect(-cam.x, -cam.y, WORLD_WIDTH, WORLD_HEIGHT);

    const msx = me.x - cam.x;
    const msy = me.y - cam.y;

    // My proximity zone
    gfx.lineStyle(0);
    gfx.beginFill(0x87ceeb, 0.04);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);
    gfx.endFill();
    gfx.lineStyle(1.5, 0x87ceeb, 0.15);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);

    // Helper to draw avatar
    const drawAvatar = (sx: number, sy: number, color: number, opacity: number, userId: string) => {
      // Shadow
      gfx.lineStyle(0);
      gfx.beginFill(0x000000, 0.08);
      gfx.drawEllipse(sx, sy + AVATAR_RADIUS + 4, AVATAR_RADIUS * 0.8, 4);
      gfx.endFill();

      // Body
      gfx.beginFill(color, opacity);
      gfx.drawCircle(sx, sy, AVATAR_RADIUS);
      gfx.endFill();

      // Highlight
      gfx.beginFill(0xffffff, 0.3);
      gfx.drawCircle(sx - 5, sy - 6, 6);
      gfx.endFill();

      // Status dot
      gfx.beginFill(0x22c55e, 1);
      gfx.drawCircle(sx + AVATAR_RADIUS - 2, sy + AVATAR_RADIUS - 2, 4);
      gfx.endFill();
      gfx.lineStyle(1.5, 0xffffff, 1);
      gfx.drawCircle(sx + AVATAR_RADIUS - 2, sy + AVATAR_RADIUS - 2, 4);

      // Hand raised indicator
      if (handRaisedRef.current.has(userId)) {
        gfx.lineStyle(2, 0xf59e0b, 0.9);
        gfx.drawCircle(sx, sy, AVATAR_RADIUS + 6);
        // Yellow hand badge
        gfx.lineStyle(0);
        gfx.beginFill(0xfbbf24, 1);
        gfx.drawCircle(sx - AVATAR_RADIUS + 2, sy - AVATAR_RADIUS + 2, 8);
        gfx.endFill();
      }
    };

    // Other users
    for (const user of otherUsersRef.current) {
      const sx = user.x - cam.x;
      const sy = user.y - cam.y;
      const nearby = isNearby({ ...myUser, x: me.x, y: me.y }, user);

      if (nearby) {
        gfx.lineStyle(0);
        gfx.beginFill(0xffffff, 0.35);
        gfx.drawRoundedRect(
          Math.min(msx, sx) - 40, Math.min(msy, sy) - 50,
          Math.abs(sx - msx) + 80, Math.abs(sy - msy) + 100, 24
        );
        gfx.endFill();
        gfx.lineStyle(1, 0xc4a882, 0.3);
        gfx.drawRoundedRect(
          Math.min(msx, sx) - 40, Math.min(msy, sy) - 50,
          Math.abs(sx - msx) + 80, Math.abs(sy - msy) + 100, 24
        );
      }

      drawAvatar(sx, sy, user.color, nearby ? 1 : 0.7, user.id);
    }

    // My avatar
    drawAvatar(msx, msy, myUser.color, 1, myUser.id);
  }, [myUser]);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundColor: 0xf0e6d3,
      antialias: true,
    });
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const gfx = new PIXI.Graphics();
    app.stage.addChild(gfx);
    graphicsRef.current = gfx;

    const textContainer = new PIXI.Container();
    app.stage.addChild(textContainer);

    let lastEmit = 0;
    const EMIT_INTERVAL = 50;

    const ticker = () => {
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.has("w") || keys.has("arrowup")) dy -= MOVE_SPEED;
      if (keys.has("s") || keys.has("arrowdown")) dy += MOVE_SPEED;
      if (keys.has("a") || keys.has("arrowleft")) dx -= MOVE_SPEED;
      if (keys.has("d") || keys.has("arrowright")) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        const newX = Math.max(AVATAR_RADIUS, Math.min(WORLD_WIDTH - AVATAR_RADIUS, myPosRef.current.x + dx));
        const newY = Math.max(AVATAR_RADIUS, Math.min(WORLD_HEIGHT - AVATAR_RADIUS, myPosRef.current.y + dy));
        myPosRef.current = { x: newX, y: newY };
        const now = Date.now();
        if (now - lastEmit > EMIT_INTERVAL) { onMove(newX, newY); lastEmit = now; }
      }

      cameraRef.current = {
        x: myPosRef.current.x - app.screen.width / 2,
        y: myPosRef.current.y - app.screen.height / 2,
      };

      drawScene();

      const cam = cameraRef.current;
      textContainer.removeChildren();

      // Room labels
      const roomLabels = [
        { x: 650, y: 620, label: "💬 Room 1" },
        { x: 1450, y: 620, label: "💬 Room 2" },
      ];
      for (const room of roomLabels) {
        const label = new PIXI.Text(room.label, {
          fontSize: 12, fontWeight: "600", fill: 0x8b7355,
          fontFamily: "Inter, system-ui, sans-serif",
        });
        label.anchor.set(0.5);
        label.x = room.x - cam.x;
        label.y = room.y - cam.y;
        textContainer.addChild(label);
      }

      // Helper to add text labels for a user
      const addUserLabels = (userId: string, uname: string, ux: number, uy: number, isMyUser: boolean, nearby: boolean) => {
        const sx = ux - cam.x;
        const sy = uy - cam.y;

        // Username label
        const label = new PIXI.Text(uname, {
          fontSize: 12,
          fontWeight: isMyUser || nearby ? "600" : "400",
          fill: isMyUser || nearby ? 0x3d2b1f : 0x8b7355,
          fontFamily: "Inter, system-ui, sans-serif",
          align: "center",
        });
        label.anchor.set(0.5);
        label.x = sx;
        label.y = sy - AVATAR_RADIUS - 16;
        textContainer.addChild(label);

        // Status dot next to name
        if (nearby && !isMyUser) {
          const dot = new PIXI.Graphics();
          dot.beginFill(0x22c55e, 1);
          dot.drawCircle(0, 0, 3);
          dot.endFill();
          dot.x = sx - label.width / 2 - 8;
          dot.y = sy - AVATAR_RADIUS - 16;
          textContainer.addChild(dot);
        }

        // Hand raised emoji
        if (handRaisedRef.current.has(userId)) {
          const hand = new PIXI.Text("✋", {
            fontSize: 16, fontFamily: "Inter, system-ui, sans-serif",
          });
          hand.anchor.set(0.5);
          hand.x = sx;
          hand.y = sy - AVATAR_RADIUS - 34;
          textContainer.addChild(hand);
        }

        // Reaction emoji (floating above)
        const reaction = reactionsRef.current.get(userId);
        if (reaction) {
          const elapsed = Date.now() - reaction.ts;
          const progress = Math.min(elapsed / 3000, 1);
          const yOffset = -AVATAR_RADIUS - 44 - progress * 30;
          const alpha = 1 - progress * 0.6;

          const reactionText = new PIXI.Text(reaction.emoji, {
            fontSize: 24, fontFamily: "Inter, system-ui, sans-serif",
          });
          reactionText.anchor.set(0.5);
          reactionText.x = sx;
          reactionText.y = sy + yOffset;
          reactionText.alpha = alpha;
          textContainer.addChild(reactionText);
        }
      };

      // My labels
      addUserLabels(myUser.id, myUser.username, myPosRef.current.x, myPosRef.current.y, true, false);

      // Other user labels
      for (const user of otherUsersRef.current) {
        const nearby = isNearby({ ...myUser, x: myPosRef.current.x, y: myPosRef.current.y }, user);
        addUserLabels(user.id, user.username, user.x, user.y, false, nearby);
      }
    };

    app.ticker.add(ticker);

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      app.ticker.remove(ticker);
      app.destroy(true, { children: true });
    };
  }, [myUser, onMove, drawScene]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
