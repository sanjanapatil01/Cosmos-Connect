// Proximity radius in pixels
export const PROXIMITY_RADIUS = 150;

// World dimensions
export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 2000;

// Movement speed (pixels per frame)
export const MOVE_SPEED = 4;

// Avatar radius
export const AVATAR_RADIUS = 22;

export interface CosmosUser {
  id: string;
  username: string;
  x: number;
  y: number;
  color: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  imageUrl?: string;
}

/** Euclidean distance between two points */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/** Check if two users are within proximity */
export function isNearby(a: CosmosUser, b: CosmosUser): boolean {
  return getDistance(a.x, a.y, b.x, b.y) < PROXIMITY_RADIUS;
}

/** Get users within proximity of a given user */
export function getNearbyUsers(user: CosmosUser, allUsers: CosmosUser[]): CosmosUser[] {
  return allUsers.filter((u) => u.id !== user.id && isNearby(user, u));
}

/** Generate a random spawn position */
export function randomSpawn(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * (WORLD_WIDTH - 400)) + 200,
    y: Math.floor(Math.random() * (WORLD_HEIGHT - 400)) + 200,
  };
}

/** Generate a random avatar color */
export function randomColor(): number {
  const colors = [
    0x8b5cf6, // purple
    0x06b6d4, // cyan
    0xf59e0b, // amber
    0xef4444, // red
    0x10b981, // emerald
    0xec4899, // pink
    0x3b82f6, // blue
    0xf97316, // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
