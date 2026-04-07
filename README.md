# VideoVault | Enterprise Media Pipeline

VideoVault is a premium multi-tenant media streaming platform. It offers deep real-time background processing, RBAC administration isolations, Socket.io event emission progress mapping, and secure `HTTP 206` chunked range streaming.

<img width="1912" height="948" alt="Image" src="https://github.com/user-attachments/assets/87557936-8d50-46bf-92a3-4467f41e6c04" />

<img width="970" height="795" alt="Image" src="https://github.com/user-attachments/assets/ed7ad468-4ea7-4498-a559-6a501847c6e3" />

<img width="1918" height="955" alt="Image" src="https://github.com/user-attachments/assets/ce1251ff-74a4-4179-b1f3-dd58520ff302" />

<img width="1918" height="955" alt="Image" src="https://github.com/user-attachments/assets/e5224f31-96a8-49a0-91f7-83f40858f29d" />

<img width="1914" height="1028" alt="Image" src="https://github.com/user-attachments/assets/4d990460-7190-4463-98c3-126415f86ce0" />

<img width="1894" height="969" alt="Image" src="https://github.com/user-attachments/assets/31993915-a822-47b6-8411-796a7b616ddf" />




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
