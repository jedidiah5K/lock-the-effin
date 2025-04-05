# Lock The Eff In

A modern, productivity-first web application that combines notes, calendar, and money management in one unified platform.

## Features

### 🔖 Notes System (Notion-style)
- Block-Based Editor
- Tables & Databases
- Collaboration
- Organizing Pages

### 📅 Calendar System
- Add, edit, and view events/tasks
- Monthly/Weekly/Daily views
- Drag-to-reschedule and color-coded categories
- Events linked to Notes and expenses

### 💸 Money Management
- Track income/expenses
- Balance Calculator
- Spending Summary View with visualizations
- Calendar Sync

### 👤 Accounts & Syncing
- Sign Up / Login via Email or Google (OAuth)
- Real-time data syncing

### 🎨 Theming System
- Light/Dark Mode Toggle
- Theme Selector with presets and custom options

### 📈 Habit Tracker & Goal Lock
- Track habits with daily checkboxes
- Visual feedback with streak counters
- Lock in goals

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS
- State Management: Zustand
- Backend: Firebase
- Rich Editor: TipTap
- Drag & Drop: DnD Kit
- Charts: Chart.js

## Getting Started

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lock-the-effin.git
```

2. Navigate to the project directory
```bash
cd lock-the-effin
```

3. Install dependencies
```bash
npm install
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

This app is configured for deployment on GitHub Pages. To deploy your own instance:

1. Fork this repository
2. Update the `homepage` field in `package.json` with your GitHub username:
```json
"homepage": "https://yourusername.github.io/lock-the-effin"
```
3. Push your changes to GitHub
4. GitHub Actions will automatically build and deploy your app to GitHub Pages

Alternatively, you can manually deploy using:
```bash
npm run build
npm run deploy
```

For more detailed deployment options, including Firebase Hosting, Vercel, or Netlify, see the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Project Structure
- `/src`: Source code
  - `/components`: Reusable UI components
  - `/pages`: Main application pages
  - `/hooks`: Custom React hooks
  - `/store`: State management
  - `/services`: API and service functions
  - `/utils`: Utility functions
  - `/styles`: Global styles and Tailwind configuration
  - `/assets`: Images, icons, and other static assets
  - `/types`: TypeScript type definitions

## License
This project is licensed under the MIT License - see the LICENSE file for details.
