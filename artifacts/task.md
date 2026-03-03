# RankUp Full-Stack Development Tasks

- [ ] **Phase 1: Foundation & Authentication**
  - [x] Install dependencies (`next-auth`, `mongoose`, `bcryptjs`, etc.)
  - [x] Set up MongoDB connection ([lib/mongodb.ts](file:///c:/Users/Admin/OneDrive/Desktop/gametest/lib/mongodb.ts))
  - [x] Create Mongoose schemas (User, TestSession)
  - [x] Configure NextAuth with Credentials, Google, and Facebook providers
  - [x] Extract Navbar and update it to show authentication state

- [ ] **Phase 2: Adaptive Testing Engine & Gamification**
  - [x] Install OpenAI SDK (`openai`)
  - [x] Create [/api/questions/route.ts](file:///c:/Users/Admin/OneDrive/Desktop/gametest/app/api/questions/route.ts) to generate adaptive questions via OpenAI
  - [x] Build the `/test` page with React state (timer, score, difficulty logic)
  - [x] Implement Framer Motion for question transitions and feedback
  - [x] Create [/api/test/submit/route.ts](file:///c:/Users/Admin/OneDrive/Desktop/gametest/app/api/test/submit/route.ts) to calculate XP, adjust Rank, and save to DB

- [ ] **Phase 3: Additional Pages & Polish**
  - [x] Build the dedicated Leaderboard page (`/leaderboard`) with pagination
  - [x] Create the About (`/about`) and Reviews (`/reviews`) pages
  - [x] Create the Contact page (`/contact`) with email integration (e.g., Nodemailer/Resend)
  - [x] Implement overall Framer Motion animations and "Bolt" logo implementation
