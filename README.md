<div align="center">

<img src="https://img.shields.io/badge/Orbit%20AI-v2.0--final-5ffbd6?style=for-the-badge&logo=rocket&logoColor=white" alt="Orbit AI v2.0" />
<img src="https://img.shields.io/badge/Author-Krishna%20Kumar-7c3aed?style=for-the-badge&logo=github&logoColor=white" alt="Author" />
<img src="https://img.shields.io/badge/Powered%20by-Groq%20LLaMA%203.3%2070B-orange?style=for-the-badge&logo=meta&logoColor=white" alt="Groq AI" />
<img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />

# 🚀 Orbit AI — Celestial Career Intelligence Platform

**The most advanced AI-powered career navigation platform for the next generation of professionals.**  
Orbit AI analyzes your resume, identifies skill gaps, builds personalized learning roadmaps, generates interview questions, and visualizes your entire career universe — all in real time.

**🌐 Live Demo:** [orbit-ai-eta.vercel.app](https://orbit-ai-eta.vercel.app)

</div>

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 🤖 **AI Resume Analysis** | Upload your PDF resume and get instant ATS scoring, skill extraction, strengths & improvement areas |
| 🛣️ **Personalized Roadmap** | AI-generated step-by-step career learning path tailored to your target role |
| 📚 **Learning Resources** | Every roadmap step links to curated YouTube, Coursera, Udemy, GitHub & Docs resources |
| 🎯 **Interview Prep Mode** | 10 AI-generated personalized interview Q&As (Behavioral, Technical, Situational, Role-Specific) |
| 📉 **Skills Gap Analyzer** | Visual dashboard showing your skill level vs what top roles require |
| 🌌 **Career Orbit Tree** | 3-level interactive visualization of all career paths available to you |
| 📄 **Export PDF Report** | Download a beautifully branded Orbit AI career analysis report |
| 🚀 **Onboarding Flow** | Guided 3-step onboarding for first-time users |
| 💼 **Job Matching** | AI-curated job recommendations based on your resume profile |
| 🤖 **Career Tutor** | AI chatbot for career advice, resume tips, interview coaching |
| 💳 **Payments (Razorpay)** | Pro subscription with UPI, cards, and net banking support |
| 🔐 **Auth** | Email/password + Google OAuth sign-in |

---

## 🏗️ Tech Stack

### Frontend
| Tech | Usage |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **React Flow** | Career Orbit Tree visualization |
| **Framer Motion** | Animations |
| **Google OAuth** | Social login |

### Backend
| Tech | Usage |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database |
| **Groq API (LLaMA 3.3 70B)** | AI analysis engine — 14,400 free requests/day |
| **pdf-parse** | PDF text extraction |
| **JWT** | Authentication tokens |
| **Multer** | File upload handling |
| **Razorpay** | Payment processing |

### Infrastructure
| Tech | Usage |
|---|---|
| **Vercel** | Full-stack deployment (Frontend + Serverless API) |
| **MongoDB Atlas** | Cloud database |
| **GitHub** | Version control |

---

## 🔥 AI Features Deep Dive

### 🤖 Resume Analysis Engine
- Extracts skills, experience, and qualifications from any PDF resume
- Calculates **ATS (Applicant Tracking System) score** out of 100
- Identifies **strengths** and **improvement areas**
- Detects **missing skills** compared to target role requirements
- Suggests **career track matches** with percentage fit scores
- Powered by **Groq LLaMA 3.3 70B** via REST API

### 🛣️ Personalized Career Roadmap
- AI generates a multi-step learning roadmap based on your resume + target role
- Each step includes: title, description, difficulty level, estimated time
- Steps are categorized as: Completed / Active / Locked
- **LEARN button** opens a slide-in resource panel with:
  - YouTube tutorials
  - Coursera courses
  - Udemy courses
  - GitHub projects
  - Official documentation

### 🎯 Interview Prep Mode
- Generates **10 personalized interview questions** based on your resume & role
- Categories: Behavioral, Technical, Situational, Role-Specific
- Each question includes a **model answer** + **pro tips**
- Practice by writing your answer before revealing the AI response
- Filter questions by category, navigate with dot indicators

### 📉 Skills Gap Analyzer
- Visual bar chart comparing your skill levels vs role requirements
- Shows "✓ Met" or "+X% needed" for each skill
- Encourages users to fill gaps via learning resources

### 🌌 Career Orbit Tree
- Interactive ReactFlow visualization of career paths
- Shows neighboring roles, step-up positions, and long-term aspirations
- Click-to-explore nodes with role descriptions

### 📄 PDF Report Export
- One-click branded PDF report generation (no external libraries)
- Report includes: ATS Score, Skills, Strengths, Improvements, Skills Gap, Next Steps
- Works from both Resume Analyzer page and Roadmap page
- Uses browser print API — save as PDF in any format

---

## 📁 Project Structure

```
OrbitAllFullstack-v2/
├── api/
│   └── index.js                    # Vercel serverless entry point
├── vercel.json                     # Vercel config (60s function timeout)
├── OrbitAllFullstack-main/
│   ├── orbit-backend/
│   │   └── src/
│   │       ├── server.js           # Express app + test endpoints
│   │       ├── controllers/
│   │       │   ├── resumeController.js   # AI analysis, roadmap, interview prep
│   │       │   ├── authController.js     # JWT + Google OAuth
│   │       │   └── paymentController.js  # Razorpay integration
│   │       ├── routes/
│   │       │   ├── resumeRoutes.js
│   │       │   ├── authRoutes.js
│   │       │   └── paymentRoutes.js
│   │       ├── models/
│   │       │   ├── Resume.js
│   │       │   └── User.js
│   │       └── middleware/
│   │           └── authMiddleware.js
│   └── orbit-frontend-premium/
│       └── src/
│           ├── App.jsx             # Routes
│           ├── pages/
│           │   ├── Dashboard.jsx       # Main dashboard + skills gap
│           │   ├── ResumeAnalyzer.jsx  # Upload + analysis + PDF export
│           │   ├── Roadmap.jsx         # Learning roadmap + resources panel
│           │   ├── InterviewPrep.jsx   # AI interview Q&A
│           │   ├── CareerOrbit.jsx     # Career tree visualization
│           │   ├── Jobs.jsx            # Job matching
│           │   ├── ChatTutor.jsx       # AI career tutor
│           │   ├── Login.jsx           # Auth
│           │   └── Signup.jsx
│           ├── components/
│           │   ├── Layout.jsx          # Sidebar + navigation
│           │   ├── OnboardingFlow.jsx  # First-time user onboarding
│           │   ├── SkillsGapChart.jsx  # Skills comparison chart
│           │   └── PathSelection.jsx   # Career path selector
│           └── utils/
│               ├── api.js              # API endpoint config
│               └── exportPDF.js        # PDF report generator
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key ([console.groq.com](https://console.groq.com)) — **free, no billing needed**
- Razorpay test keys (optional, for payments)

### 1. Clone the repository
```bash
git clone https://github.com/Krishna77-ux/Orbit.AI.git
cd Orbit.AI
```

### 2. Backend setup
```bash
cd OrbitAllFullstack-main/orbit-backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_atlas_uri
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_key_optional
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd OrbitAllFullstack-main/orbit-frontend-premium
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## 🌐 Deployment (Vercel)

This project is configured for **full-stack Vercel deployment** — both frontend and backend run on a single Vercel project.

### Required Environment Variables in Vercel Dashboard:
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret for JWT tokens |
| `GROQ_API_KEY` | Groq API key (free at console.groq.com) |
| `GEMINI_API_KEY` | Google Gemini key (optional fallback) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `NODE_ENV` | `production` |

### Verify deployment:
```
GET https://your-app.vercel.app/api/test-gemini
→ {"status":"OK","provider":"Groq","model":"llama-3.3-70b-versatile"}
```

---

## 🔒 Security

- API keys are stored in environment variables only — never committed to git
- `.env` files are gitignored
- JWT tokens expire and are validated on every protected request
- File uploads limited to PDF only, max 10MB
- Multer error handling prevents malformed uploads

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/social-login` | Google OAuth login |
| `POST` | `/api/resume/upload` | Upload & analyze PDF resume |
| `GET` | `/api/resume/my-resumes` | Get user's resume data |
| `GET` | `/api/resume/roadmap` | Get personalized roadmap |
| `GET` | `/api/resume/interview-prep` | Get AI interview questions |
| `GET` | `/api/resume/jobs` | Get job matches |
| `GET` | `/api/resume/career-tree` | Get career tree data |
| `POST` | `/api/resume/tutor` | Chat with AI tutor |
| `POST` | `/api/resume/set-target-role` | Set career goal |
| `POST` | `/api/payment/create-checkout-session` | Create Razorpay order |
| `POST` | `/api/payment/verify-payment` | Verify payment |
| `GET` | `/api/payment/subscription` | Get subscription status |
| `GET` | `/api/test-gemini` | Health check for AI API |

---

## 👤 Author

**Krishna Kumar**  
Full-Stack Developer & AI Engineer

- 🐙 GitHub: [@Krishna77-ux](https://github.com/Krishna77-ux)
- 🌐 Project: [orbit-ai-eta.vercel.app](https://orbit-ai-eta.vercel.app)

---

## 📄 License

This project is proprietary software. All rights reserved © 2024 Krishna Kumar.

---

<div align="center">

Built with ❤️ by **Krishna Kumar** · Powered by **Groq AI** · Deployed on **Vercel**

⭐ Star this repo if you found it useful!

</div>
