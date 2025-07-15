# White Fin Capital - Corporate Website

A modern, responsive corporate website for White Fin Capital, a financial research and analysis company. Built with Next.js, TypeScript, and Tailwind CSS, featuring dark/light mode, performance tracking, and subscription management.

## 🌟 Features

### Core Features
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: Elegant theme switching with system preference detection
- **Performance Dashboard**: Interactive charts and KPI tracking with real-time data
- **Team Showcase**: Professional team profiles with achievements and credentials
- **Subscription Management**: Multiple pricing tiers with payment integration
- **Contact System**: Advanced contact forms with spam protection and rate limiting

### Technical Features
- **Modern React Architecture**: Built with React 18+ and TypeScript
- **Modular Component System**: Reusable components following SOLID principles
- **API Integration**: RESTful APIs with proper error handling and validation
- **Performance Optimized**: Lazy loading, code splitting, and caching strategies
- **Security First**: CSRF protection, input sanitization, and rate limiting
- **SEO Optimized**: Meta tags, Open Graph, and semantic HTML structure

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation

### Backend & API
- **API Routes**: Next.js API routes
- **Validation**: Custom validation utilities with TypeScript
- **Security**: Rate limiting, CSRF protection, input sanitization
- **File Processing**: CSV parsing with Papaparse

### Development Tools
- **Build Tool**: Next.js with SWC
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Jest with React Testing Library
- **Type Checking**: TypeScript strict mode

## 📁 Project Structure

```
white-fin-capital/
├── public/                 # Static assets
│   ├── images/            # Images and logos
│   └── favicon.ico        # Favicon
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Reusable components
│   │   ├── sections/      # Page sections
│   │   ├── forms/         # Form components
│   │   └── charts/        # Chart components
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS files
│   ├── types/             # TypeScript types
│   ├── data/              # Mock data and constants
│   ├── App.tsx            # Main app component
│   └── index.tsx          # App entry point
├── pages/api/             # Next.js API routes
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
└── next.config.js         # Next.js config
```

---

**White Fin Capital** - Where Deep Research Meets Financial Markets