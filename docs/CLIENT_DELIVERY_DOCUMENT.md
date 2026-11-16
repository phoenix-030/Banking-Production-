# HHK Banking Exam Preparation Platform — Client Delivery & Handover Specification

**Document Version:** 1.0.0 (Production Release)  
**Classification:** Client Handover & System Architecture Specification  
**Application Title:** HHK Banking Exam Preparation Platform  
**Target Examinations:** IBPS PO, IBPS Clerk, IBPS RRB PO, IBPS RRB Clerk, SBI PO, SBI Clerk, RBI Assistant, RBI Grade B, NABARD, SIDBI, ECGC, and Specialist Officers  
**Technology Stack:** React 19 (Pure JSX SPA), Vite 8, Express 5, Node.js v24 (ES Modules), PostgreSQL 17/18, CSS3 Custom Tokens  

---

## Executive Summary

The **HHK Banking Exam Preparation Platform** is a full-stack, enterprise-grade educational technology system built specifically for Indian banking and financial recruitment examinations.

The platform provides an end-to-end digital infrastructure serving two distinct user personas:
1. **Aspirants (Students):** Real-time Computer Based Test (CBT) mock examinations, timed daily challenge sprints, canonical topic-wise practice drilling, performance analytics with weak-area diagnosis, bookmarked question notebooks, and live aspirant leaderboards.
2. **Platform Administrators & Content Directors:** Full lifecycle exam pattern configuration, canonical syllabus and question authoring with cascading topic/subtopic selectors, high-throughput CSV/Excel bulk ingestion with automated 20-question activation thresholds, blueprint-based test generation, role-based access governance, manual descriptive answer evaluation, and security audit logging.

```mermaid
flowchart TD
    subgraph Users ["User Personas"]
        Student["Banking Aspirant (Student)"]
        Admin["Platform Administrator / Content Director"]
    end

    subgraph ClientLayer ["Client Presentation Layer (React 19 + Vite)"]
        AppRoot["App.jsx (Security Coordinator & Lazy Loader)"]
        FeedbackSys["Feedback System (Toast / Alert / Modal)"]
        StudentSpace["Student Workspace (10 Integrated Views)"]
        AdminCenter["Admin Control Center (8 Dedicated Views)"]
    end

    subgraph APILayer ["Backend Application Layer (Express 5 + Node.js)"]
        AuthService["/api/auth (Session & Identity Engine)"]
        ContentService["/api (Syllabus, Catalog, Practice)"]
        AttemptService["/api (CBT Engine & Attempt Snapshots)"]
        AdminService["/api/admin (Questions, Tests, Roles, Audits)"]
    end

    subgraph DataLayer ["Data Persistence Layer (PostgreSQL 17/18)"]
        UserStore[("users, user_profiles, user_sessions")]
        ContentStore[("exams, stages, sections, topics, questions")]
        ExamStore[("mock_tests, test_sections, test_attempts")]
        AnalyticsStore[("student_answers, streaks, audit_logs")]
    end

    Student --> AppRoot
    Admin --> AppRoot
    AppRoot --> FeedbackSys
    AppRoot --> StudentSpace
    AppRoot --> AdminCenter

    StudentSpace --> AuthService & ContentService & AttemptService
    AdminCenter --> AdminService & AuthService & ContentService

    AuthService --> UserStore
    ContentService --> ContentStore
    AttemptService --> ExamStore & AnalyticsStore
    AdminService --> ContentStore & ExamStore & UserStore
```

---

## 1. System Architecture & Tech Stack

### 1.1 Architecture Tiers
- **Client Presentation Tier (`client/`)**: Pure JSX Single Page Application powered by React 19 and Vite. Utilizes component code-splitting (`React.lazy`, `Suspense`), responsive flexbox/grid styling without heavy UI library bloat, and Lucide React iconography.
- **API & Business Logic Tier (`server/`)**: Express 5 application running on Node.js ES Modules. Enforces session-based authentication (`connect-pg-simple`), Helmet security headers, CORS origin isolation, per-IP rate limiting (240 requests/min), request payload validation via Zod, and ACID transactions.
- **Data Persistence Tier (`server/db.js`)**: PostgreSQL 17/18 relational database with 31 relational tables. Includes composite B-Tree indexes, JSONB snapshotting for immutable student test evaluations, and automated audit logging.

### 1.2 Technology Directory

| Layer | Component | Version / Library | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.0.0` | Declarative UI rendering, hooks, and context |
| **Bundler & Dev Server**| Vite | `^8.3.5` | Fast HMR, module bundling, and asset minification |
| **Icons** | Lucide React | `^0.475.0` | Standardized iconography across student and admin views |
| **Backend Runtime** | Node.js | `v24.x LTS` | High-throughput asynchronous server runtime |
| **HTTP API Framework** | Express | `^5.0.0` | REST API routes, middleware pipeline, and error handling |
| **Database** | PostgreSQL | `17 / 18` | Relational storage, relational integrity, ACID transactions |
| **Connection Pooling** | `pg` / `pg-pool` | `^8.13.0` | Thread-safe connection pooling to PostgreSQL |
| **Session Engine** | `express-session` + `connect-pg-simple` | `^1.18.0` / `^10.0.0` | Server-side cookie sessions (`hhk.sid`) stored in DB |
| **Security Headers** | Helmet | `^8.0.0` | Content Security Policy, XSS filtering, frame protection |
| **Rate Limiter** | `express-rate-limit` | `^7.5.0` | API DDoS protection (240 requests / window) |
| **Schema Validation** | Zod | `^3.24.0` | Strict type validation for incoming API request payloads |
| **Password Hashing** | Bcrypt | Native | Salted password hashing (10 rounds) |
| **Spreadsheet Engine** | XLSX / PapaParse | Pure JS / Buffer | CSV and Excel multi-column question bank ingestion |

---

## 2. Canonical Banking Exam Syllabus & Hierarchy

The platform strictly organizes questions according to Indian banking recruitment standards across an unambiguous 6-tier hierarchy:

$$\text{Exam} \longrightarrow \text{Stage} \longrightarrow \text{Subject} \longrightarrow \text{Topic} \longrightarrow \text{Subtopic} \longrightarrow \text{Difficulty} \longrightarrow \text{Questions}$$

```mermaid
flowchart TD
    Exam["1. Banking Examination (e.g. IBPS PO, SBI Clerk, RBI Grade B)"]
    Exam --> Stage["2. Stage (Prelims, Mains, Phase I/II, Interview)"]
    
    Stage --> S1["3A. Quantitative Aptitude"]
    Stage --> S2["3B. Reasoning Ability"]
    Stage --> S3["3C. English Language"]
    Stage --> S4["3D. General Awareness"]
    Stage --> S5["3E. Banking & Financial Awareness"]
    Stage --> S6["3F. Computer Awareness"]

    S1 --> T1["Data Interpretation"]
    T1 --> ST1["Table DI, Bar Graph, Line Graph, Pie Chart, Caselet DI, Missing DI"]
    S1 --> T2["Arithmetic: Percentages, Profit & Loss, Time & Work, Speed & Distance, SI/CI..."]

    S2 --> T3["Puzzles & Seating"]
    T3 --> ST2["Box Puzzle, Floor/Flat, Day/Month, Linear Row, Circular In/Out, Triangular"]
    S2 --> T4["Analytical: Syllogism, Inequality, Coding-Decoding, Blood Relations..."]

    S3 --> T5["Grammar & Vocabulary"]
    T5 --> ST3["Tenses, Articles, Prepositions, Subject-Verb Agreement, Voice & Speech"]
    S3 --> T6["Comprehension: Reading Comprehension, Cloze Test, Para Jumbles..."]

    S4 --> T7["Current Affairs, RBI Updates, Union Budget, Economic Survey, Schemes..."]
    S5 --> T8["Monetary Policy, Basel Norms, NPA, Digital Banking, UPI/NEFT/RTGS, NPCI..."]
    S6 --> T9["Fundamentals, Networking, Cyber Security, DBMS, Cloud & AI..."]

    ST1 & ST2 & ST3 & T2 & T4 & T6 & T7 & T8 & T9 --> Diff["4. Difficulty: Easy (30%) · Medium (50%) · Hard (20%)"]
    Diff --> Q["5. Question Bank (MCQ, Passage Groups, Image, Numeric, Descriptive)"]
```

### The 6 Canonical Subjects & Key Topics

1. **Quantitative Aptitude / Numerical Ability**:
   - Number System, Simplification & Approximation, Percentage, Ratio & Proportion, Average, Profit & Loss, Simple Interest, Compound Interest, Time & Work, Pipes & Cisterns, Time Speed & Distance, Boats & Streams, Mixture & Alligation, Partnership, Problems on Ages, Probability, Permutation & Combination.
   - **Data Interpretation (Specialized Subtopics)**: Table DI, Bar Graph, Line Graph, Pie Chart, Caselet DI, Missing DI, Radar / Web DI.
2. **Reasoning Ability**:
   - **Puzzles (Subtopics)**: Box Puzzle, Floor & Flat Puzzle, Day / Month / Year Puzzle, Scheduling Puzzle.
   - **Seating Arrangement (Subtopics)**: Linear (Single/Double Row), Circular (Facing In/Out/Mixed), Square / Rectangular Seating, Triangular Seating.
   - Syllogism, Inequality, Coding-Decoding, Blood Relations, Direction & Distance, Order & Ranking, Alphanumeric Series, Number Series, Letter Series, Input-Output, Logical Reasoning, Statement & Conclusion, Statement & Assumption, Cause & Effect.
3. **English Language**:
   - Reading Comprehension, Cloze Test, Error Detection, Sentence Correction, Fill in the Blanks, Para Jumbles, Sentence Rearrangement, Phrase Replacement, Vocabulary, Synonyms & Antonyms, Idioms & Phrases.
   - **Grammar (Subtopics)**: Tenses, Articles, Prepositions, Subject-Verb Agreement, Active & Passive Voice, Direct & Indirect Speech.
4. **General Awareness / Current Affairs**:
   - Current Affairs (National & International), Banking Current Affairs, RBI Updates, Monetary Policy, Government Schemes, Union Budget, Economic Survey, Awards & Honours, Sports, Appointments, Books & Authors, Important Days, Countries & Capitals, Static GK.
5. **Banking & Financial Awareness**:
   - History of Banking in India, Types of Banks, Reserve Bank of India (RBI), SEBI, NABARD, SIDBI, EXIM, IRDAI, PFRDA, Monetary Policy Tools (Repo, Reverse Repo, CRR, SLR, MSF, Bank Rate), NPA Management, Basel III Norms, Financial Inclusion, Digital Banking (UPI, NEFT, RTGS, IMPS, NPCI), Negotiable Instruments & Cheques, Priority Sector Lending (PSL), KYC & AML Norms.
6. **Computer Awareness**:
   - Computer Fundamentals, Hardware & Software, Operating Systems, MS Office Suite, Internet & Protocols, Computer Networking (LAN/WAN/Topology), Cyber Security & Malware, Computer Abbreviations, DBMS Basics, Computer Memory, Cloud Computing, Artificial Intelligence, Digital Banking Security.

---

## 3. End-to-End System Flow Maps

### 3.1 Aspirant Authentication & Workspace Routing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Aspirant as Student / Admin Browser
    participant Client as React App (App.jsx)
    participant AuthAPI as Express Auth Router (/api/auth)
    participant DB as PostgreSQL Database

    Aspirant->>Client: Access Platform URL
    Client->>AuthAPI: GET /api/auth/me (Cookie: hhk.sid)
    
    alt Active Session Exists
        AuthAPI->>DB: Query user & profile details
        DB-->>AuthAPI: User record (id, role, full_name, target_exam)
        AuthAPI-->>Client: 200 OK { user: { role: 'admin' | 'student', ... } }
        alt user.role == 'admin'
            Client->>Aspirant: Render Administration Control Center
        else user.role == 'student'
            Client->>Aspirant: Render Student Preparation Workspace
        end
    else No Active Session
        AuthAPI-->>Client: 401 Unauthorized
        Client->>Aspirant: Render AuthPage (Login / Register / Password Reset)
        Aspirant->>Client: Submit Credentials (email + password)
        Client->>AuthAPI: POST /api/auth/login
        AuthAPI->>DB: Verify bcrypt password hash
        DB-->>AuthAPI: Credentials Match
        AuthAPI-->>Client: 200 OK + Set-Cookie: hhk.sid
        Client->>Aspirant: Transition to Role Workspace
    end
```

### 3.2 Question Authoring & 20-Question Auto-Activation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant UI as QuestionBankView.jsx
    participant API as /api/admin/questions
    participant DB as PostgreSQL
    participant MockGen as Auto-Mock Test Generator

    Admin->>UI: Select Exam (e.g. IBPS PO) & Stage (Prelims)
    Admin->>UI: Select Section (e.g. Reasoning Ability)
    Note over UI: Topic dropdown populates automatically<br/>from canonical syllabus (Puzzles, Syllogisms...)
    Admin->>UI: Select Topic (e.g. Puzzles)
    Note over UI: Subtopic dropdown automatically cascades<br/>(Box Puzzle, Floor/Flat...)
    Admin->>UI: Enter Question Text, Options A..D, Solution Explanation
    Admin->>UI: Click "Publish Question"
    UI->>API: POST /api/admin/questions { examId, sectionId, topic, subtopic, status: 'published' }
    API->>DB: INSERT INTO questions (...) RETURNING id
    API->>DB: SELECT count(*) FROM questions WHERE exam_id = $1 AND status = 'published'
    
    alt Total Published Questions >= 20
        API->>MockGen: Trigger Automatic Mock Test Synchronization
        MockGen->>DB: Auto-generate full mock test & link test_sections
        MockGen->>DB: UPDATE exams SET status = 'active'
        API-->>UI: 200 OK { message: "Question published. Exam automatically activated in Student Mock Tests!" }
        UI->>Admin: Green Toast: "Question published. 20+ questions reached — Mock Test Unlocked!"
    else Total Published Questions < 20
        API-->>UI: 200 OK { count: X, remaining: 20 - X }
        UI->>Admin: Green Toast: "Question published (X/20). Add more to unlock Mock Tests."
    end
```

### 3.3 Computer-Based Test (CBT) Mock Exam Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Aspirant
    participant Client as CBT Test Runner (MockTestView.jsx)
    participant Lock as examLock.js (BroadcastChannel)
    participant API as /api/tests/:id/attempt
    participant DB as PostgreSQL

    Student->>Client: Click "Start Mock Test"
    Client->>Lock: Broadcast 'EXAM_STARTED' to companion tabs
    Note over Lock: Other open tabs detect lock and immediately display<br/>"Companion Tab Locked" to prevent multi-screen cheating.
    Client->>API: POST /api/tests/:id/start
    API->>DB: Create test_attempts record (status: 'in_progress', started_at: now())
    API-->>Client: Return Questions (Options shuffled dynamically via secure seed)
    
    loop During Examination
        Student->>Client: Select option / Mark for Review / Save & Next
        Client->>Client: Update question palette color indicators
        Client->>API: PATCH /api/attempts/:id/sync (Heartbeat auto-save)
    end

    alt Student clicks "Submit Test" OR Section Timer Expires
        Client->>API: POST /api/attempts/:id/submit { answers: [...] }
        API->>DB: Evaluate answers against correct keys
        API->>DB: Compute total score, marks, negative deductions, accuracy & percentile
        API->>DB: Write immutable JSONB attempt snapshot
        API->>DB: Update student daily streak & achievements
        API-->>Client: 200 OK { attemptId, score, percentile, sectionalBreakdown }
        Client->>Lock: Broadcast 'EXAM_FINISHED' (Unlocks companion tabs)
        Client->>Student: Display Comprehensive Analytical Scorecard
    end
```

---

## 4. Screen-by-Screen Comprehensive Breakdown

### 4.1 Student Workspace (10 Integrated Views)

```
┌────────────────────────────────────────────────────────────────────────┐
│  HHK BANKING                   PREPARATION DASHBOARD         [Bell] [Help]  │
├──────────────┬─────────────────────────────────────────────────────────┤
│ Overview     │  TARGET: IBPS PO Prelims    Readiness Score: 78%       │
│ Daily sprint │  [ 12-Day Streak Active ]    Tests Completed: 14        │
│ Practice     ├─────────────────────────────────────────────────────────┤
│ Bookmarks    │  DAILY CHALLENGE                   MOCK EXAMS            │
│ Mock tests   │  10 Questions · 8 Minutes          IBPS PO Full Mock 01  │
│ Performance  │  [ Solve Today's Challenge ]       [ Start CBT Exam ]    │
│ Leaders      ├─────────────────────────────────────────────────────────┤
│ Achievements │  ACCURACY BY SUBJECT:                                   │
│ Profile      │  Quant: 84%  |  Reasoning: 92%  |  English: 71%         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

#### Screen S1: Overview & Dashboard
- **Header Summary Cards**: Target Exam banner (e.g. *IBPS PO 2026*), calculated exam readiness score (0–100%), total tests taken, and overall accuracy.
- **Daily Streak Ignition Card**: Dynamic streak widget indicating consecutive days of practice with fire indicators, questions solved today, and countdown to midnight reset.
- **Quick Test Launchers**: 1-click access to the Daily Challenge sprint and the latest published full-length mock test.
- **Subject Mastery Gauges**: Progress bars showing accuracy across the 3 core Prelims subjects: Quantitative Aptitude, Reasoning Ability, and English Language.

#### Screen S2: Daily Challenge Sprint
- **Purpose**: Rapid micro-practice simulating speed pressure (10 curated questions, 8-minute countdown).
- **Gamification Rewards**: Solving the daily challenge immediately increments the student's streak counter and awards leaderboard points.
- **Instant Solution Review**: Once submitted, provides question-by-question explanations, time spent per question, and comparison with the platform average.

#### Screen S3: Topic-wise & Subject-wise Practice
- **Three-Tier Filtering**: Filter questions by **Subject** (e.g. *Quantitative Aptitude*) $\rightarrow$ **Topic** (e.g. *Data Interpretation*) $\rightarrow$ **Subtopic** (e.g. *Missing DI*).
- **Difficulty Selection**: Switch between *Easy*, *Medium*, and *Hard* problem sets.
- **Untimed Learning Mode**: Provides immediate feedback upon selecting an answer with full step-by-step mathematical or logical derivations.

#### Screen S4: Full-Length & Sectional Mock Tests (CBT Simulator)
- **Exam Pattern Conformity**: Exact replica of real IBPS/SBI interfaces including:
  - Header with Candidate Name, Exam Title, and Sectional Countdown Timer.
  - Section Switcher Tabs (*English Language*, *Quantitative Aptitude*, *Reasoning Ability*).
  - Question Palette with 5 standard color states:
    - ⚪ White: Not visited
    - 🔴 Red: Visited but not answered
    - 🟢 Green: Answered
    - 🟣 Purple: Marked for review
    - 🟣+🟢 Purple with green dot: Answered & marked for review
  - Action Controls: `Save & Next`, `Clear Response`, `Mark for Review`, and `Submit Test`.

#### Screen S5: Mock Test Scorecard & Analytics
- **Executive Metrics**: Total Score, Maximum Marks, Net Accuracy percentage, Negative Marks deducted, and All-India Rank / Percentile.
- **Sectional Diagnostics Table**: Breakdown of Marks Scored, Cutoff Marks, Questions Attempted vs Unattempted, and Total Time Expended per section.
- **Comprehensive Solution Key**: Complete question review showing the student's chosen option, the verified correct option, time spent, and full explanatory notes.

#### Screen S6: Question Bookmarks & Error Notebook
- **Categorization**: Filters questions by *Starred Bookmarks* and *Incorrect Answers*.
- **Filter by Exam & Subject**: Filter mistakes made specifically in *IBPS PO* or *SBI Clerk*.
- **Retest Mode**: Re-attempt previously failed questions without looking at the solutions to measure retention and improvement.

#### Screen S7: Performance Analytics & Radar Diagnostics
- **Pacing Analysis**: Categorizes answered questions into *Speedy Correct*, *Overtime Correct*, and *Costly Mistakes*.
- **Weakness Heatmap**: Pinpoints specific syllabus topics where accuracy drops below 60% (e.g., *Probability* or *Floor Puzzles*).
- **Historical Trajectory**: Line graphs charting accuracy and score trends over the last 30 days.

#### Screen S8: Live Leaderboard & Aspirant Rankings
- **Rankings Hierarchy**: Overall Platform Rank, Exam-Specific Rank, and Weekly Streak Leaders.
- **User Rank Highlight**: Clearly highlights the logged-in student's position, points, tests taken, and percentile bracket.

#### Screen S9: Achievements & Milestones
- **Badges Unlocked**: Visual achievement badges (e.g., *Syllogism Master*, *Speed Demon*, *7-Day Streak*, *Mock Centurion*).
- **Milestone Progress**: Track completion percentage towards advanced preparation tiers.

#### Screen S10: Profile & Target Exam Settings
- **Personal Details**: Full Name, Email, Mobile Number, and Registration Date.
- **Target Exam Configuration**: Dropdown selector allowing students to switch their primary preparation focus, which recalibrates dashboard recommendations and practice feeds.

---

### 4.2 Administrator Control Center (8 Dedicated Views)

```
┌────────────────────────────────────────────────────────────────────────┐
│  HHK ADMIN                     ROLE & ACCESS MANAGEMENT     [Bell] [Help]  │
├──────────────┬─────────────────────────────────────────────────────────┤
│ Dashboard    │  Total Users: 142    Admins: 3    Active Accounts: 138 │
│ Exam setup   │  Students: 139       Disabled: 4   Search: [ Harish... ]│
│ Question bank├─────────────────────────────────────────────────────────┤
│ Mock tests   │  USER & ROLE GOVERNANCE TABLE                           │
│ Roles & users│  User Name      Email           Role       Status Action │
│ Reports      │  HHK Admin      admin@hhk.com   Admin      Active [You]  │
│ Activity logs│  Harish K       harish@test.com Student v  Active [Disable│
└──────────────┴─────────────────────────────────────────────────────────┘
```

#### Screen A1: Admin Dashboard & Overview KPIs
- **Top Metric Cards**: Total Exams Configured, Total Registered Questions, Total Student Aspirants, Mock Tests Created, Tests Taken, and Import Validation Success Rate.
- **Difficulty Balance Chart**: Real-time breakdown of the question bank across *Easy*, *Medium*, and *Hard* tiers.
- **Recent System Activity Feed**: Live audit stream tracking recent logins, test creations, question edits, and role modifications.

#### Screen A2: Exam Setup & Stage Configuration
- **Hierarchical Configurator**: Create or modify exams (e.g. *IBPS PO*, *SBI Clerk*), stages (*Prelims*, *Mains*), and sections (*Quant*, *Reasoning*, *English*).
- **Pattern Controls**: Set total questions per section, duration in seconds, marks per correct answer ($+1.0$ or $+2.0$), negative marking penalty ($-0.25$ or $-0.50$), and sectional timing constraints.
- **Publish Status**: Toggle between *Draft* and *Active* statuses.

#### Screen A3: Question Bank & Content Authoring
- **Canonical Dropdown Cascade**:
  - Step 1: Select Exam $\rightarrow$ Step 2: Select Stage $\rightarrow$ Step 3: Select Section.
  - Step 4: **Topic Dropdown** automatically loads all standard banking syllabus topics for that section.
  - Step 5: **Subtopic Dropdown** automatically cascades when topics with subtopics (e.g. *Data Interpretation* or *Puzzles*) are selected.
- **Question Types**: Multiple Choice (4 or 5 options), Passage Group Comprehension, Image/Diagram-based, Numeric Response, and Descriptive Written Response.
- **Threshold Progress Indicator**: Real-time counter showing `X / 20` published questions, with automatic notification when student mock tests are unlocked.

#### Screen A4: Bulk CSV / Excel Question Importer
- **File Ingestion**: Accepts `.csv` and `.xlsx` uploads up to 8MB.
- **Batch Validation**: Validates all rows against supported `exam_code`, valid stage names, difficulty formats, and option distributions.
- **Validation Results Summary**: Detailed counts of *Total Rows*, *Valid Rows*, *Failed Rows*, and *Duplicate Rows*.
- **20-Question Minimum Safeguard**: Prohibits publishing malformed batches under 20 questions, ensuring mock test generation integrity.

#### Screen A5: Mock Test Builder & Blueprint Engine
- **Test Modes**:
  - *Rule-Based Auto-Generation*: Define difficulty distribution quotas (e.g., 30% Easy, 50% Medium, 20% Hard) and topic percentages; the system automatically samples matching questions.
  - *Manual Curation*: Hand-pick specific questions from the bank for custom assessments.
- **Scheduling Controls**: Set optional availability start and end dates/times for synchronized All-India Live Mock Tests.

#### Screen A6: Role Management & Access Governance
- **Account Summary Cards**: Total Platform Accounts, Total Administrators, Total Students, Active Accounts, and Suspended Accounts.
- **Search & Filters**: Instant multi-attribute search (Name, Email, Mobile) with filtering by Role (*Admin* / *Student*) and Status (*Active* / *Disabled*).
- **Interactive Role Promotion/Demotion**: 1-click role dropdown with confirmation modal and self-protection guardrails preventing admins from demoting themselves.
- **Account Suspension Toggle**: 1-click Enable/Disable action with immediate feedback.

#### Screen A7: Student Attempt Reports & Descriptive Answer Evaluation
- **Attempt Explorer**: Inspect detailed audit logs of all student test attempts including raw score, completion timestamp, and IP address.
- **Descriptive Evaluation Workbench**: Interface for human graders to evaluate subjective written essays and letters (e.g. for SBI/IBPS PO Mains) against a rubric.

#### Screen A8: Security Audit & Activity Logs
- **Immutable Audit Trail**: Chronological log of administrative actions (`user.role_change`, `user.disable`, `question.create`, `test.publish`).
- **Forensic Information**: Displays Actor ID, Target Entity, Action Type, JSON metadata differences, timestamp, and client IP address.

---

## 5. Unified Feedback & Notification System

To prevent confusing browser popups (`window.confirm` / `alert`), the platform incorporates a three-tiered feedback engine:

```mermaid
flowchart LR
    Event["User Action or System Event"] --> Decision{"Requires User Decision?"}
    
    Decision -- "No, Quick Status Confirmation" --> Toast["1. TOAST (Top-Right)
    • Non-blocking
    • Auto-dismisses in 3.8s
    • Green/Red/Amber/Blue
    • e.g. 'Role updated to Admin'"]
    
    Decision -- "No, Critical Notice / Warning" --> Alert["2. ALERT (Center Banner)
    • Non-blocking
    • Stays until [X] dismissed
    • Warm Amber / Cream Card
    • e.g. 'Exam in Draft Status'"]
    
    Decision -- "Yes, Confirmation Required" --> Modal["3. MODAL (Centered Overlay)
    • Screen-blocking Backdrop
    • Top Circular Icon Badge
    • Title, Message & 2 Buttons
    • [Cancel] vs [Confirm]"]
```

### Feedback Tiers Specification

1. **Toast Notification (`<ToastContainer />`)**:
   - **Placement**: Top-right corner (`top: 24px; right: 24px;`).
   - **Behavior**: Non-blocking; automatically fades out after 3.8 seconds; dismissible via `[X]`.
   - **Variants**:
     - `toast-success`: Green background (`#15803d`), checkmark icon (`✓`), white text. Used for successful saves, question publications, and role updates.
     - `toast-error`: Red background (`#b91c1c`), alert circle icon (`✕`). Used for validation errors and security violations.
     - `toast-info`: Slate card with blue accent (`#3b82f6`). Used for informational notices.
2. **Alert Banner (`<AlertContainer />`)**:
   - **Placement**: Floating top-center banner (`width: min(520px, 100vw - 32px)`).
   - **Behavior**: Non-blocking; stays permanently visible until the user manually clicks `[X]`.
   - **Visuals**: Warm amber background (`#fffbeb`), amber border (`#fde68a`), prominent `⚠️` badge (`#fef3c7`), bold title (`#92400e`), and detail text (`#78350f`).
   - **Best For**: Important platform warnings (e.g., *"Exam in draft mode: 20+ questions required to publish"*).
3. **Modal Dialog (`<ConfirmModal />`)**:
   - **Placement**: Fixed center overlay with dimmed, blurred backdrop (`rgba(15, 23, 42, 0.65)`, `backdrop-filter: blur(4px)`).
   - **Behavior**: Screen-blocking; traps focus; cancellable via `Esc` or outside-click; requires explicit user action.
   - **Visuals**: 440px rounded card (`#ffffff`), top circular icon badge (e.g. purple shield for role promotion, red trash for question archiving), bold title, explanatory text, and side-by-side `[Cancel]` and `[Confirm]` buttons.

---

## 6. Database Architecture & Data Dictionary

The database is built on **PostgreSQL 17/18** using relational integrity constraints, foreign keys with cascading options, and specialized indexes.

```mermaid
erDiagram
    USERS ||--o{ USER_PROFILES : has
    USERS ||--o{ USER_SESSIONS : maintains
    USERS ||--o{ TEST_ATTEMPTS : attempts
    USERS ||--o{ AUDIT_LOGS : performs

    EXAMS ||--|{ STAGES : contains
    STAGES ||--|{ SECTIONS : divides
    SECTIONS ||--o{ QUESTIONS : organizes
    QUESTIONS ||--o{ PASSAGE_GROUPS : references

    MOCK_TESTS ||--|{ TEST_SECTIONS : configures
    TEST_SECTIONS ||--o{ TEST_SECTION_QUESTIONS : includes
    MOCK_TESTS ||--o{ TEST_ATTEMPTS : instantiated_by
    TEST_ATTEMPTS ||--|{ STUDENT_ANSWERS : records
```

### Core Relational Tables

#### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identity |
| `email` | TEXT | UNIQUE, NOT NULL | Login email address |
| `password_hash` | TEXT | NOT NULL | Bcrypt salted hash (10 rounds) |
| `full_name` | TEXT | NOT NULL | User's legal name |
| `mobile` | TEXT | NOT NULL DEFAULT '' | Aspirant contact phone number |
| `role` | TEXT | NOT NULL DEFAULT 'student' | Access role: `'student'` or `'admin'` |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE | Login authorization toggle |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Registration timestamp |

#### 2. `questions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique question identifier |
| `section_id` | UUID | REFERENCES sections(id) ON DELETE CASCADE | Associated exam section |
| `topic_name` | TEXT | NOT NULL | Canonical banking syllabus topic |
| `subtopic_name` | TEXT | NOT NULL DEFAULT '' | Granular subtopic (e.g. 'Table DI', 'Box Puzzle') |
| `difficulty` | TEXT | NOT NULL CHECK (difficulty IN ('easy','medium','hard')) | Cognitive difficulty tier |
| `question_type` | TEXT | NOT NULL DEFAULT 'mcq' | `'mcq'`, `'passage'`, `'image'`, `'numeric'`, `'descriptive'` |
| `question_text` | TEXT | NOT NULL | Full problem statement |
| `options` | JSONB | NOT NULL DEFAULT '[]' | Array of option strings (A, B, C, D, E) |
| `correct_answer` | TEXT | NOT NULL | Correct option key (`'A'`, `'B'`, `'C'`, etc.) |
| `explanation` | TEXT | NOT NULL DEFAULT '' | Detailed solution derivation |
| `marks` | NUMERIC(5,2)| NOT NULL DEFAULT 1.00 | Positive score for correct answer |
| `negative_marks`| NUMERIC(5,2)| NOT NULL DEFAULT 0.25 | Penalty deduction for wrong answer |
| `status` | TEXT | NOT NULL DEFAULT 'draft' | `'draft'`, `'published'`, or `'archived'` |

#### 3. `test_attempts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique attempt record |
| `user_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | Taking student |
| `mock_test_id` | UUID | REFERENCES mock_tests(id) ON DELETE CASCADE| Instantiated mock test |
| `status` | TEXT | NOT NULL DEFAULT 'in_progress' | `'in_progress'`, `'submitted'`, `'evaluated'` |
| `score` | NUMERIC(6,2)| NOT NULL DEFAULT 0.00 | Final calculated score |
| `percentile` | NUMERIC(5,2)| NULL | Dynamic cohort percentile rank |
| `time_spent_seconds`| INTEGER | NOT NULL DEFAULT 0 | Cumulative exam time expended |
| `attempt_snapshot`| JSONB | NULL | Immutable copy of questions & evaluation state |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Attempt initiation timestamp |

---

## 7. RESTful API Specification

All endpoints are hosted under `/api`. Sessions are verified via secure, HTTP-only cookies (`hhk.sid`).

### 7.1 Authentication & Profile (`/api/auth`)
- `POST /api/auth/register`: Register new student account (`fullName`, `email`, `password`, `mobile`).
- `POST /api/auth/login`: Authenticate credentials and establish encrypted session.
- `GET /api/auth/me`: Validate existing cookie and return authenticated user profile.
- `POST /api/auth/logout`: Destroy active session in PostgreSQL and clear client cookie.
- `PATCH /api/auth/target-exam`: Persist target examination choice to aspirant profile.

### 7.2 Syllabus, Content & Practice (`/api`)
- `GET /api/syllabus`: Returns the complete 6-subject canonical banking syllabus hierarchy.
- `GET /api/exams`: Lists all active banking examinations, stages, and sections.
- `GET /api/practice/catalog`: Returns structured catalog of published topics for drilling.
- `POST /api/practice/start`: Initializes a topic-wise practice session.
- `POST /api/practice/submit`: Evaluates a practice question and updates accuracy metrics.
- `GET /api/daily-challenge`: Retrieves today's 10-question sprint challenge.

### 7.3 Mock Test Taking & CBT Simulator (`/api`)
- `GET /api/tests`: Returns published full-length and sectional mock tests for student's target exam.
- `POST /api/tests/:id/attempt`: Initializes a new CBT test attempt and returns randomized questions.
- `PATCH /api/attempts/:id/sync`: Periodic background heartbeat syncing current answer state.
- `POST /api/attempts/:id/submit`: Finalizes exam submission, calculates scores, and returns results.
- `GET /api/attempts/:id/results`: Returns full analytical scorecard, section metrics, and solution key.

### 7.4 Administration & Governance (`/api/admin`)
- `GET /api/admin/overview`: Provides KPI totals (Exams, Questions, Students, Mock Tests, Imports).
- `GET /api/admin/users`: Search and filter platform accounts with summary metrics.
- `PATCH /api/admin/users/:id/role`: Promote/demote an account with self-protection safeguards.
- `PATCH /api/admin/users/:id/status`: Suspend or enable user account access.
- `POST /api/admin/questions`: Author and publish a question with cascading topic/subtopic validation.
- `POST /api/admin/questions/import/validate`: Upload and dry-run validate CSV/Excel question batches.
- `POST /api/admin/questions/import/:batchId/confirm`: Commit and publish verified question batches.
- `POST /api/admin/tests`: Create a rule-based or curated mock test blueprint.
- `GET /api/admin/reports/attempts`: View audit trail of student test attempts across all exams.
- `GET /api/admin/audit-logs`: View immutable administrative security and modification logs.

---

## 8. Security, Compliance & Proctoring Safeguards

1. **Single-Tab Exam Lockdown**:
   - Leverages HTML5 `BroadcastChannel` (`hhk_exam_lock_channel`).
   - Starting a test locks all other companion tabs across the aspirant's browser, preventing multi-window cheating or parallel search lookups.
2. **Immutable Test Attempt Snapshots**:
   - Once submitted, student test attempts are serialized into an immutable JSONB document stored directly in the `test_attempts` table.
   - Future updates to questions or answer keys do not tamper with historically awarded scores.
3. **Role Management Self-Protection**:
   - Both API middleware and UI components enforce that an administrator cannot demote their own account to `student` or disable their own account, preventing irreversible system lockouts.
4. **Dynamic Option Shuffling**:
   - During mock test attempts, options ($A, B, C, D$) are mathematically randomized per student session while preserving the underlying correct answer key.
5. **Anti-DDoS & Rate Limiting**:
   - Express rate limiters protect the API from credential brute-forcing and scraping attacks (240 requests/minute per client IP).

---

## 9. Verification & Automated Test Suites

The platform includes 3 automated test suites verifying all core business workflows:

```bash
# Run the complete test suite
npm test
```

### Verification Coverage
1. **Workflow Verification (`tests/verify_workflow.js`)**:
   - Verifies master exam category registries.
   - Validates PostgreSQL database connectivity and 19 standard banking exams.
   - Tests the **20-question auto-activation threshold**: Confirms that draft exams stay hidden until 20 questions are published, and automatically activate when 20 is reached.
   - Tests dynamic option shuffling.
   - Confirms automatic rollback of test data with zero database pollution.
2. **Syllabus & Topic Hierarchy Verification (`tests/verify_syllabus_and_topics.js`)**:
   - Verifies all 6 canonical banking subjects.
   - Tests section name normalization and subject mapping.
   - Validates Data Interpretation and Puzzles subtopics.
   - Confirms `subtopic_name` schema existence and question relational insertion.
3. **Role Management Verification (`tests/verify_role_management.js`)**:
   - Validates promotion of user from `student` to `admin`.
   - Validates demotion of user from `admin` to `student`.
   - Validates account suspension (disable) and re-activation (enable).
   - Verifies KPI summary aggregates (`total_users`, `total_admins`, `total_students`, `total_active`, `total_disabled`).

---

## 10. Deployment & Maintenance Guide

### 10.1 Environment Configuration (`.env`)

```ini
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hhk_banking
SESSION_SECRET=enterprise_banking_exam_platform_super_secret_session_key_2026_xyz
NODE_ENV=production
```

### 10.2 Production Build & Startup

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
npm run migrate

# 3. Build optimized frontend production bundle
npm run build

# 4. Start production server
npm start
```

### 10.3 Development Startup

```bash
# Concurrently runs Express API (port 3001) and Vite Client (port 5173)
npm run dev
```

---

*Document compiled and verified for production handover to the Client Technical & Operational Management Team.*
