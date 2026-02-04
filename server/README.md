# Aura Judge Backend API

Backend server cho hệ thống Aura Judge - Online Judge Platform với JWT Authentication, Firebase OTP, và Docker-based Judge System.

## 🚀 Features

- ✅ **JWT Authentication** - Access & Refresh tokens
- ✅ **Firebase Auth** - OTP qua Email và SMS
- ✅ **Online Judge** - Docker-based code execution
- ✅ **Multi-Language Support** - C, C++, Python, Java, JavaScript, TypeScript, Go, Rust
- ✅ **Role-Based Access Control** - User, Student, Teacher, Admin
- ✅ **Problem Management** - CRUD operations với filtering
- ✅ **Submission Tracking** - Real-time judge status

## 📋 Prerequisites

- Node.js >= 16
- MongoDB >= 5
- Docker Desktop (for judge system)
- Firebase Project với Auth enabled

## ⚙️ Installation

```bash
# Install dependencies
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

## 🔑 Environment Variables

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aura-judge
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
CORS_ORIGIN=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Login với username/password 
- `POST /api/auth/send-otp-email` - Gửi OTP qua email
- `POST /api/auth/send-otp-sms` - Gửi OTP qua SMS
- `POST /api/auth/verify-otp` - Verify OTP và nhận JWT tokens
- `POST /api/auth/refresh` - Refresh access token

### Problems
- `GET /api/problems` - List tất cả problems (public)
- `GET /api/problems/:id` - Chi tiết problem (public)
- `POST /api/problems` - Tạo problem mới (Teacher+)
- `PUT /api/problems/:id` - Update problem (Teacher+)
- `DELETE /api/problems/:id` - Xóa problem (Admin only)

### Judge
- `POST /api/judge/submit` - Submit code (authenticated)
- `GET /api/judge/submission/:id` - Xem submission status
- `GET /api/judge/submissions` - Lịch sử submissions

## 🧪 Testing

### Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

### Test Authentication Flow
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Send OTP Email
curl -X POST http://localhost:3000/api/auth/send-otp-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verify OTP (check console for OTP code in development)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "otp": "123456",
    "type": "email"
  }'
```

### Test Judge System
```bash
# Submit C++ code
curl -X POST http://localhost:3000/api/judge/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "problemId": "PROBLEM_ID",
    "code": "#include<iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}",
    "language": "cpp"
  }'

# Check submission status
curl http://localhost:3000/api/judge/submission/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐳 Docker Support

Judge system sử dụng Docker để chạy code trong môi trường isolated:

```bash
# Pull required images
docker pull gcc:latest
docker pull python:3.11-slim
docker pull openjdk:17-slim
docker pull node:18-slim
docker pull golang:1.21-alpine
docker pull rust:1.75-slim
```

## 🛠️ Development

```bash
# Start dev server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Models

- **User** - User accounts với stats và verification status
- **Problem** - Problems với test cases và difficulty
- **Submission** - Code submissions với judge results
- **OTP** - Temporary OTP codes (auto-expire)

## 🔒 Security

- JWT with refresh tokens
- Password hashing với bcrypt
- Firebase Admin SDK cho OTP
- Docker isolation cho code execution
- Rate limiting (recommended - add middleware)
- Input validation với express-validator

## 📝 License

ISC
