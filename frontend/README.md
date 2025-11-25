# Meta Growth Agent - Frontend

A modern React + TypeScript frontend for the Meta Growth Agent platform. This web application provides an intuitive interface for e-commerce business owners and micro agency marketers to analyze their Meta Ads performance and identify growth opportunities.

## Features

- 🚀 **Fast Analysis**: Get comprehensive competitor intelligence and growth recommendations in minutes
- 📊 **Interactive Dashboard**: Visualize traffic data, market gaps, and growth opportunities
- 🔐 **Secure Authentication**: JWT-based authentication with the FastAPI backend
- 🎨 **Modern UI**: Star Trek-inspired design with smooth animations and responsive layout
- 📱 **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see main README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Configure API URL in `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── components/          # React components
│   ├── AuthModal.tsx    # Authentication modal
│   ├── Background.tsx   # Animated background
│   ├── CompetitorSelect.tsx  # Competitor selection UI
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── Hero.tsx         # Landing page hero
│   ├── LoadingSequence.tsx  # Loading animations
│   ├── Logo.tsx         # Logo component
│   └── MetaConnect.tsx  # Meta Ads connection widget
├── services/            # API services
│   ├── api.ts          # Backend API client
│   ├── geminiService.ts # Gemini API (fallback)
│   └── trafficService.ts # Traffic API (fallback)
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
├── index.tsx           # Entry point
└── vite.config.ts      # Vite configuration
```

## API Integration

The frontend communicates with the FastAPI backend through the `api.ts` service layer. Key endpoints:

- `POST /auth/login` - User authentication
- `GET /reports/{account_id}` - Fetch analysis report
- `POST /reports/{account_id}/refresh` - Trigger new analysis
- `GET /alerts` - Get alert notifications
- `GET /health` - Health check

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_GEMINI_API_KEY` - Optional Gemini API key for fallback functionality

## Deployment

### Static Hosting

The built files in `dist/` can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

### Docker

You can also serve the frontend through the backend using FastAPI's static file serving, or use a reverse proxy like Nginx.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on multiple browsers before submitting

## License

See main project README for license information.
