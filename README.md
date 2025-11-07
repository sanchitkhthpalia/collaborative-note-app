# 📝 Collaborative Notes - BLOQ QUANTUM

A modern, production-ready collaborative note-taking web application built with Next.js 14, NextUI, and TypeScript. Features real-time collaboration simulation via localStorage and comprehensive version history tracking.

## ✨ Features

### Core Functionality
- ✅ **Rich Text Editing**: Full-featured editor with TipTap including bold, italic, headings, lists, code blocks, and more
- ✅ **Notes Management**: Create, edit, and delete notes with a clean, intuitive interface
- ✅ **Version History**: Automatic version tracking with timestamps for each note
- ✅ **Version Restoration**: One-click restoration to any previous version
- ✅ **Real-time Collaboration Simulation**: Changes sync across browser tabs using localStorage
- ✅ **Responsive Design**: Beautiful, modern UI that works on all devices
- ✅ **Auto-save**: Debounced auto-save functionality for smooth user experience

### UI/UX
- ✅ **Modern Design**: Minimalistic interface using NextUI components
- ✅ **Dark Mode Support**: Theme toggle with persistence (light/dark)
- ✅ **Smooth Animations**: Transitions and hover effects for better UX
- ✅ **Performance Optimized**: Lazy loading, memoization, and efficient state management
- ✅ **Command Palette (Ctrl/Cmd+K)**: Search notes and run quick actions (Create Note, Toggle Theme)
- ✅ **Pinned Notes**: Pin/bookmark important notes; pinned appear first
- ✅ **Stats Bar**: Animated counters for Total Notes, Total Words, and Version Count
- ✅ **Presence Indicator**: See viewers on a note (local, cross‑tab heartbeat)
- ✅ **Export**: One‑click export to Markdown (.md) and PDF
- ✅ **Voice Notes (Beta)**: Dictate directly into the editor using the Web Speech API

### Technical Features
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **State Management**: Zustand for efficient, scalable state management
- ✅ **Local Storage**: Persistent data with cross-tab synchronization
- ✅ **Production Ready**: Optimized for deployment on Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BLOQ_QUANTUM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
BLOQ_QUANTUM/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (notes list)
│   ├── providers.tsx      # UI providers setup
│   ├── globals.css        # Global styles
│   └── notes/
│       └── [id]/
│           └── page.tsx   # Note editor page
├── components/            # Reusable UI components
│   ├── Navbar.tsx           # Navigation bar (Theme toggle + Command Palette mount)
│   ├── ThemeToggle.tsx      # Light/Dark toggle with persistence
│   ├── CommandPalette.tsx   # Ctrl/Cmd+K palette for search and actions
│   ├── StatsBar.tsx         # Animated counters (notes/words/versions)
│   ├── PresenceIndicator.tsx# Real-time viewers indicator
│   ├── PageHeader.tsx       # Reusable page header
│   ├── EmptyState.tsx       # Reusable empty state
│   ├── NoteCard.tsx         # Note list card with pin control
│   └── RichTextEditor.tsx   # TipTap editor (with Voice Notes button)
├── store/                # State management
│   └── noteStore.ts      # Zustand store for notes
├── utils/                # Utility functions
│   ├── debounce.ts       # Debounce helper
│   ├── extractTitle.ts   # Title extraction utility
│   └── formatTime.ts     # Time formatting utilities
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md            # Project documentation
```

## 🏗️ Architecture Overview

### State Management
The application uses **Zustand** for state management with localStorage persistence. The store handles:
- Notes CRUD operations
- Version history tracking
- Cross-tab synchronization
- Real-time collaboration simulation

### Collaboration System
Real-time collaboration is simulated using:
- **localStorage** for data persistence
- **Storage Events** for cross-tab synchronization
- **Custom Events** for same-tab updates
- Automatic version creation every 5 minutes

### Presence Indicator (How it works)
- Each note page writes a periodic heartbeat to localStorage.
- Tabs viewing the same note aggregate heartbeats and display a live viewer count.

### Rich Text Editor
**TipTap** provides a headless editor with:
- Extensible plugin system
- Markdown shortcuts
- Collaborative editing ready (can be extended with WebSockets)
- Full formatting support
 - Voice dictation button (🎙️) using the browser’s Web Speech API

### UI Components
**NextUI** provides:
- Consistent design system
- Accessibility built-in
- Dark mode support
- Responsive components

## 🎯 How It Works

### Version History
1. Versions are automatically created when:
   - A note is edited after 5 minutes since the last version
   - Manual restoration triggers a new version
2. Each version stores:
   - Full content snapshot
   - Title at the time
   - Precise timestamp
   - Unique version ID

### Export (Markdown/PDF)
- Open any note and click Export .md or Export PDF in the header.
- Markdown: client-side HTML → Markdown conversion.
- PDF: opens a print-styled tab and uses the browser’s Print to PDF.

### Command Palette
- Press Ctrl/Cmd+K.
- Search notes by title/content.
- Quick actions: Create Note, Toggle Theme.

### Pin/Bookmark Notes
- Click the 📌 on a note card.
- Pinned notes are sorted to the top of the grid.

### Stats Bar
- Visible on Home above the notes grid.
- Animated totals for notes, words, and version count.

### Voice Notes (Beta)
- Toolbar button: 🎙️ to start/stop.
- Requires a browser with Web Speech API (Chrome/Edge).
- If unsupported, a friendly fallback message appears.

### Collaboration Simulation
1. Open the app in multiple browser tabs
2. Edit a note in one tab
3. Changes automatically appear in other tabs
4. Version history syncs across all tabs

### Auto-save
- Changes are debounced (500ms delay)
- No manual save required
- Title auto-extracts from content
- Smooth typing experience

## 🔧 Configuration

### Environment Variables

Currently, no environment variables are required. The app works entirely client-side.

For future backend integration, you might add:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://ws.example.com
```

### Customization

- **Theme**: Modify `tailwind.config.js` and global CSS
- **Version Interval**: Change `5 * 60 * 1000` in `noteStore.ts`
- **Debounce Time**: Adjust delay in `utils/debounce.ts`

## 📊 Future Enhancements

### Planned Features
- [ ] Real WebSocket collaboration
- [ ] User authentication
- [ ] Shared notes with permissions
- [ ] Global search with filters and tags
- [ ] Tags and categories
- [ ] Mobile app (React Native)


## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety and developer experience |
| **NextUI** | UI component library |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | State management |
| **TipTap** | Rich text editing |
| **localStorage** | Data persistence |
| **Framer Motion** | Animations (via NextUI) |
| **Web Speech API** | Voice dictation |

## 📝 License

This project is part of the BLOQ QUANTUM assignment.

## 👨‍💻 Developer Notes

- All components are functional with hooks
- No class components used
- Modular, reusable code structure
- Comprehensive TypeScript types
- Performance optimized with debouncing and memoization
- Production-ready error handling

## 🤝 Contributing

This is an assignment project. For personal use or learning, feel free to fork and modify!

---
