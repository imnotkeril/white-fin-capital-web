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

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+
- npm 8+ or yarn 1.22+

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/white-fin-capital.git
cd white-fin-capital
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create `.env.local` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Service (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Payment Processing (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id

# Security
NEXTAUTH_SECRET=your-nextauth-secret
CSRF_SECRET=your-csrf-secret

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 4. Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run format       # Format code with Prettier
npm run lint:fix     # Fix ESLint errors
```

### Code Style & Guidelines

#### Component Structure
```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentProps } from '@/types';
import { cn } from '@/utils/helpers';

interface ExtendedProps extends ComponentProps {
  // Component-specific props
}

const ComponentName: React.FC<ExtendedProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {children}
    </div>
  );
};

export default ComponentName;
```

#### API Route Structure
```typescript
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Implementation
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
```

### Custom Hooks Usage

```typescript
// Form handling
const { values, errors, handleSubmit } = useForm({
  initialValues: { email: '' },
  validationRules: { email: { required: true, email: true } },
  onSubmit: async (data) => { /* submit logic */ },
});

// API calls
const { data, loading, error, execute } = useApi(apiFunction, {
  showErrorNotification: true,
  retryCount: 3,
});

// Theme management
const { theme, toggleTheme } = useTheme();
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--color-primary-500: #90bff9;    /* Light blue accent */
--color-primary-900: #05192c;    /* Dark blue */

/* Ocean Theme */
--color-ocean-400: #2dd4bf;      /* Ocean accent */
--color-ocean-500: #14b8a6;      /* Ocean primary */

/* Accent Colors */
--color-accent-red: #dc2626;     /* Subscribe buttons */
--color-accent-green: #059669;   /* Success states */
```

### Typography
- **Primary Font**: Inter (system fallback)
- **Headings**: 600-700 font weight
- **Body**: 400 font weight
- **Responsive sizing**: Scales down on mobile

### Components
- **Cards**: Glass morphism with subtle borders
- **Buttons**: Gradient effects with hover animations
- **Forms**: Floating labels with validation states
- **Charts**: Ocean-themed color scheme

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Lazy Loading**: Components and images load on demand
- **Caching**: API responses cached for optimal performance
- **Bundle Analysis**: Webpack bundle analyzer integration

### Performance Targets
- **First Contentful Paint**: < 2.5s
- **Largest Contentful Paint**: < 4s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 5s

## 🔒 Security

### Implemented Security Measures
- **Rate Limiting**: Contact forms and API endpoints
- **Input Sanitization**: All user inputs sanitized
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Content Security Policy headers
- **Data Validation**: Strict TypeScript types and runtime validation

### Security Headers
```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
1. Set up production environment variables
2. Configure payment processors (Stripe, PayPal)
3. Set up email service (SendGrid, AWS SES)
4. Configure analytics (Google Analytics)

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Deploy ./out folder
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Performance Monitoring
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics 4
- **Uptime Monitoring**: Custom health checks
- **Performance**: Web Vitals reporting

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards
- Follow TypeScript strict mode
- Use meaningful component and variable names
- Write self-documenting code
- Add comments for complex business logic
- Ensure responsive design on all components

### Testing Requirements
- Unit tests for utility functions
- Integration tests for API routes
- Component tests for critical user flows
- Accessibility testing with screen readers

## 📞 Support

### Contact Information
- **Email**: tech@whitefincapital.com
- **Issues**: [GitHub Issues](https://github.com/your-org/white-fin-capital/issues)
- **Documentation**: [Wiki](https://github.com/your-org/white-fin-capital/wiki)

### Troubleshooting

#### Common Issues
1. **Build Errors**: Check Node.js version (18+)
2. **API Failures**: Verify environment variables
3. **Styling Issues**: Clear `.next` cache and rebuild
4. **TypeScript Errors**: Run `npm run type-check`

#### Debug Mode
```bash
DEBUG=* npm run dev  # Enable debug logging
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core website functionality
- [x] Responsive design
- [x] Dark/light mode
- [x] Performance dashboard

### Phase 2 (Next)
- [ ] User authentication system
- [ ] Real-time trade alerts
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration

### Phase 3 (Future)
- [ ] API for third-party integrations
- [ ] White-label solutions
- [ ] Advanced portfolio management
- [ ] Machine learning insights

---

**White Fin Capital** - Where Deep Research Meets Financial Markets