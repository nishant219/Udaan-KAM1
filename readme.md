# Lead Management System

## Overview
A comprehensive B2B lead management system designed for Key Account Managers (KAMs) at Udaan to manage relationships with large restaurant accounts. The system helps track and manage leads, interactions, and account performance.

## Features
- Lead Management
  - Add and track new restaurant leads
  - Store comprehensive restaurant information
  - Track lead status through the sales pipeline
- Contact Management
  - Multiple Points of Contact (POCs) per restaurant
  - Role-based contact management
  - Primary contact designation
- Interaction Tracking
  - Call logging and scheduling
  - Order tracking
  - Meeting notes and follow-ups
- Performance Analytics
  - Account performance metrics
  - Ordering pattern analysis
  - KAM performance dashboard
- Time Zone Management
  - Call scheduling across time zones
  - Working hours optimization
  - Automated next-call calculation

## Technical Stack
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Logging: Winston
- Testing: Jest
- Deployment: Docker + GitHub Actions

## Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/your-org/lead-management.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the development server
npm run dev
```

### Environment Variables
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/leadmanagement
JWT_SECRET=your-secret-key
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)