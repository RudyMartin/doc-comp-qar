# Document Compliance Quality Assurance Reporter

A React TypeScript application for document compliance and quality assurance reporting.

## Features

- Document upload and management
- Compliance reporting
- Requirements checklist
- AI-powered document analysis
- Dashboard with metrics and analytics
- User authentication

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Router
- Lucide React Icons
- Recharts for data visualization

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Netlify Deployment

This project is configured for easy deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Build settings are automatically configured via `netlify.toml`
3. The app will be deployed automatically on each push to main branch

### Build Settings (Auto-configured)
- Build command: `npm run build`
- Publish directory: `build`
- Node version: 18

### Environment Variables

If you need to set environment variables for your deployment, add them in your Netlify dashboard under Site settings > Environment variables.

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── components/
│   └── ui/           # UI components (shadcn/ui)
├── styles/           # Global styles
└── public/           # Static assets
```

## License

MIT
