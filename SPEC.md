# MicroMove - AI Procrastination Killer

## Tagline
"Big tasks → tiny wins. 5 minutes at a time."

## Core Flow
1. User enters task they're avoiding
2. AI breaks it into 5-min micro-steps (5-10 steps)
3. User starts session → timer begins
4. Shows ONE step at a time (no overwhelm)
5. User marks done → celebration → next step
6. "I'm stuck" → AI reframes/shrinks the step
7. Progress bar shows momentum building

## MVP Features
- [ ] Clean single-page UI
- [ ] Task input with AI breakdown
- [ ] 5-minute countdown timer
- [ ] One step at a time view
- [ ] Done / Stuck buttons
- [ ] Progress visualization
- [ ] Encouraging micro-copy
- [ ] Sound/vibration on timer end
- [ ] Local storage for session persistence

## UI Sections
1. **Start Screen** - Input task, big CTA
2. **Session Screen** - Current step, timer, done/stuck
3. **Complete Screen** - Celebration, stats, share

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI API (gpt-4o-mini for speed)
- Framer Motion (subtle animations)
- Local Storage (no backend needed for MVP)

## Design Vibe
- Calm, not gamified
- Soft gradients (purple/blue)
- Big readable text
- Minimal UI, maximum focus
