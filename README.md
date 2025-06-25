# 🏨 Hostel Management System

A full-stack hostel management web app built using:

- **Frontend**: React, Tailwind CSS, TypeScript  
- **Backend**: Hono (Serverless), Prisma ORM  
- **Database**: PostgreSQL (Neon.tech with connection pooling)  
- **Deployment**: Vercel (Frontend), Cloudflare Workers (Backend)  

## 📦 Project Structure

hostel-management-system/  
├── frontend/ # React + Tailwind frontend  
├── backend/ # Hono backend with Prisma and Neon  
└── [README.md](http://readme.md/)  

## ⚙️ Prerequisites

- Node.js >= 18
- Docker (for local Postgres) OR Neon account (recommended for serverless)
- Vercel account (for frontend deployment)
- Cloudflare account (for Workers deployment)

## 🧩 Setup

💾 1. Backend Setup: go to the backend folder  

📦 Install dependencies: npm install  
🗃️ Setup .env file: cp .env.example .env  
Then fill in:

DATABASE_URL="postgresql://<username>:<password>@<host>.neon.tech/<db>?sslmode=require"  
ACCELERATE_URL="prisma://<your_prisma_accelerate_url>"
Get these from Neon & Prisma Accelerate  

🧱 Initialize Prisma:  
npx prisma generate  
npx prisma db push  
▶️ Run backend locally: npm run dev  
API available at: <http://localhost:3000>  

🎨 2. Frontend Setup  
📁 Go to frontend folder: cd ../frontend  
📦 Install dependencies: npm install  
▶️ Run React app: npm run dev  
Frontend runs at: <http://localhost:5173>

🚀 Deployment
📄 Frontend → Vercel
Push frontend/ to GitHub

Connect Vercel to the repo

Set framework = Vite

Add VITE_BACKEND_URL in environment variables

📃 Backend → Cloudflare Workers  
Install Wrangler CLI: npm install -g wrangler  
Login: wrangler login  
Deploy: wrangler deploy  

Note: Prisma on Cloudflare Workers may require adjustments for ESM bundling and data proxy usage.

🧪 Sample API (Hono)  
app.get('/', async (c) => {  
  const users = await prisma.user.findMany();  
  return c.json(users);  
});

📚 Tech Stack  
Frontend: React, Tailwind CSS, Vite  
Backend: Hono, TypeScript, Prisma  
DB: PostgreSQL (Neon.tech)  
Deployment: Vercel + Cloudflare Workers  

✅ Features Planned  
 Student Registration  
 Room Allocation  
 Leave Requests  
 Complaints  
 Fee Management  
 Admin Dashboard  
 Email Notifications  