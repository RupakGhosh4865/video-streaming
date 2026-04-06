# VideoVault | Enterprise Media Pipeline

VideoVault is a premium multi-tenant media streaming platform. It offers deep real-time background processing, RBAC administration isolations, Socket.io event emission progress mapping, and secure `HTTP 206` chunked range streaming.

## 🚀 Quick Setup (Docker)

1. Make sure you have Docker and Docker Compose installed.
2. Build and boot the stack (MongoDB + Backend + Express Node):
```bash
docker-compose up --build
```
3. Navigate to `./frontend`, copy the environment variables, install dependencies, and boot the Vite server:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> [!TIP]
> **To seed testing data**, open a terminal in the `backend` folder and run `npm run seed`. 
> You can then log in on the frontend with: **admin@videovault.com** | **password123**

## 💻 Tech Architecture

VideoVault is engineered utilizing an MERN Monorepo architecture bridged with WebSockets and native file telemetry streams.

- **Frontend**: React, Vite, Framer Motion, Tailwind CSS, React Query, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), `fluent-ffmpeg`, Multer.
- **Security Protocols**: JWT (`Access`/`Refresh`), HTTP `express-rate-limit`, `helmet` cross-origin enforcement, strictly typed RBAC models over API boundaries.

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description |
|-----------|-------------|
| `PORT` | Local host port (usually 5000) |
| `MONGODB_URI` | Mongo instance connection string |
| `JWT_SECRET` | Access token seed |
| `JWT_REFRESH_SECRET`| Refresh token seed |
| `ACCESS_TOKEN_EXPIRY`| Default `1d` |

### Frontend (`/frontend/.env`)
| Variable | Description |
|-----------|-------------|
| `VITE_API_URL` | Route targeting the Express HTTP backend |

## 🚢 Production Deployment Prep

VideoVault is configured for split-cloud deployment leveraging standard CI actions.

1. **Backend (Railway/Render)**: 
   Connect your Github repository. Set the Build Command to `npm install`, and the start command to `npm start`. Ensure that the service environment actually forces an installation of `ffmpeg` globally natively. 

2. **Frontend (Vercel)**:
   Import the `/frontend` sub-directory directly into Vercel. Map the `VITE_API_URL` securely to your new HTTPS Railway URL. 
   
## 🗃️ API Endpoint Summary

### Media Operations
- `POST /api/videos/upload` - Triggers Chunked File Upload saving natively mapping to Background Jobs (Editor+)
- `GET /api/videos/:id/stream` - Core HTTP 206 HTTP Stream engine handling token validation safely (Viewer+)
 
### Admin Management
- `GET /api/admin/users` - Fetches all multitenant scoped viewers.
- `PATCH /api/admin/users/:id/role` - Real-time optimistic UI role shifting.
- `DELETE /api/admin/videos/:id` - Full scale permanent media obliteration.
