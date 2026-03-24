# Orbit AI - Full Stack Application

A comprehensive full-stack application combining AI-powered features with modern web technologies. Orbit AI helps users with resume analysis, career roadmaps, job matching, and AI-powered tutoring.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Resume Analyzer**: AI-powered resume analysis and optimization suggestions
- **Chat Tutor**: Interactive AI tutoring for career and technical guidance
- **Job Listings**: Browse and match jobs based on profile
- **Career Roadmap**: Personalized learning paths and skill development tracking
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Modern Animations**: Smooth animations with Framer Motion

## 📁 Project Structure

```
Orbit-AI-Fullstack/
├── orbit-backend/
│   ├── src/
│   │   ├── server.js           # Express server entry point
│   │   ├── config/
│   │   │   └── db.js          # Database configuration
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database models (MongoDB)
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Authentication & custom middleware
│   │   └── ai/                 # AI integration modules
│   └── package.json
│
├── orbit-frontend-premium/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main app component
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context (Auth)
│   │   └── index.css          # Global styles
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── vite.config.js         # Vite build config
│   └── package.json
│
└── package.json (root)
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **AI Integration**: OpenAI API (ready to integrate)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **State Management**: React Context API

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd orbit-backend
npm install
```

Create a `.env` file in `orbit-backend/`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd orbit-frontend-premium
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173/`

## 🚀 Deployment

### Backend Deployment Options
- Heroku
- Railway
- AWS (EC2, Lambda, Elastic Beanstalk)
- DigitalOcean
- Render

### Frontend Deployment Options
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Resume
- `GET /api/resume` - Get user's resume
- `POST /api/resume` - Upload/create resume
- `PUT /api/resume/:id` - Update resume
- `POST /api/resume/analyze` - Analyze resume with AI

### Additional endpoints available for jobs, roadmap, and chat

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=
JWT_SECRET=
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📖 Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Start development server with nodemon
npm run build    # Build for production
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Rajan Ahuja**

## 📧 Contact

For questions or support, please reach out via GitHub issues.

## 🙏 Acknowledgments

- React and Vite communities
- Tailwind CSS documentation
- Express.js and MongoDB documentation
- All contributors and users of this project

---

**Last Updated**: February 2026
