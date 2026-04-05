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

    // Grid — light soft lines
    gfx.lineStyle(1, 0xd4e5f0, 0.5);
    const gridSize = 80;
    const startX = -(cam.x % gridSize);
    const startY = -(cam.y % gridSize);
    for (let x = startX; x < app.screen.width; x += gridSize) {
      gfx.moveTo(x, 0);
      gfx.lineTo(x, app.screen.height);
    }
    for (let y = startY; y < app.screen.height; y += gridSize) {
      gfx.moveTo(0, y);
      gfx.lineTo(app.screen.width, y);
    }

    // World border
    gfx.lineStyle(2, 0x0ea5e9, 0.25);
    gfx.drawRect(-cam.x, -cam.y, WORLD_WIDTH, WORLD_HEIGHT);

    const msx = me.x - cam.x;
    const msy = me.y - cam.y;

    // Other users
    for (const user of otherUsersRef.current) {
      const sx = user.x - cam.x;
      const sy = user.y - cam.y;
      const nearby = isNearby({ ...myUser, x: me.x, y: me.y }, user);

      // Connection line
      if (nearby) {
        gfx.lineStyle(1.5, 0x0ea5e9, 0.2);
        gfx.moveTo(msx, msy);
        gfx.lineTo(sx, sy);

        // Proximity circle
        gfx.lineStyle(1, 0x22c55e, 0.12);
        gfx.drawCircle(sx, sy, PROXIMITY_RADIUS);
      }

      // Shadow
      gfx.lineStyle(0);
      gfx.beginFill(0x000000, 0.04);
      gfx.drawCircle(sx + 2, sy + 2, AVATAR_RADIUS);
      gfx.endFill();

      // Avatar body
      gfx.beginFill(user.color, nearby ? 0.95 : 0.6);
      gfx.drawCircle(sx, sy, AVATAR_RADIUS);
      gfx.endFill();

      // Highlight
      gfx.beginFill(0xffffff, 0.25);
      gfx.drawCircle(sx - 5, sy - 6, 5);
      gfx.endFill();

      // Active ring for nearby
      if (nearby) {
        gfx.lineStyle(2, 0x22c55e, 0.5);
        gfx.drawCircle(sx, sy, AVATAR_RADIUS + 4);
      }
    }

    // My proximity radius
    gfx.lineStyle(1, 0x0ea5e9, 0.1);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);

    // My shadow
    gfx.lineStyle(0);
    gfx.beginFill(0x000000, 0.06);
    gfx.drawCircle(msx + 2, msy + 2, AVATAR_RADIUS);
    gfx.endFill();

    // My avatar
    gfx.beginFill(myUser.color, 1);
    gfx.drawCircle(msx, msy, AVATAR_RADIUS);
    gfx.endFill();

    // My highlight
    gfx.beginFill(0xffffff, 0.3);
    gfx.drawCircle(msx - 5, msy - 6, 5);
    gfx.endFill();

    // My ring
    gfx.lineStyle(2, 0x0ea5e9, 0.4);
    gfx.drawCircle(msx, msy, AVATAR_RADIUS + 4);
  }, [myUser]);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundColor: 0xf5f9fc,
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

      const myLabel = new PIXI.Text(myUser.username, {
        fontSize: 11,
        fontWeight: "600",
        fill: 0x1e3a4f,
        fontFamily: "Inter, system-ui, sans-serif",
        align: "center",
      });
      myLabel.anchor.set(0.5);
      myLabel.x = myPosRef.current.x - cam.x;
      myLabel.y = myPosRef.current.y - cam.y - AVATAR_RADIUS - 14;
      textContainer.addChild(myLabel);

      for (const user of otherUsersRef.current) {
        const nearby = isNearby({ ...myUser, x: myPosRef.current.x, y: myPosRef.current.y }, user);
        const label = new PIXI.Text(user.username, {
          fontSize: 11,
          fontWeight: nearby ? "600" : "400",
          fill: nearby ? 0x166534 : 0x6b7280,
          fontFamily: "Inter, system-ui, sans-serif",
          align: "center",
        });
        label.anchor.set(0.5);
        label.x = user.x - cam.x;
        label.y = user.y - cam.y - AVATAR_RADIUS - 14;
        textContainer.addChild(label);
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
