# Changelog

All notable changes to MicroMove will be documented in this file.

## [0.1.0] - 2025-01-30

### Added
- Initial MVP release 🎉
- Task input with AI-powered breakdown (OpenAI GPT-4o-mini)
- Smart fallback steps when offline or without API key
  - Writing-specific steps
  - Coding-specific steps
  - Cleaning-specific steps
  - Email-specific steps
  - Study-specific steps
  - Generic fallback
- 5-minute countdown timer with visual circle
- One step at a time view to prevent overwhelm
- "I'm stuck" button that makes steps even smaller
- "Skip" option for steps
- Progress tracking with completion stats
- Session persistence via localStorage
- Keyboard shortcuts (Enter, Space, S, ⌘+Enter)
- Sound & vibration notifications
- Customizable timer duration (3/5/10/15 minutes)
- "View all steps" toggle in session view
- Example task suggestions
- Celebration confetti on completion 🎉
- Offline detection with banner notification
- Error state handling with friendly UI
- PWA manifest for installability
- "How it works" collapsible section
- GitHub star link

### Technical
- Next.js 14 (App Router)
- Tailwind CSS for styling
- Framer Motion for animations
- canvas-confetti for celebrations
- TypeScript for type safety
- Full accessibility support (aria labels, focus management)
