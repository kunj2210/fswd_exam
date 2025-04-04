# QR Code Generation & Scanning System

A full-stack application for generating and scanning QR codes, built with the MERN stack.

## Features

- Generate QR codes for URLs or text
- Scan QR codes using device camera
- View history of generated and scanned QR codes
- User authentication (signup/login)
- Download generated QR codes as images
- Copy QR code content to clipboard
- Share QR codes via email
- Filter QR codes by date range
- Paginated QR code history

## Tech Stack

- Frontend: React (Vite) + Material-UI
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- QR Code Generation: qrcode
- QR Code Scanning: react-qr-reader
- Email Sharing: Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd qr-code-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr-code-system
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### QR Codes
- POST `/api/qr/generate` - Generate a new QR code
- GET `/api/qr/history` - Get user's QR code history
- POST `/api/qr/share/:id` - Share a QR code via email
- POST `/api/qr/scan/:id` - Mark a QR code as scanned

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 