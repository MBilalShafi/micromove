# 🚀 MicroMove

**Big tasks → tiny wins. 5 minutes at a time.**

MicroMove is an AI-powered procrastination killer that helps you overcome task paralysis by breaking overwhelming tasks into tiny, manageable micro-steps.

![MicroMove Demo](https://img.shields.io/badge/Status-MVP-brightgreen)

## The Problem

You know that task you've been putting off? The one that feels so big you don't even know where to start? That's not laziness—it's **task paralysis**. Your brain sees a mountain and freezes.

## The Solution

MicroMove takes your overwhelming task and:

1. 🧠 **AI breaks it down** into 5-7 tiny steps (each ~5 minutes)
2. ⏱️ **Shows ONE step at a time** (no overwhelm)
3. 🎯 **5-minute timer** keeps you focused
4. 😵 **"I'm stuck" button** makes the step even smaller
5. 🎉 **Celebrates wins** to build momentum

## Features

- ✅ Clean, focused UI with one step at a time
- ✅ Customizable timer (3, 5, 10, or 15 minutes)
- ✅ AI-powered task breakdown (OpenAI)
- ✅ "I'm stuck" reframes steps to be even smaller
- ✅ Progress tracking & completion stats
- ✅ Sound & vibration notifications
- ✅ Session persistence (resume where you left off)
- ✅ Keyboard shortcuts (Enter, Space, S)
- ✅ Works offline with fallback steps
- ✅ Mobile-friendly responsive design

## Quick Start

```bash
# Clone the repo
git clone https://github.com/MBilalShafi/micromove.git
cd micromove

# Install dependencies
pnpm install

# (Optional) Add OpenAI API key for AI features
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start crushing tasks!

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI-powered breakdown. App works without it using smart fallbacks. |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **AI:** OpenAI GPT-4o-mini
- **Storage:** LocalStorage (no backend needed)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Mark current step as done |
| `Space` | Pause/Resume timer |
| `S` | I'm stuck (reframe step) |
| `⌘/Ctrl + Enter` | Start task breakdown |

## How It Works

### The Psychology

MicroMove is built on two key insights:

1. **Procrastination isn't about laziness**—it's about emotional regulation. Big tasks trigger anxiety, so we avoid them.

2. **Momentum is everything**. Once you start, you usually keep going. The hardest part is the first action.

### The AI

When you enter a task, the AI:
- Breaks it into 5-7 concrete micro-steps
- Starts with the easiest possible action
- Makes each step completable in ~5 minutes
- Uses encouraging, specific language

If you click "I'm stuck", the AI makes the current step even smaller—sometimes almost silly in how small it gets. That's the point!

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MBilalShafi/micromove&env=OPENAI_API_KEY&envDescription=Optional%20OpenAI%20API%20key%20for%20AI-powered%20task%20breakdown&envLink=https://platform.openai.com/api-keys)

**Steps:**
1. Click the button above
2. Connect your GitHub account
3. (Optional) Add `OPENAI_API_KEY` for AI features
4. Deploy!

The app works without an API key (uses smart fallbacks), but AI makes breakdowns much better.

### Self-Hosted

```bash
# Build for production
pnpm build

# Start the server
pnpm start

# Or with a custom port
PORT=8080 pnpm start
```

### Docker (Coming Soon)

```dockerfile
# Dockerfile coming in a future update
```

## Contributing

PRs welcome! Some ideas:
- [ ] Dark/light mode toggle
- [ ] Export session history
- [ ] Share completion cards
- [ ] Pomodoro mode (work/break cycles)
- [ ] Integration with todo apps
- [ ] Browser extension

## License

MIT © 2025

---

**Stop avoiding. Start micro-moving. 🚀**
