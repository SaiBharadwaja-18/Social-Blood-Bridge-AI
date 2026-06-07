# 🩸 Social Blood Bridge AI

### Autonomous AI-Powered Blood Coordination Platform for Thalassemia Care

> Built for **AI For Good 2.0 Hackathon** by Blend360 × Blood Warriors x HackCulture  
> Team: Tsubasa | Track: AI-Enabled Care Coordination
> 🌐 **Live Demo:** https://main.d3adqr9k4z17ry.amplifyapp.com/

---

## 🎯 The Problem

Over **1,00,000 Thalassemia patients** in India require blood transfusions every 14–28 days for their entire lives — up to 700 transfusions in a lifetime.

**Blood Warriors**, a foundation connecting voluntary blood donors with Thalassemia patients, faces a critical challenge:

- 🔴 Finding eligible donors quickly is **manual and slow**
- 🔴 Low donor response rates due to **poor engagement**
- 🔴 No system to **predict upcoming transfusion needs**
- 🔴 Coordinators spend hours on **repetitive coordination tasks**
- 🔴 No backup donor system when primary donors decline

---

## 💡 Our Solution

**Social Blood Bridge AI** is a full-stack, AI-powered blood coordination platform that:

- ✅ **Automatically matches** donors to blood requests using AI priority scoring
- ✅ **Predicts transfusion cycles** and creates requests proactively
- ✅ **Engages donors** continuously — not just during emergencies
- ✅ **Activates backup donors** automatically when primary donors decline
- ✅ **Gives coordinators** a central command center with full oversight
- ✅ **Uses Amazon Bedrock Claude** for smart insights and personalized outreach

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│         Donor Portal | Patient Portal | Coordinator      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              AWS API Gateway (HTTP API)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              AWS Lambda (FastAPI + Mangum)               │
│   Auth | Donors | Requests | AI Matching | Notifications │
└──────┬───────────────┬────────────────┬─────────────────┘
       │               │                │
       ▼               ▼                ▼
┌──────────┐  ┌────────────────┐  ┌───────────────┐
│ DynamoDB │  │ Amazon Bedrock │  │ EventBridge   │
│ 6 Tables │  │ Claude Haiku   │  │ Cron Triggers │
└──────────┘  └────────────────┘  └───────────────┘
```

---

## 🌟 Key Features

### 🤖 AI Donor Priority Scoring
Scores every donor using a weighted formula:

| Factor | Weight | Source |
|--------|--------|--------|
| Response Rate | 40% | calls_to_donations_ratio |
| Donation Success | 20% | donations_till_date |
| Availability | 20% | eligibility_status |
| Distance | 10% | GPS coordinates (Haversine) |
| Recency | 10% | last_donation_date |

### ⚡ Predictive Transfusion Auto-Trigger
- Tracks every Thalassemia patient's transfusion cycle
- Auto-creates blood requests 7 days before due date
- Zero manual intervention needed
- Notifies coordinator + patient automatically

### 💬 Amazon Bedrock Claude Integration
- **AI Insights** — Claude analyzes platform stats and gives coordinator recommendations
- **Personalized Donor Messages** — Claude writes custom outreach SMS per donor
- Model: `claude-haiku-4-5` (us-east-1 inference profile)

### 📊 Coordinator Command Center
- Real-time dashboard with live DynamoDB data
- Manual override for every AI decision
- Broadcast notifications to all / specific blood group donors
- Full request lifecycle monitoring

### 🔐 Three Portal System
- **Coordinator Portal** — full platform control and monitoring
- **Donor Portal** — receive requests, track donations, manage profile
- **Patient Portal** — create requests, track transfusion cycles

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS
- Google Places API (India-specific location search)
- Browser Geolocation API (GPS)

### Backend
- Python FastAPI + Mangum (Lambda adapter)
- AWS Lambda + API Gateway (HTTP API)
- JWT Authentication (python-jose)

### Database
- Amazon DynamoDB (6 tables, On-Demand billing)
  - `Users` — donors, patients, coordinator
  - `BloodRequests` — all blood requests
  - `TransfusionCycles` — patient cycle schedules
  - `DonorMatches` — AI match results
  - `Notifications` — all notifications
  - `DonationHistory` — completed donations

### AI Layer
- **Amazon Bedrock** — Claude Haiku (`us.anthropic.claude-haiku-4-5-20251001-v1:0`)
  - Coordinator insights generation
  - Personalized donor SMS writing
- **Rule-based scoring engine** — Python priority formula for donor matching

### Automation
- Amazon EventBridge (planned — daily transfusion cycle check)

### Deployment
- AWS Amplify (Frontend — planned)
- AWS Lambda (Backend — live)
- Amazon API Gateway (live)

---

## 📁 Project Structure

```
social-blood-bridge-ai/
├── src/                          # React Frontend
│   ├── pages/
│   │   ├── admin/                # Coordinator Portal (12 pages)
│   │   ├── donor/                # Donor Portal (6 pages)
│   │   ├── patient/              # Patient Portal (5 pages)
│   │   └── public/               # Landing, Login, Register
│   ├── services/                 # API service layer
│   │   ├── api.ts                # Base API with JWT
│   │   ├── authService.ts        # Login / Register
│   │   ├── donorService.ts       # Donor APIs
│   │   ├── requestService.ts     # Blood request APIs
│   │   ├── aiService.ts          # Bedrock AI APIs
│   │   └── notificationService.ts
│   ├── context/
│   │   └── AuthContext.tsx       # JWT auth + role-based redirect
│   └── components/               # Reusable UI components
│
└── backend/                      # FastAPI Backend
    ├── main.py                   # FastAPI app
    ├── lambda_handler.py         # AWS Lambda entry point
    ├── requirements.txt
    ├── routes/
    │   ├── auth.py               # Login / Register endpoints
    │   ├── donors.py             # Donor management
    │   ├── requests.py           # Blood requests + auto-trigger
    │   ├── ai.py                 # Bedrock AI endpoints
    │   └── notifications.py      # Notification management
    └── services/
        ├── dynamodb.py           # All DynamoDB operations
        └── bedrock.py            # AI scoring + Claude integration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12
- AWS CLI configured (`aws configure`)
- Google Maps API key

### Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your keys to .env:
# VITE_API_URL=your_api_gateway_url
# VITE_GOOGLE_MAPS_API_KEY=your_key

# Run development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run locally
python -m uvicorn main:app --reload --port 8000

# API docs available at:
# http://localhost:8000/docs
```

### Database Setup
```bash
cd backend

# Create all 6 DynamoDB tables
python create_tables.py

# Load sample data (4,442 donors + 20 patients)
python load_data.py
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Coordinator** | coordinator@bloodwarriors.org | BloodWarriors@2025! |
| **Patient** | patient@test.com | Test@1234 |
| **Donor** | ravi@test.com | Test@1234 |

---

## 📊 Dataset

Built using real Blood Warriors donor data:
- **4,442 unique donors** loaded from CSV
- Fields: blood group, donation history, response rates, eligibility, GPS coordinates
- **20 Thalassemia patients** with realistic transfusion cycles (14–28 day frequency)
- **13 patients** with transfusions due within 7 days (for auto-trigger demo)

---

## 🎬 Demo Flow

### 1. Coordinator Portal
```
Login → Dashboard (real data + Bedrock AI insights)
     → Donor Management → filter 4,442 donors by blood group
     → Blood Requests → ⚡ Auto-Trigger Cycles
        (auto-creates requests for 13 patients due this week)
     → AI Matching → select request → Run AI Matching
        → see scored donors → 🤖 Generate AI Message (Bedrock)
     → Notifications → Broadcast to all O+ donors
```

### 2. Patient Portal
```
Login → Dashboard (transfusion countdown timer)
     → Blood Requests → Create new request
     → See request appear in coordinator portal
```

### 3. Donor Portal
```
Register → GPS location auto-detected
        → Dashboard shows matching blood requests
        → Profile shows real donation stats
```

---

## ⚠️ Known Limitations & Work in Progress

> This project was built during a 2-day hackathon. Some features are partially implemented or need further development.

### 🔧 Currently Not Working / Needs Fix
- [ ] Donor dashboard — profile data fetch returns "Access denied" (role permission issue in donors route)
- [ ] Patient transfusion history — needs real donation records linked to patient ID
- [ ] Donor DonationHistoryPage — still uses mock data
- [ ] Donor MyRequestsPage — still uses mock data
- [ ] Donor AchievementsPage — still uses mock data
- [ ] Accept/Decline buttons on donor dashboard — UI only, not connected to API
- [ ] ForgotPasswordPage — not implemented
- [ ] Registration — TransfusionCycle not auto-created for new patients
- [ ] EventBridge cron job — not configured (auto-trigger runs manually only)

### 🚧 Partially Implemented
- [ ] AI Matching — works but backup donor auto-activation not fully automated
- [ ] Notifications — in-app only, SMS/Email via SNS/SES not connected
- [ ] Analytics page — still showing mock charts
- [ ] Request Detail page — not connected to real data
- [ ] Donor Detail page — not connected to real data
- [ ] Frontend not yet deployed to Amplify (runs locally)

### 🔮 Planned but Not Built
- [ ] Amazon Cognito authentication (currently using custom JWT)
- [ ] Amazon Lex chatbot for donor engagement
- [ ] WhatsApp / SMS via Amazon SNS
- [ ] SageMaker ML model for better prediction accuracy
- [ ] Real-time notifications via WebSockets
- [ ] Multi-language support (Telugu, Hindi, Tamil)
- [ ] Mobile app (React Native)
- [ ] AWS Step Functions for full workflow orchestration
- [ ] Donor gamification and leaderboards
- [ ] Integration with hospital blood bank systems

### ✅ Fully Working
- [x] Coordinator login + full portal (12 pages)
- [x] Donor login + dashboard
- [x] Patient login + dashboard
- [x] Registration (donor + patient) → saves to real DynamoDB
- [x] Blood request creation from patient portal
- [x] AI Donor Priority Scoring — rule-based 40/20/20/10/10 formula
- [x] Amazon Bedrock Claude — AI insights for coordinator dashboard
- [x] Amazon Bedrock Claude — personalized donor outreach messages
- [x] Auto-trigger for Thalassemia transfusion cycles
- [x] Broadcast notifications to donors by blood group
- [x] Real data — 4,442 donors from Blood Warriors dataset
- [x] Backend deployed on AWS Lambda (Python 3.12)
- [x] API Gateway live with 20+ endpoints
- [x] Google Places API — India-specific location search
- [x] GPS geolocation with reverse geocoding
- [x] JWT authentication with role-based access

---

## 🔮 Future Roadmap

### Phase 1 — Fix & Stabilize
- Fix donor profile access permission
- Connect all remaining mock data pages
- Add Cognito authentication
- Deploy frontend to Amplify

### Phase 2 — AI Enhancement
- Replace rule-based scoring with SageMaker ML model
- Add Amazon Lex conversational chatbot
- Implement real-time backup donor activation
- Add fulfillment failure learning

### Phase 3 — Scale
- SMS/WhatsApp notifications via SNS
- Multi-language support
- Mobile app
- Multi-city / multi-organization support

---

## 🏆 Hackathon

**AI For Good 2.0** — Organized by Blend360
**Problem Statement:** Blood Warriors — AI-Enabled Care Coordination
**Evaluation Criteria:**
- Ideation (20%) — Practicality & Scalability
- Innovation (20%) — Uniqueness of solution
- Prototype Development (20%) — Real implementation
- AI Component (20%) — Amazon Bedrock integration
- End-to-End Execution (20%) — Deployment

---

## 👥 Team

Built with ❤️ for Blood Warriors and Thalassemia patients across India.

> *"Every 2 seconds, someone in India needs blood. We built this so they don't have to wait."*

---

## 📄 License

MIT License — Built for social good 🩸
