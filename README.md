# DOSSIER 9

**« Chaque indice compte. »**

Jeu mobile solo d'enquête et de déduction logique. Aucun narrateur : le joueur découvre tout par l'observation de scènes 2D détaillées, l'examen d'indices, la lecture de documents et ses propres raisonnements sur le carnet et le tableau de déduction.

- **Stack** : React Native · Expo SDK 53 · TypeScript strict · Expo Router · Gesture Handler · Reanimated · Zustand · React Native SVG · Expo SQLite · Supabase (optionnel) · Jest + jest-expo
- **Première affaire jouable** : DOSSIER 001 — LE MÉDAILLON DISPARU (vol au musée de Valmont, 4 scènes, 3 suspects, 21 indices, difficulté débutante)

---

## 1. Installation des dépendances

Prérequis : Node.js ≥ 18, npm ≥ 9, et l'application **Expo Go** sur votre téléphone pour tester facilement.

```bash
cd dossier9
npm install
```

## 2. Lancer l'application

```bash
npm start          # Expo DevTools, scannez le QR code avec Expo Go
npm run android    # émulateur Android (si configuré)
npm run ios        # simulateur iOS (macOS uniquement)
```

Le jeu fonctionne **100 % hors connexion** : SQLite locale, aucune URL externe requise.

## 3. Lancer les tests

```bash
npm test
npm test -- --watch
```

Couverture actuelle : calcul du score, découverte d'indices et détection des hotspots, validation et cohérence des données d'enquête, sauvegarde/restauration (round-trip), classement local (ordre + départage), tableau de déduction et progression (stores).

## 4. Configurer Supabase (optionnel)

Sans configuration, tout fonctionne en local et les classements affichent des données de démonstration clairement identifiées.

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Exécutez `supabase/migrations/0001_init.sql` dans l'éditeur SQL du projet (tables `profiles`, `user_progress`, `leaderboard_entries`, `daily_challenges`, `cloud_saves` + politiques RLS + RPC `submit_score`).
3. Copiez `.env.example` vers `.env` :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. Redémarrez `npm start`.

- **Auth** : écran Profil → création de compte / connexion (e-mail + mot de passe).
- **Sauvegarde cloud** : `src/services/sync/syncService.ts` (`pushSave`, `pullSave`, `pushNotes`), conflits résolus en **newest_wins** — une sauvegarde plus récente n'est jamais remplacée silencieusement par une plus ancienne.
- **Classement en ligne** : `src/features/leaderboard/supabaseLeaderboard.ts`. Les scores sont soumis via la RPC `submit_score` (validation serveur des bornes ; insertion directe interdite par RLS).
- **Aucune clé privée dans le frontend** : seule la clé `anon` (publique, protégée par RLS) est utilisée.

## 5. Ajouter une enquête

1. Créez `src/data/cases/case00X.json` en suivant la structure de `case001.json`.
2. Le schéma complet est décrit par `src/features/cases/caseSchema.ts` (Zod) et `src/types/case.ts` : métadonnées (`id`, `number`, `title`, `difficulty` 1–5, `type`, `estimatedMinutes`, `summary`, `briefing`, `locationName`, `caseDate`, `rewardXp`), `scenes[]` (avec `artKey` et `hotspots[]`), `evidence[]` (10 catégories), `suspects[]`, `motives[]`, `methodSteps[]` (inclure des étapes pièges), `solution` (IDs uniquement + `explanation` + `postResolutionReveal`).
3. Enregistrez le fichier dans le registre `src/features/cases/caseRegistry.ts` (une ligne dans `registry`).
4. Lancez `npm test` : la validation de structure (Zod) et de cohérence (références cassées, preuve décisive non découvrable…) s'exécute automatiquement au chargement.

**Aucune modification du moteur de jeu n'est nécessaire** : le jeu lit les enquêtes uniquement par les données.

## 6. Ajouter une scène

Dans le JSON de l'enquête, ajoutez un objet dans `scenes[]` :

```json
{
  "id": "scene_bureau",
  "name": "Bureau du directeur",
  "artKey": "bureau",
  "description": "Bureau lambrissé, lampe allumée.",
  "hotspots": []
}
```

Puis enregistrez l'illustration correspondante dans `src/components/scene/art/artRegistry.ts` (voir `docs/ASSETS.md` pour remplacer l'art SVG par une image PNG).

## 7. Créer un hotspot

Dans `hotspots[]` de la scène. Coordonnées **normalisées 0–1** relatives à l'image (jamais à l'écran) :

```json
{ "id": "hot_horloge", "label": "Horloge murale", "type": "circle", "x": 0.82, "y": 0.2, "r": 0.045, "evidenceId": "ev_horloge" }
{ "id": "hot_bureau", "label": "Bureau", "type": "rect", "x": 0.1, "y": 0.55, "width": 0.3, "height": 0.2 }
{ "id": "hot_tapis", "label": "Tapis", "type": "polygon", "points": [[0.3,0.7],[0.6,0.68],[0.62,0.9],[0.28,0.92]] }
```

- `evidenceId` est facultatif : un hotspot sans preuve est « examinable » sans rien révéler.
- Pour caler les coordonnées : position du point en pixels ÷ dimension de l'image.

## 8. Ajouter un indice

Dans `evidence[]` :

```json
{
  "id": "ev_horloge",
  "name": "Horloge murale",
  "category": "time_record",
  "sceneId": "scene_salon",
  "description": "L'horloge est arrêtée à 21 h 15.",
  "detail": "Description factuelle complémentaire, sans interprétation.",
  "icon": "time",
  "metadata": { "heure": "21:15" }
}
```

Catégories : `physical_object`, `photograph`, `document`, `testimony`, `technical_report`, `material_trace`, `time_record`, `written_message`, `visual_observation`, `chronological_clue`.

**Règle d'or** : descriptions factuelles — jamais la signification finale de l'indice.

## 9. Modifier une solution officielle

Éditez le bloc `solution` du JSON de l'enquête. La vérification se fait **par identifiants**, jamais par comparaison de texte. Après modification, `npm test` revalide la cohérence (IDs existants, preuves décisives découvrables). Le score maximal (1000 pts : coupable 400, mobile 200, méthode 200, preuves 150, bonus sans aide 50) est calculé par `src/features/scoring/scoringService.ts`.

## 10. Produire une version Android

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview      # APK de test
eas build --platform android --profile production   # AAB pour le Play Store
```

Profils définis dans `eas.json`. Build local possible : `eas build --platform android --local`.

## 11. Produire une version iOS

```bash
eas build --platform ios --profile production       # IPA (compte Apple Developer requis)
```

Pour le simulateur : `eas build --platform ios --profile preview --local` ou `npm run ios`.

---

## Arborescence

```
dossier9/
├── app/                        # Écrans (Expo Router)
│   ├── _layout.tsx             # Init DB + migrations + persistence + seed
│   ├── index.tsx home.tsx
│   ├── cases/  investigation/  accusation/  results/
│   ├── daily/  leaderboard/    archives/   profile/  notebook/
├── src/
│   ├── components/             # ui/, scene/ (art SVG + viewer), notebook/,
│   │                           # deduction-board/, suspects/, evidence/, case/
│   ├── features/               # Logique de jeu pure : cases (schéma/validation/
│   │                           # registre/quotidien), investigation (découverte,
│   │                           # accusation), scoring, progression, leaderboard,
│   │                           # persistence (service + autosave)
│   ├── database/               # migrations/, repositories/ (SQLite + mémoire)
│   ├── services/               # supabase/, sync/
│   ├── store/                  # Zustand : investigation, notebook, profile, settings
│   ├── data/cases/             # JSON des enquêtes (validé Zod au chargement)
│   ├── types/ hooks/ utils/ constants/ theme/
├── supabase/migrations/        # SQL : tables + RLS + RPC submit_score
├── tests/                      # Jest : scoring, découverte, validation, sauvegarde,
│                               # classement, tableau de déduction
└── docs/ASSETS.md              # Remplacer l'art des scènes sans toucher au moteur
```

## Sauvegarde automatique (priorité n°1)

- SQLite (`dossier9.db`) avec WAL, clés étrangères et **migrations versionnées** (`src/database/migrations/`).
- Sauvegarde **après chaque modification significative** (abonnement Zustand → écriture débounced 400 ms ; notes : 600 ms).
- Écritures **transactionnelles** pour la sauvegarde d'enquête (progressRepository) — jamais d'état partiel en cas de fermeture brutale.
- Au démarrage, `_layout.tsx` exécute : ouverture DB → migrations → initialisation de la persistance → seed du contenu → **restauration** de l'enquête active, des notes, du profil et des scores.
- Bouton « Reprendre mon enquête » sur l'accueil.

## Identité visuelle

Palette : encre `#111722`, nuit `#192536`, secondaire `#657080`, texte `#E8E9E7`, doré `#C4A66A`, alerte `#A94747`, validation `#648B72`. Interface sombre, portrait, une main, scènes 2D réalistes (SVG détaillés remplaçables par des PNG — voir `docs/ASSETS.md`).
