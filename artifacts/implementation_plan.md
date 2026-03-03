# Transform RankUp into a Full-Stack Gamified Testing Platform

This document outlines the strategy for expanding the current static UI into a functional Next.js App Router application with database, authentication, and an AI-driven testing engine.

## User Review Required

> [!IMPORTANT]
> **API Keys & Secrets**: To implement these features, we will need you to provide or configure several environment variables once the code is written (e.g., `MONGODB_URI`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`).
> 
> **Email Provider**: Do you prefer using **Nodemailer** (requires SMTP credentials) or **Resend** (requires a Resend API key) for the Contact page?

## Proposed Changes

### Dependencies
We will install the following key packages:
- `next-auth` for authentication.
- `mongoose` for MongoDB interaction.
- `openai` for generating questions.
- `framer-motion` for complex animations and transitions.
- `bcryptjs` for password hashing.
- `nodemailer` or `resend` for the contact form.

---

### Database Layer (MongoDB)
#### [NEW] `lib/mongodb.ts`
Connection utility to establish and cache the MongoDB connection.

#### [NEW] `models/User.ts`
Mongoose schema extending standard auth fields with gamification tracking: `xp`, `rank` (Enum: Bronze to Grandmaster), `matchesPlayed`, etc.

---

### API Routes
#### [NEW] `app/api/auth/[...nextauth]/route.ts`
NextAuth configuration supporting Credentials, Google, and Facebook. Connects to MongoDB to find/create users.

#### [NEW] `app/api/questions/route.ts`
Receives current difficulty level. Uses the `openai` SDK with a system prompt to generate a multiple-choice question tailored to that difficulty. Returns structured JSON.

#### [NEW] `app/api/test/submit/route.ts`
Receives test results, calculates XP changes, updates the User document in MongoDB, and evaluates if a rank promotion/demotion occurred.

#### [NEW] `app/api/contact/route.ts`
Receives form data and dispatches an email to the administrator.

---

### UI & Pages
#### [NEW] `app/test/page.tsx`
The core Adaptive Testing Engine.
- Uses `useReducer` to manage state (current question, answers, timer, score, difficulty level).
- Fetches new questions dynamically.
- Animated using Framer Motion.

#### [NEW] `app/about/page.tsx` & `app/reviews/page.tsx`
Static/Dynamic pages showcasing the global impact and user testimonials.

#### [NEW] `app/contact/page.tsx`
Form component that submits to the `/api/contact` endpoint.

#### [NEW] `app/leaderboard/page.tsx`
A dedicated leaderboard pulling sorted User data from MongoDB.

#### [MODIFY] [app/page.tsx](file:///c:/Users/Admin/OneDrive/Desktop/gametest/app/page.tsx) & [app/layout.tsx](file:///c:/Users/Admin/OneDrive/Desktop/gametest/app/layout.tsx)
- Extract Navbar and Footer into separate components (`components/Navbar.tsx`, `components/Footer.tsx`).
- Update Navbar to use NextAuth's `useSession` for Sign In / Sign Out and Profile access.

## Verification Plan
### Automated Tests
- Verify build success (`npm run build`).
- Verify linter checks via `next lint`.

### Manual Verification
- Test registration/login using credentials and OAuth.
- Start a test, verify questions are generated, verify difficulty scaling logic.
- Verify XP/Rank updates accurately persist to the database after test completion.
- Submit the contact form and check for successful response.
