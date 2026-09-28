# Fullstack Developer Portfolio

A collection of fullstack development projects showcasing modern web development skills, REST APIs, and real-time applications.

## Overview

This portfolio contains **3 additional fullstack projects** built with different technology stacks to demonstrate versatility and comprehensive fullstack development capabilities. Each project addresses a unique business problem and showcases different skills:

1. **Task Manager** (Original) - A basic task management application
2. **E-commerce Platform** - A complete online shopping experience with authentication
3. **Social Media Dashboard** - A social networking platform with real-time interactions
4. **Chat Application** - A real-time communication tool with Socket.io

## Technology Stack

### Core Technologies:
- Frontend: React, TypeScript, Vite
- Backend: Python (FastAPI), Node.js (Express)
- Databases: PostgreSQL/SQLite/MongoDB
- Real-time: Socket.io
- Authentication: JWT, bcrypt
- DevOps: Docker, Git/GitHub

## Projects

### 1. E-commerce Platform

**Features:**
- User authentication (JWT-based)
- Product catalog with categories
- Shopping cart functionality
- Order management system
- Admin dashboard
- Payment integration ready

**Tech Stack:**
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite/PostgreSQL
- Authentication: JWT, bcrypt
- Dockerized deployment

**GitHub:** [`marshu123/fullstack-portfolio/ecommerce-platform`](https://github.com/marshu123/fullstack-portfolio/tree/main/ecommerce-platform)

### 2. Social Media Dashboard

**Features:**
- User authentication and profiles
- Post creation and sharing
- Like and comment system
- Follow/unfollow relationships
- Real-time post updates
- Responsive design

**Tech Stack:**
- Backend: Node.js, Express, MongoDB
- Frontend: React, TypeScript
- Authentication: JWT, bcrypt
- NoSQL database for flexibility

**GitHub:** [`marshu123/fullstack-portfolio/social-dashboard`](https://github.com/marshu123/fullstack-portfolio/tree/main/social-dashboard)

### 3. Chat Application

**Features:**
- Real-time messaging
- User authentication
- Message history persistence
- Connected user indicators
- Responsive chat interface

**Tech Stack:**
- Backend: Node.js, Express, Socket.io
- Database: MongoDB (for history)
- Frontend: React, TypeScript
- WebSockets for real-time communication

**GitHub:** [`marshu123/fullstack-portfolio/chat-app`](https://github.com/marshu123/fullstack-portfolio/tree/main/chat-app)

## Project Structure

```
fullstack-portfolio/
â”œâ”€â”€ ecommerce-platform/           # E-commerce solution (Python + FastAPI)
â”‚   â”œâ”€â”€ backend/                # FastAPI backend with SQLAlchemy
â”‚   â”‚   â”œâ”€â”€ main.py             # API implementation
â”‚   â”‚   â”œâ”€â”€ requirements.txt    # Python dependencies
â”‚   â”‚   â””â”€â”€ Dockerfile          # Containerization
â”‚   â””â”€â”€ frontend/               # React frontend
â”‚       â”œâ”€â”€ src/                # React components
â”‚       â””â”€â”€ package.json        # Frontend dependencies
â”‚
â”œâ”€â”€ social-dashboard/            # Social media platform (Node.js + Express)
â”‚   â”œâ”€â”€ backend/                # Express backend with MongoDB
â”‚   â”‚   â”œâ”€â”€ src/               # Server implementation
â”‚   â”‚   â”œâ”€â”€ package.json       # Node dependencies
â”‚   â”‚   â””â”€â”€ Dockerfile         # Containerization
â”‚   â””â”€â”€ frontend/               # React frontend
â”‚       â”œâ”€â”€ src/                # React components
â”‚       â””â”€â”€ package.json        # Frontend dependencies
â”‚
â”œâ”€â”€ chat-app/                    # Real-time chat (Node.js + Socket.io)
â”‚   â”œâ”€â”€ backend/                # Express + Socket.io backend
â”‚   â”‚   â”œâ”€â”€ src/               # Server implementation
â”‚   â”‚   â””â”€â”€ package.json       # Node dependencies
â”‚   â””â”€â”€ frontend/               # React frontend
â”‚       â”œâ”€â”€ src/                # React components
â”‚       â””â”€â”€ package.json        # Frontend dependencies
â”‚
â””â”€â”€ task-manager/               # Original task management app
    â”œâ”€â”€ main.py                 # FastAPI backend
    â”œâ”€â”€ frontend/              # React frontend
    â”œâ”€â”€ Dockerfile             # Containerization
    â””â”€â”€ README.md              # Original project documentation
```

## Key Skills Demonstrated

### Backend Development:
- **RESTful API Design**: Clean, well-documented endpoints
- **Database Integration**: Both SQL (SQLAlchemy) and NoSQL (MongoDB)
- **Authentication & Security**: JWT tokens, password hashing
- **Error Handling**: Robust error management
- **Testing & Validation**: Input validation and error responses

### Frontend Development:
- **Component Architecture**: Reusable React components
- **State Management**: useState, useEffect, custom hooks
- **Responsive Design**: Mobile-first, adaptive layouts
- **Type Safety**: TypeScript throughout
- **User Experience**: Form validation, loading states

### DevOps:
- **Containerization**: Docker for consistent deployment
- **Version Control**: Git workflows
- **CI/CD Ready**: Configured for automated testing
- **Environment Configuration**: dotenv for secrets management

## How to Get Started

### Prerequisites
- Node.js 18+ (for frontend projects)
- Python 3.9+ (for e-commerce backend)
- Docker (recommended for containerized projects)
- MongoDB (for social dashboard and chat app)

### Running Projects

#### E-commerce Platform
```bash
# Backend
cd ecommerce-platform/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in separate terminal)
cd ecommerce-platform/frontend
npm install
npm run dev
```

#### Social Media Dashboard
```bash
# Backend
cd social-dashboard/backend
npm install
node src/index.js

# Frontend (in separate terminal)
cd social-dashboard/frontend
npm install
npm run dev
```

#### Chat Application
```bash
# Backend
cd chat-app/backend
npm install
node src/index.js

# Frontend (in separate terminal)
cd chat-app/frontend
npm install
npm run dev
```

## Learning Outcomes

These projects demonstrate:

1. **Versatility**: Working with multiple tech stacks (Python/Node.js)
2. **Problem Solving**: Addressing different business requirements
3. **Code Quality**: Following best practices and patterns
4. **Deployment**: Containerization and environment setup
5. **Testing**: Manual testing and error handling

## Future Enhancements

Each project has several potential improvements:

### E-commerce:
- Payment gateway integration (Stripe/PayPal)
- Advanced search and filtering
- Admin panel with analytics
- Mobile app development

### Social Media:
- WebSocket for real-time updates
- Advanced media sharing
- Post scheduling
- AI-powered content recommendations

### Chat:
- Private and group chats
- Message encryption
- File sharing
- Presence indicators

## Connect With Me

### LinkedIn

Connect with me on LinkedIn: [https://www.linkedin.com/in/marshidp/](https://www.linkedin.com/in/marshidp/)

### Portfolio Website

Explore my interactive portfolio website showcasing my fullstack development projects:

[Marshid - Fullstack Developer Portfolio](https://marshid-portfolio.vercel.app/)

### GitHub Repository

Browse all my open-source projects and contributions:

[Marshid Portfolio on GitHub](https://github.com/marshu123/fullstack-portfolio)

## About This Portfolio

This portfolio showcases comprehensive fullstack development skills through diverse,
production-ready applications. Each project is independently functional and demonstrates
different aspects of modern web development. The codebase follows clean architecture
principles and is ready for integration into professional environments.

**Repository Statistics:**
- Total Projects: 4
- Technologies Used: 5+
- Lines of Code: ~2,000+
- Dependencies: Managed via package.json/requirements.txt
- Testing: Manual testing with error scenarios covered