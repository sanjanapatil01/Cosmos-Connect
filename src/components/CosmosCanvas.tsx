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

  // Keep ref in sync
  otherUsersRef.current = otherUsers;

  const drawScene = useCallback(() => {
    const gfx = graphicsRef.current;
    if (!gfx) return;
    gfx.clear();

    const cam = cameraRef.current;
    const me = myPosRef.current;

    // Draw grid
    gfx.lineStyle(1, 0x1a1a3e, 0.3);
    const gridSize = 80;
    const startX = -(cam.x % gridSize);
    const startY = -(cam.y % gridSize);
    const app = appRef.current!;
    for (let x = startX; x < app.screen.width; x += gridSize) {
      gfx.moveTo(x, 0);
      gfx.lineTo(x, app.screen.height);
    }
    for (let y = startY; y < app.screen.height; y += gridSize) {
      gfx.moveTo(0, y);
      gfx.lineTo(app.screen.width, y);
    }

    // Draw world border
    gfx.lineStyle(2, 0x8b5cf6, 0.4);
    gfx.drawRect(-cam.x, -cam.y, WORLD_WIDTH, WORLD_HEIGHT);

    // Draw other users
    for (const user of otherUsersRef.current) {
      const sx = user.x - cam.x;
      const sy = user.y - cam.y;
      const nearby = isNearby({ ...myUser, x: me.x, y: me.y }, user);

      // Proximity radius indicator (faint)
      if (nearby) {
        gfx.lineStyle(1, 0x34d399, 0.15);
        gfx.drawCircle(sx, sy, PROXIMITY_RADIUS);
      }

      // Glow
      gfx.lineStyle(0);
      gfx.beginFill(user.color, nearby ? 0.2 : 0.08);
      gfx.drawCircle(sx, sy, AVATAR_RADIUS + 10);
      gfx.endFill();

      // Avatar
      gfx.beginFill(user.color, nearby ? 1 : 0.7);
      gfx.drawCircle(sx, sy, AVATAR_RADIUS);
      gfx.endFill();

      // Connection line
      if (nearby) {
        const msx = me.x - cam.x;
        const msy = me.y - cam.y;
        gfx.lineStyle(1, 0x34d399, 0.3);
        gfx.moveTo(msx, msy);
        gfx.lineTo(sx, sy);
      }
    }

    // Draw my proximity radius
    const msx = me.x - cam.x;
    const msy = me.y - cam.y;
    gfx.lineStyle(1, 0x8b5cf6, 0.15);
    gfx.drawCircle(msx, msy, PROXIMITY_RADIUS);

    // My glow
    gfx.lineStyle(0);
    gfx.beginFill(myUser.color, 0.2);
    gfx.drawCircle(msx, msy, AVATAR_RADIUS + 10);
    gfx.endFill();

    // My avatar
    gfx.beginFill(myUser.color, 1);
    gfx.drawCircle(msx, msy, AVATAR_RADIUS);
    gfx.endFill();

    // Inner highlight
    gfx.beginFill(0xffffff, 0.15);
    gfx.drawCircle(msx - 5, msy - 5, 6);
    gfx.endFill();
  }, [myUser]);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundColor: 0x0b0f1a,
      antialias: true,
    });
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const gfx = new PIXI.Graphics();
    app.stage.addChild(gfx);
    graphicsRef.current = gfx;

    // Username texts container
    const textContainer = new PIXI.Container();
    app.stage.addChild(textContainer);

    // Stars
    const starGfx = new PIXI.Graphics();
    app.stage.addChildAt(starGfx, 0);
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Throttle position updates
    let lastEmit = 0;
    const EMIT_INTERVAL = 50; // ms

    const ticker = () => {
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.has("w") || keys.has("arrowup")) dy -= MOVE_SPEED;
      if (keys.has("s") || keys.has("arrowdown")) dy += MOVE_SPEED;
      if (keys.has("a") || keys.has("arrowleft")) dx -= MOVE_SPEED;
      if (keys.has("d") || keys.has("arrowright")) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
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

      // Camera follows player
      cameraRef.current = {
        x: myPosRef.current.x - app.screen.width / 2,
        y: myPosRef.current.y - app.screen.height / 2,
      };

      // Draw stars
      starGfx.clear();
      const cam = cameraRef.current;
      for (const star of stars) {
        const sx = star.x - cam.x * 0.3; // parallax
        const sy = star.y - cam.y * 0.3;
        if (sx > -10 && sx < app.screen.width + 10 && sy > -10 && sy < app.screen.height + 10) {
          starGfx.beginFill(0xffffff, star.alpha);
          starGfx.drawCircle(sx, sy, star.size);
          starGfx.endFill();
        }
      }

      drawScene();

      // Username labels
      textContainer.removeChildren();
      // My name
      const myLabel = new PIXI.Text(myUser.username, {
        fontSize: 12,
        fill: 0xffffff,
        fontFamily: "Inter, sans-serif",
        align: "center",
      });
      myLabel.anchor.set(0.5);
      myLabel.x = myPosRef.current.x - cam.x;
      myLabel.y = myPosRef.current.y - cam.y - AVATAR_RADIUS - 12;
      textContainer.addChild(myLabel);

      for (const user of otherUsersRef.current) {
        const label = new PIXI.Text(user.username, {
          fontSize: 12,
          fill: isNearby({ ...myUser, x: myPosRef.current.x, y: myPosRef.current.y }, user) ? 0x34d399 : 0x999999,
          fontFamily: "Inter, sans-serif",
          align: "center",
        });
        label.anchor.set(0.5);
        label.x = user.x - cam.x;
        label.y = user.y - cam.y - AVATAR_RADIUS - 12;
        textContainer.addChild(label);
      }
    };

    app.ticker.add(ticker);

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in chat
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
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
