# Funil - Landing Page and Registration System

## Overview
Funil is a video-based landing page application designed for lead generation through a multi-step funnel. It features video engagement tracking, user registration, and an administrative dashboard for analytics and management. The system aims to provide a robust platform for lead generation and analytics. The project has been migrated to use Supabase as the backend, making it a 100% frontend-only application compatible with Vercel.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18 with TypeScript, Vite, Tailwind CSS, React Router DOM v7, Lucide React, and Recharts for data visualization.
- **Page Structure**: Multi-page funnel including Landing, Registration, Confirmation, Admin Login, and Admin Dashboard.
- **State Management**: Component-level state using React hooks.
- **Design Rationale**: Single-page navigation for smooth transitions, separated admin routes for security, and TypeScript for type safety.
- **Data Visualization**: Interactive pie and bar charts with glassmorphism design, customizable palettes, and real-time filtering using Apache ECharts with `echarts-gl` for 3D visualizations.

### Backend Architecture
- **Technology Stack**: Supabase for database operations, replacing a previous Node.js/Express.js/SQLite backend.
- **API Structure**: Handled by Supabase services for authentication, analytics, and data management.
- **Authentication Mechanism**: Supabase native authentication.
- **Video Management**: Local video upload system for the admin dashboard, storing videos in the `public/videos/` directory and configuration in `videoConfig.json`, eliminating external dependencies like YouTube for video hosting.

### Data Storage
- **Database**: Supabase.
- **Schema Design**: Includes tables for `admins`, `visitors`, `registrations`, `events`, and `page_views`.
- **Data Persistence Strategy**: Visitor tracking via `localStorage`, session tracking via `sessionStorage`, and Supabase for historical analytics and registration data.
- **Supabase Setup**: Requires executing `supabase-schema.sql` and creating an admin user via `create-admin-supabase.js`.

### System Design Choices
- **Comprehensive Analytics**: Automatic visitor tracking, event tracking, page view analytics, and registration tracking with geolocation and device info, designed to be DNT (Do Not Track) compliant.
- **Admin Dashboard**: Secure administrative interface providing real-time statistics, visitor details, registration management, and event visualization with automatic data refresh every 10 seconds. Features include interactive 3D charts with configuration persistence.
- **Security Enhancements**: Focus on secure authentication (Supabase native) and robust data handling.
- **Mandatory Video Play**: Implemented a mandatory user interaction to start video playback, ensuring sound is enabled and content below the video is revealed only after play.

## External Dependencies

### Third-Party Services
- **Supabase**: Database, authentication, and backend services.
- **ipapi.co**: For geolocation data in analytics.

### Frontend Libraries
- **React Router DOM**: Client-side routing.
- **Lucide React**: Icon system.
- **Tailwind CSS**: Utility-first styling.
- **Apache ECharts**: Professional charting library.
- **echarts-gl**: 3D visualization extension for ECharts.
- **echarts-for-react**: React wrapper for ECharts.

### Environment Configuration
- `VITE_SUPABASE_URL`: URL of the Supabase project.
- `VITE_SUPABASE_ANON_KEY`: Anonymous key for Supabase.