# Simple Programming Language - Installation Site

This is the installation website for the Simple programming language, deployed on Vercel.

## Overview

A beautiful, animated installation page for the Simple programming language with:
- Platform-specific installation cards (Windows, Linux, macOS)
- Interactive copy-to-clipboard commands
- Animated fireworks background
- Ripple animation on first visit
- Platform-specific install/uninstall commands
- Dark/light mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with CSS variables
- **Animations**: Framer Motion
- **Icons**: Lucide React + Custom SVGs
- **Deployment**: Vercel (auto-deploys from main branch)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is deployed on **Vercel** with automatic deployments from the `main` branch.

### Live URL
**https://elijahshepherd.github.io/Simple/** (GitHub Pages - legacy)
**https://simple-lang.vercel.app** (Vercel - primary)

### Environment Variables
No environment variables required for the site itself.

### Platform Support
| Platform | Install Method | Notes |
|----------|---------------|-------|
| Windows | `irm ... simple.exe` | PowerShell install script |
| Linux | `curl ... | sudo mv` | Binary via curl |
| macOS | `brew install` | Homebrew tap |

### Built-in Commands
After installation, these commands are available:
- `simple version` - Show version
- `simple update` - Check for updates
- `simple uninstall` - Uninstall Simple
- `simple run <file>` - Run a Simple program
- `simple run-example <name>` - Run built-in example

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main installation page
│   ├── layout.tsx        # Root layout with theme provider
│   └── globals.css       # Global styles + CSS variables
├── components/
│   ├── icons.tsx         # Platform icons (Windows, Linux, macOS)
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── ui/
│   │   ├── copy-button.tsx
│   │   └── ...
│   └── magicui/
│       ├── fireworks.tsx
│       └── ripple.tsx
├── lib/
│   └── utils.ts
└── components/
    └── providers/
        └── theme-provider.tsx
```

## Adding New Versions

1. Create a new markdown file in `docs/release/` with version number (e.g., `1.6.0.md`)
2. Follow the format in `docs/release/1.5.0.md`
3. Push to main branch - GitHub Pages will auto-deploy

## License

MIT License - see LICENSE file for details.