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
}

export function CosmosCanvas({ myUser, otherUsers, onMove }: CosmosCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: 0, y: 0 });
  const myPosRef = useRef({ x: myUser.x, y: myUser.y });
  const otherUsersRef = useRef<CosmosUser[]>(otherUsers);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);

  otherUsersRef.current = otherUsers;

  const drawScene = useCallback(() => {
    const gfx = graphicsRef.current;
    if (!gfx) return;
    gfx.clear();

    const cam = cameraRef.current;
    const me = myPosRef.current;
    const app = appRef.current!;

    // Warm tile grid (like SpatialChat floor)
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

    // Room labels
    const rooms = [
      { x: 400, y: 300, label: "Room 1", w: 500, h: 350 },
      { x: 1200, y: 300, label: "Room 2", w: 500, h: 350 },
    ];
    for (const room of rooms) {
      const rx = room.x - cam.x;
      const ry = room.y - cam.y;
      gfx.beginFill(0x00000, 0.03);
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

    // Proximity zone (soft bubble around my user)
    gfx.lineStyle(0);
    gfx.beginFill(0x87ceeb, 0.04);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);
    gfx.endFill();
    gfx.lineStyle(1.5, 0x87ceeb, 0.15);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);

    // Other users
    for (const user of otherUsersRef.current) {
      const sx = user.x - cam.x;
      const sy = user.y - cam.y;
      const nearby = isNearby({ ...myUser, x: me.x, y: me.y }, user);

      if (nearby) {
        // Connection bubble
        const cx = (msx + sx) / 2;
        const cy = (msy + sy) / 2;
        const dist = Math.sqrt((sx - msx) ** 2 + (sy - msy) ** 2);
        gfx.lineStyle(0);
        gfx.beginFill(0xffffff, 0.35);
        gfx.drawRoundedRect(
          Math.min(msx, sx) - 40, Math.min(msy, sy) - 50,
          Math.abs(sx - msx) + 80, Math.abs(sy - msy) + 100,
          24
        );
        gfx.endFill();
        gfx.lineStyle(1, 0xc4a882, 0.3);
        gfx.drawRoundedRect(
          Math.min(msx, sx) - 40, Math.min(msy, sy) - 50,
          Math.abs(sx - msx) + 80, Math.abs(sy - msy) + 100,
          24
        );
      }

      // Avatar shadow
      gfx.lineStyle(0);
      gfx.beginFill(0x000000, 0.08);
      gfx.drawEllipse(sx, sy + AVATAR_RADIUS + 4, AVATAR_RADIUS * 0.8, 4);
      gfx.endFill();

      // Avatar body
      gfx.beginFill(user.color, nearby ? 1 : 0.7);
      gfx.drawCircle(sx, sy, AVATAR_RADIUS);
      gfx.endFill();

      // Avatar highlight
      gfx.beginFill(0xffffff, 0.3);
      gfx.drawCircle(sx - 5, sy - 6, 6);
      gfx.endFill();

      // Status dot
      if (nearby) {
        gfx.beginFill(0x22c55e, 1);
        gfx.drawCircle(sx + AVATAR_RADIUS - 2, sy + AVATAR_RADIUS - 2, 4);
        gfx.endFill();
        gfx.lineStyle(1.5, 0xffffff, 1);
        gfx.drawCircle(sx + AVATAR_RADIUS - 2, sy + AVATAR_RADIUS - 2, 4);
      }
    }

    // My shadow
    gfx.lineStyle(0);
    gfx.beginFill(0x000000, 0.1);
    gfx.drawEllipse(msx, msy + AVATAR_RADIUS + 4, AVATAR_RADIUS * 0.8, 4);
    gfx.endFill();

    // My avatar
    gfx.beginFill(myUser.color, 1);
    gfx.drawCircle(msx, msy, AVATAR_RADIUS);
    gfx.endFill();

    // My highlight
    gfx.beginFill(0xffffff, 0.35);
    gfx.drawCircle(msx - 5, msy - 6, 6);
    gfx.endFill();

    // My status dot (green = online)
    gfx.beginFill(0x22c55e, 1);
    gfx.drawCircle(msx + AVATAR_RADIUS - 2, msy + AVATAR_RADIUS - 2, 4);
    gfx.endFill();
    gfx.lineStyle(1.5, 0xffffff, 1);
    gfx.drawCircle(msx + AVATAR_RADIUS - 2, msy + AVATAR_RADIUS - 2, 4);
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
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }
        const newX = Math.max(AVATAR_RADIUS, Math.min(WORLD_WIDTH - AVATAR_RADIUS, myPosRef.current.x + dx));
        const newY = Math.max(AVATAR_RADIUS, Math.min(WORLD_HEIGHT - AVATAR_RADIUS, myPosRef.current.y + dy));
        myPosRef.current = { x: newX, y: newY };

        const now = Date.now();
        if (now - lastEmit > EMIT_INTERVAL) {
          onMove(newX, newY);
          lastEmit = now;
        }
      }

      cameraRef.current = {
        x: myPosRef.current.x - app.screen.width / 2,
        y: myPosRef.current.y - app.screen.height / 2,
      };

      drawScene();

      // Labels
      const cam = cameraRef.current;
      textContainer.removeChildren();

      // Room labels
      const rooms = [
        { x: 650, y: 620, label: "💬 Room 1" },
        { x: 1450, y: 620, label: "💬 Room 2" },
      ];
      for (const room of rooms) {
        const label = new PIXI.Text(room.label, {
          fontSize: 12,
          fontWeight: "600",
          fill: 0x8b7355,
          fontFamily: "Inter, system-ui, sans-serif",
        });
        label.anchor.set(0.5);
        label.x = room.x - cam.x;
        label.y = room.y - cam.y;
        textContainer.addChild(label);
      }

      // My label
      const myLabel = new PIXI.Text(myUser.username, {
        fontSize: 12,
        fontWeight: "600",
        fill: 0x3d2b1f,
        fontFamily: "Inter, system-ui, sans-serif",
        align: "center",
      });
      myLabel.anchor.set(0.5);
      myLabel.x = myPosRef.current.x - cam.x;
      myLabel.y = myPosRef.current.y - cam.y - AVATAR_RADIUS - 16;
      textContainer.addChild(myLabel);

      for (const user of otherUsersRef.current) {
        const nearby = isNearby({ ...myUser, x: myPosRef.current.x, y: myPosRef.current.y }, user);
        const label = new PIXI.Text(user.username, {
          fontSize: 12,
          fontWeight: nearby ? "600" : "400",
          fill: nearby ? 0x3d2b1f : 0x8b7355,
          fontFamily: "Inter, system-ui, sans-serif",
          align: "center",
        });
        label.anchor.set(0.5);
        label.x = user.x - cam.x;
        label.y = user.y - cam.y - AVATAR_RADIUS - 16;
        textContainer.addChild(label);

        // Nearby status dot colors next to name
        if (nearby) {
          const dot = new PIXI.Graphics();
          dot.beginFill(0x22c55e, 1);
          dot.drawCircle(0, 0, 3);
          dot.endFill();
          dot.x = user.x - cam.x - label.width / 2 - 8;
          dot.y = user.y - cam.y - AVATAR_RADIUS - 16;
          textContainer.addChild(dot);
        }
      }
    };

    app.ticker.add(ticker);

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

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
