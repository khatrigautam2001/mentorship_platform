# Mentorship Progress Tracker Platform - Design Guidelines

## Design Approach: Productivity-Focused System

**Selected Approach:** Modern productivity design system inspired by Linear, Notion, and Asana
**Rationale:** This is a utility-focused, data-intensive application requiring clarity, efficiency, and scalability. The design prioritizes information hierarchy, scannable layouts, and task-oriented workflows.

**Core Principles:**
- Information clarity over visual decoration
- Consistent patterns for rapid learning
- Efficient workflows with minimal friction
- Clear status communication throughout

---

## Typography Hierarchy

**Font Families:**
- Primary: Inter or SF Pro Display (web font via CDN)
- Monospace: JetBrains Mono (for numerical data, payments)

**Type Scale:**
- Page Titles: text-3xl font-bold (Mentor Dashboard, All Students)
- Section Headers: text-xl font-semibold (Pending Mock Requests, Payment Portfolio)
- Card/Item Titles: text-base font-medium
- Body Text: text-sm font-normal
- Metadata/Labels: text-xs font-medium uppercase tracking-wide
- Numbers/Stats: text-2xl font-bold (progress percentages, revenue)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** consistently
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4
- Page margins: px-6 py-8

**Container Strategy:**
- Dashboard layouts: max-w-7xl mx-auto
- Forms/modals: max-w-2xl
- Sidebar: fixed w-64
- Content area: Remaining space with proper padding

**Grid Patterns:**
- Stats cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Student list: Single column with full-width cards
- Skill items: Single column list view
- Payment table: Full-width responsive table

---

## Component Library

### Navigation & Layout

**Mentor Dashboard Sidebar:**
- Fixed left sidebar (w-64) with logo at top
- Navigation items: Overview, All Students, Pending Requests, Global Roadmap, Payments
- Active state: Subtle background fill with border-l-4 accent
- Icons from Heroicons (outline style)

**Mentee Dashboard Top Navigation:**
- Horizontal bar with logo left, profile/badge count right
- Progress bar showing overall completion percentage below header
- Sticky positioning during scroll

### Core Components

**Skill Card (Mentee View):**
- Clean card with skill icon and title
- Expandable accordion showing all items
- Each item shows: number, title, status badge (Locked/Current/Completed), action button
- Locked items: text-gray-400, no hover state, lock icon
- Current item: Highlighted background, "Mark as Complete" button
- Completed items: Checkmark icon, green text
- Mock Interview item: Distinct styling with interview icon, shows pending/approved status

**Student Progress Card (Mentor View):**
- Student avatar, name, contact info
- Large circular progress indicator (percentage)
- Current skill highlighted
- Quick action buttons: View Details, Edit Roadmap, Add Payment
- Badge count display

**Payment Entry Row:**
- Table row with: Student Name | Total Fee | Paid Amount | Remaining | Last Payment Date
- "Add Payment" button in-line
- Visual indicator for overdue/fully paid status

**Mock Interview Request Card:**
- Student info with avatar
- Skill name requesting completion
- Request timestamp
- Two prominent buttons: Approve (primary) / Reject (secondary)

**Badge Display:**
- Medal/shield icon with skill name
- Grid layout in profile: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Earned badges: Full opacity with glow effect
- Unearned badges: Grayscale, low opacity

### Forms & Modals

**Create Mentee Form:**
- Clean vertical form layout
- Fields: Name, Email, Phone, Total Fee, Initial Payment
- Auto-generate password shown in modal after creation
- Clear field labels with text-sm above inputs

**Add Payment Modal:**
- Student name header
- Current balance summary (Total, Paid, Remaining)
- Amount input field
- Date picker (default: today)
- Notes textarea
- Confirm button

**Roadmap Editor (Global/Individual):**
- Drag-and-drop skill reordering
- Each skill expandable showing items
- Inline editing for titles
- Add/Delete icons per item
- "Add Skill" and "Add Item" buttons clearly placed

### Data Visualization

**Progress Indicators:**
- Circular progress: Large (96px) for dashboard, small (48px) for lists
- Linear progress bar: Full-width with percentage label, use for overall progress
- Status badges: Small pills (px-2 py-1 rounded-full text-xs)

**Stats Dashboard (Overview Tab):**
- Four metric cards in grid
- Large number display with descriptive label below
- Icon representing each metric (users, revenue, pending, completion rate)

---

## Key UI Patterns

**Status Communication:**
- Locked: Lock icon + disabled state
- In Progress: Arrow/play icon + primary color
- Completed: Checkmark + success color
- Pending Approval: Clock icon + warning color
- Approved: Badge icon + success color

**Empty States:**
- Centered icon + heading + description
- Clear CTA button where applicable
- For "No pending requests": Celebration icon with positive messaging

**Tables (Responsive):**
- Desktop: Full table with all columns
- Mobile: Card-based layout showing key info, tap to expand
- Sortable headers with arrow indicators
- Alternating row backgrounds for readability

**Buttons:**
- Primary actions: Solid fill with medium font-weight
- Secondary actions: Outline style
- Destructive: Distinct styling for delete/reject
- Icon-only buttons: Square with hover background
- Size variants: sm for inline actions, md for forms, lg for CTAs

---

## Images

**Mentor Dashboard:**
- Small avatar images (40px × 40px) for student lists
- Larger profile image (120px × 120px) in student detail view

**Mentee Dashboard:**
- Profile header with editable avatar (96px × 96px)
- Badge icons: Vector illustrations/icons (64px × 64px)

**Empty States:**
- Illustration placeholders for empty skill lists, no pending requests
- Simple, friendly SVG illustrations

**No large hero image needed** - This is a dashboard application focused on functionality over marketing.

---

## Accessibility & Interaction

- All interactive elements have clear hover states (subtle background change)
- Focus rings on keyboard navigation
- Consistent button heights (h-10 for standard, h-8 for compact)
- Sufficient contrast ratios for all text
- Loading states for async actions (skeleton screens for lists, spinners for buttons)
- Toast notifications for success/error feedback (top-right positioning)