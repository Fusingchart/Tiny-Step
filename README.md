# Next Step

A chore and life-admin companion for adults with ADHD and neurodivergent brains who struggle with initiation and executive dysfunction.

## Philosophy

- The problem is not "not knowing what to do," it is "not being able to start."
- Big tasks are broken into tiny, low-resistance actions ("micro-steps").
- The app learns what works for each user and adapts over time.

## Getting Started

```bash
npm install
npm start
```

Then scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Features

- **Task capture** – Quick add with optional category, context, energy level
- **Micro-step generator** – Rule-based (AI-ready) breakdown into trivially startable steps
- **Session mode** – One step at a time: Done, Skip, or "Too much – make it smaller"
- **Task library** – Built-in templates for dishes, laundry, admin, self-care, planning
- **Personalization** – Tracks completion times and adapts suggestions
- **Progress & streaks** – Focus on wins, no shame on breaks
- **Notifications** – Opt-in nudges with playful, adult copy

## Tech Stack

- **Expo** (React Native) – iOS & Android
- **TypeScript**
- **AsyncStorage** – Local persistence (export/delete supported)
- **expo-notifications** – Nudges and reminders

## Project Structure

```
src/
├── types/       # Models (Task, MicroStep, Session, etc.)
├── storage/     # AsyncStorage layer
├── engine/      # Micro-step generator, personalization
├── data/        # Template library, presets
├── services/    # Notifications, analytics
├── context/     # App state
├── screens/     # UI screens
├── components/  # Shared components
└── theme/       # Colors, typography
```

## Data Export

Settings → Export my data. Data can be exported for backup or migration. User can request data deletion via settings (to be wired to a clear-data flow).

## Future Expansion

Architecture supports:

- Household/shared plans
- AI-powered micro-step generation
- Meal planning, medication reminders
- Partner communication tools
