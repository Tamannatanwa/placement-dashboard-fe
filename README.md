# Placement Dashboard Frontend

A modern, feature-rich placement management platform built with Next.js. This application provides a comprehensive solution for students to discover jobs, manage applications, and track their placement journey, while offering administrators powerful tools for student management and monitoring.

**Live Demo**: [placement-dashboard-fe.vercel.app](https://placement-dashboard-fe.vercel.app)

## 🚀 Features

### For Students

- **📋 Job Discovery**: Browse and search through aggregated job listings from multiple sources
- **💾 Saved Jobs**: Save interesting jobs for later review
- **📊 Dashboard**: Personalized dashboard with job recommendations, saved jobs, and activity tracking
- **👤 Profile Management**: Multi-step profile wizard with comprehensive student information
- **📝 Applications Tracking**: Track your job applications and their status
- **🔍 Job Search & Filters**: Advanced filtering by location, salary, experience, and more
- **📈 Analytics**: View job view statistics and engagement metrics
- **🔔 Notifications**: Stay updated with placement-related notifications

### For Administrators

- **👥 Student Management**: Bulk upload students via Excel, filter by status, and manage student data
- **📄 Resume Review**: Review and score student resumes with detailed feedback
- **📊 Monitoring Dashboard**: Monitor system health, job aggregation status, and student activity
- **🎯 Group Assignment**: Assign students to groups for better organization
- **💬 Feedback System**: Add and manage feedback for individual students
- **📤 Data Export**: Export student data with updates to Excel format

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1.2](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Authentication**: [Clerk](https://clerk.com/) + [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Git** for version control

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/Tamannatanwa/placement-dashboard-fe.git
cd placement-dashboard-fe
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Clerk Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google OAuth (if using Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Other environment variables as needed
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server (requires build first)
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
placement-dashboard-fe/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (student)/          # Student routes
│   │   │   ├── applications/
│   │   │   ├── jobs/
│   │   │   │   ├── [id]/       # Job detail page
│   │   │   │   ├── saved/      # Saved jobs page
│   │   │   │   └── page.tsx     # Jobs listing page
│   │   │   └── profile/        # Profile management
│   │   ├── admin/              # Admin routes
│   │   │   ├── dashboard/
│   │   │   ├── monitoring/
│   │   │   ├── resume-review/
│   │   │   └── students/
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── auth/               # Authentication components
│   │   ├── jobs/               # Job-related components
│   │   ├── profile/            # Profile components
│   │   └── ui/                 # Reusable UI components (shadcn/ui)
│   ├── lib/                    # Utilities and helpers
│   │   ├── api/                # API client functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Form validation schemas
│   ├── stores/                 # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   └── public/                 # Static assets
├── API_DATA_MAPPING.md          # API data mapping documentation
├── API_REQUIREMENTS_SUMMARY.md  # API requirements summary
├── BACKEND_API_REQUIREMENTS.md  # Backend API documentation
├── GOOGLE_OAUTH_SETUP.md        # Google OAuth setup guide
├── STUDENT_MANAGEMENT_GUIDE.md   # Admin student management guide
└── package.json                 # Project dependencies
```

## 🔌 API Integration

This frontend application connects to a FastAPI backend. Ensure your backend is running and accessible at the URL specified in `NEXT_PUBLIC_API_BASE_URL`.

### Key API Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Jobs**: `/api/v1/jobs/*`
- **Students**: `/api/v1/students/*`
- **Admin**: `/api/v1/admin/*`
- **Saved Jobs**: `/api/v1/saved-jobs/*`

For detailed API documentation, refer to:
- [API Requirements Summary](./API_REQUIREMENTS_SUMMARY.md)
- [Backend API Requirements](./BACKEND_API_REQUIREMENTS.md)
- [API Data Mapping](./API_DATA_MAPPING.md)

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives. Components are located in `src/components/ui/` and can be customized as needed.

Key components include:
- Buttons, Cards, Dialogs
- Forms with validation
- Tables and Data displays
- Navigation and Layout components

## 🔐 Authentication

The application supports multiple authentication methods:

1. **Clerk Authentication** - Modern authentication platform
2. **Google OAuth** - Social login with Google

For Google OAuth setup, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🌙 Dark Mode

The application includes built-in dark mode support using `next-themes`. Users can toggle between light and dark themes.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

The application is optimized for Vercel's platform and includes automatic deployments on push to main branch.

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Configure build command as `npm run build` and publish directory as `.next`
- **AWS Amplify**: Follow Next.js deployment guide
- **Docker**: Create a Dockerfile and deploy to any container platform

## 📚 Additional Documentation

- [Student Management Guide](./STUDENT_MANAGEMENT_GUIDE.md) - Comprehensive guide for admin student management features
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) - Step-by-step Google OAuth configuration
- [API Requirements](./API_REQUIREMENTS_SUMMARY.md) - API endpoint documentation
- [Backend API Requirements](./BACKEND_API_REQUIREMENTS.md) - Detailed backend API specifications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Authors

- **Tamanna Tanwa** - [GitHub](https://github.com/Tamannatanwa)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn](https://twitter.com/shadcn) for the beautiful UI components
- [Vercel](https://vercel.com) for hosting and deployment platform

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---


