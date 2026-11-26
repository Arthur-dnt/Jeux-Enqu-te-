# Assets visuels — DOSSIER 9

Comment remplacer l'art provisoire (SVG) d'une scène par une illustration définitive, **sans toucher au code métier**.

## État actuel

Les 4 scènes du dossier 001 sont des compositions SVG détaillées (`src/components/scene/art/`), enregistrées dans `src/components/scene/art/artRegistry.ts` par `artKey`. Le `SceneViewer` rend l'art sur un canevas verrouillé au ratio **1000 × 700** (`SCENE_BASE_WIDTH/HEIGHT` dans `src/constants/index.ts`). Les hotspots utilisent des coordonnées normalisées 0–1 : ils restent alignés quel que soit l'écran ou le zoom.

| artKey | Scène | Fichier |
|---|---|---|
| `gallery` | Galerie principale | `GalleryScene.tsx` |
| `security` | Poste de sécurité | `SecurityRoomScene.tsx` |
| `workshop` | Atelier de restauration | `WorkshopScene.tsx` |
| `locker` | Vestiaire du gardien | `GuardLockerScene.tsx` |

## Option A — Remplacer par une image PNG

1. Exportez l'illustration en **PNG, ratio 1000:700** (ex. 2000×1400 px), style réaliste sombre.
2. Placez le fichier dans `assets/scenes/case001/` (gallery.png, security_room.png, restoration_workshop.png, guard_locker.png).
3. Modifiez **uniquement** `artRegistry.ts` pour renvoyer un `Image` au lieu du composant SVG :

```tsx
import { Image } from 'react-native';
import { SCENE_BASE_WIDTH, SCENE_BASE_HEIGHT } from '@/constants';

export const artRegistry: Record<string, () => React.ReactNode> = {
  gallery: () => (
    <Image
      source={require('../../../../assets/scenes/case001/gallery.png')}
      style={{ width: SCENE_BASE_WIDTH, height: SCENE_BASE_HEIGHT }}
      accessibilityLabel="Galerie principale du musée de Valmont"
    />
  ),
};
```

4. Recalibrez les hotspots si l'illustration place les objets différemment (coordonnées 0–1 : pixel ÷ dimension de l'image).

## Option B — Ajouter une nouvelle scène SVG

1. Créez `src/components/scene/art/MaScene.tsx` : composant sans props, `viewBox="0 0 1000 700"`, remplissant exactement le canevas.
2. Enregistrez-le dans `artRegistry.ts` sous une nouvelle clé `artKey`.
3. Référencez cet `artKey` dans le JSON de l'enquête (`scenes[].artKey`).

## Règles à respecter

- **Ne jamais** coder d'IDs de hotspots ou de preuves dans l'art : l'art est décoratif, les zones interactives viennent uniquement du JSON de l'enquête.
- Garder le ratio 1000:700, sinon les hotspots se désalignent.
- Fournir un `accessibilityLabel` descriptif.
- Ne pas dépendre d'images téléchargées à distance : tout doit fonctionner hors connexion.

## Organisation des assets

```
assets/
├── logo/
├── scenes/case001/   # gallery.png, security_room.png, restoration_workshop.png, guard_locker.png
├── evidence/case001/
├── suspects/case001/
└── ui/
```

Les dossiers `evidence/` et `suspects/` accueilleront les fiches illustrées (actuellement : icônes vectorielles et monogrammes typographiques).
