import type { ComponentType } from 'react';
import { GalleryScene } from './GalleryScene';
import { SecurityRoomScene } from './SecurityRoomScene';
import { WorkshopScene } from './WorkshopScene';
import { GuardLockerScene } from './GuardLockerScene';

export const artRegistry: Record<string, ComponentType> = {
  gallery: GalleryScene,
  security_room: SecurityRoomScene,
  workshop: WorkshopScene,
  guard_locker: GuardLockerScene,
};

export function getSceneArt(artKey: string): ComponentType {
  const Art = artRegistry[artKey];
  if (!Art) throw new Error(`Illustration de scène inconnue: ${artKey}`);
  return Art;
}
