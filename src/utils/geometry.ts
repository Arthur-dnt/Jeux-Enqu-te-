import type { Hotspot } from '@/types/case';

export interface Point {
  x: number;
  y: number;
}

export function pointInPolygon(p: Point, points: [number, number][]): boolean {
  let inside = false;
  const n = points.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects =
      yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function hotspotContains(h: Hotspot, p: Point): boolean {
  switch (h.type) {
    case 'circle':
      return (p.x - h.x) ** 2 + (p.y - h.y) ** 2 <= h.r ** 2;
    case 'rect':
      return p.x >= h.x && p.x <= h.x + h.width && p.y >= h.y && p.y <= h.y + h.height;
    case 'polygon':
      return pointInPolygon(p, h.points);
  }
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
