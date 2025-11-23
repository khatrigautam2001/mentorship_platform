# Mentorship Progress Tracker Platform

## Overview

This is a comprehensive mentorship management platform designed to facilitate structured learning between mentors and mentees. The system enables mentors to create and manage learning roadmaps, track student progress through sequential skill-based curricula, conduct mock interview assessments, and manage payment portfolios. Mentees progress through skills by completing items sequentially, with each skill culminating in a mentor-approved mock interview before advancement.

**Core Purpose**: Provide an honor-system based learning tracker where mentors guide students through structured roadmaps, approve skill completions via mock interviews, and maintain financial records.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Stack

**Frontend Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system inspired by Linear/Notion (productivity-focused)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter (lightweight client-side routing)
- **Form Handling**: React Hook Form with Zod validation

**Backend Framework**: Express.js (Node.js)
- **Language**: TypeScript with ESM modules
- **API Architecture**: RESTful endpoints organized by user role (mentor/mentee)
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)

**Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Connection**: Neon serverless driver with WebSocket support
- **Migrations**: Drizzle Kit for schema migrations

### Authentication & Authorization

**Authentication Strategy**: Session-based authentication with role-based access control
- Sessions stored in PostgreSQL using connect-pg-simple
- Password hashing with bcrypt (6.x)
- Two user roles: "mentor" and "mentee"

**Registration Flow**:
- **Mentors**: Self-registration with email/password
- **Mentees**: Created by mentors with auto-generated credentials (mentees cannot self-register)

**Authorization Middleware**:
- `requireAuth`: Validates session existence
- `requireMentor`: Restricts access to mentor-only routes
- `requireMentee`: Restricts access to mentee-only routes

### Data Model Architecture

**Core Entities**:

1. **Users Table**: Stores both mentors and mentees with role differentiation
   - Mentees reference their assigned mentor via `mentorId`
   - Includes profile data (name, email, phone, photo) and fee tracking (`totalFee`)
   - **plainPassword field**: Stores unencrypted mentee password for mentor access/login capability
   - Hashed password stored separately for authentication

2. **Skills Table**: Defines learning modules in the global roadmap
   - Ordered sequentially (`order` field)
   - Each skill has an associated badge icon

3. **Roadmap Items Table**: Individual learning units within skills
   - Linked to skills via `skillId` (cascade delete)
   - Sequential ordering within each skill
   - Special flag: `isMockInterview` marks skill completion gate

4. **Progress Table**: Tracks mentee completion status per roadmap item
   - Links mentees to specific items
   - Honors-based completion tracking (no video watch time)

5. **Mock Interview Requests Table**: Manages skill completion approval workflow
   - Status values: "pending", "approved", "rejected"
   - Links mentee to skill being evaluated

6. **Badges Table**: Awards issued after mock interview approval
   - One badge per skill upon mentor approval

7. **Payments Table**: Financial transaction records
   - Links to mentees for payment history tracking

8. **Individual Roadmap Items Table**: Mentor-customized roadmap overrides per mentee
   - Allows mentors to personalize learning paths for specific students

### Learning Flow Architecture

**Sequential Unlocking System**:
- All skill titles and item titles are **always visible** to mentees
- Only the first item of the first skill is initially unlocked
- Completion of current item unlocks the next item
- Items within a skill must be completed in order

**Mock Interview Gate Mechanism**:
- Last item of every skill is marked as "Mock Interview"
- When mentee marks mock interview complete, it triggers a request (doesn't auto-unlock next skill)
- Request appears in mentor dashboard for approval/rejection
- **Approval**: Skill marked 100% complete, badge awarded, next skill unlocked
- **Rejection**: Mentee must re-request when ready

**Progress Calculation**:
- Overall progress percentage calculated from completed items across all skills
- Badge count reflects approved mock interviews
- Current skill tracking shows active learning module

### Roadmap Management

**Global Roadmap** (affects all mentees):
- Mentors can add, edit, delete, and reorder skills
- Mentors can add, edit, delete, and reorder items within skills
- Changes propagate instantly to all mentees

**Individual Overrides**:
- Mentors can customize roadmaps per mentee
- Overrides stored in `individualRoadmapItems` table
- Allows personalized learning paths while maintaining global structure

### Payment Management

**Fee Structure**:
- Each mentee has a `totalFee` defined during account creation
- Initial payment recorded at mentee creation
- Subsequent payments tracked via `payments` table

**Payment Portfolio**:
- Aggregated view showing total fee, total paid, and remaining balance per mentee
- Last payment date tracking
- Payment notes for transaction context

### Design System Principles

**Visual Approach**: Productivity-focused design inspired by Linear, Notion, and Asana
- Prioritizes information clarity over decoration
- Consistent spacing primitives (2, 4, 6, 8 Tailwind units)
- Typography scale optimized for data-heavy interfaces

**Typography**:
- Primary font: Inter (web font)
- Monospace: JetBrains Mono (for numerical data)
- Hierarchical scale from page titles (text-3xl) to metadata (text-xs)

**Layout Strategy**:
- Dashboard containers: max-w-7xl
- Sidebar: fixed w-64
- Responsive grid patterns for stats and lists

### API Structure

**Authentication Routes** (`/api/auth/*`):
- `POST /register`: Mentor self-registration
- `POST /login`: Session-based login
- `GET /me`: Current user profile
- `POST /logout`: Session termination

**Mentor Routes** (`/api/mentor/*`):
- `GET /stats`: Dashboard statistics (total mentees, revenue, pending dues, avg completion)
- `GET /students`: List all mentees with progress metrics
- `POST /students`: Create new mentee with credentials
- `GET /payment-portfolio`: Aggregated payment status per mentee
- `POST /payments`: Record new payment
- `GET /mock-requests`: Pending mock interview requests
- `POST /mock-requests/:id/approve`: Approve skill completion
- `POST /mock-requests/:id/reject`: Reject skill completion
- `PATCH /profile`: Update mentor profile

**Mentee Routes** (`/api/mentee/*`):
- `GET /learning`: Current roadmap with progress and unlock status
- `POST /complete-item/:id`: Mark item as complete (triggers mock request if applicable)
- `GET /badges`: Earned badges and available skills
- `GET /profile`: Mentee profile with payment summary
- `PATCH /profile`: Update mentee profile

**Mentor Credential Management** (`/api/mentor/*`):
- `GET /students/:id/credentials`: Retrieve mentee email and plain password for login access
- When creating mentee: Password displayed once in success dialog with copy buttons
- Mentors can view stored credentials anytime from All Students page

**Roadmap Routes** (`/api/roadmap/*`):
- `GET /global`: Retrieve global roadmap (skills with items)
- `POST /skills`: Create new skill
- `DELETE /skills/:id`: Remove skill
- `POST /items`: Add item to skill
- `DELETE /items/:id`: Remove roadmap item

## External Dependencies

### Database & ORM
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe ORM with schema definitions in `shared/schema.ts`
- **Drizzle Kit**: Migration management tool

### UI Component Library
- **shadcn/ui**: Component collection built on Radix UI primitives
- **Radix UI**: Unstyled accessible component primitives (accordion, dialog, dropdown, popover, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching and optimistic updates
- **React Hook Form**: Form state management
- **Zod**: Schema validation for forms and API payloads

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across full stack
- **Replit Plugins**: Development banner, error overlay, and cartographer (dev environment only)

### Authentication & Security
- **bcrypt**: Password hashing (version 6.x)
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store

### Utilities
- **date-fns**: Date formatting and manipulation
- **clsx + tailwind-merge**: Conditional class name utilities
- **wouter**: Lightweight routing library
- **nanoid**: Unique ID generation (used for cache busting in dev mode)

### Font Delivery
- **Google Fonts CDN**: Inter and JetBrains Mono web fonts