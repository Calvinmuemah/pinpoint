# Pinpoint Backend

Node.js / Express backend service for Pinpoint.

## Folder Structure

```text
pinpoint-backend/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── env.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rateLimit.middleware.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   └── user.routes.js
│   │   │
│   │   ├── leads/
│   │   │   ├── lead.controller.js
│   │   │   ├── lead.service.js
│   │   │   ├── lead.repository.js
│   │   │   ├── lead.routes.js
│   │   │   └── lead.validation.js
│   │   │
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── public/
│   │
│   ├── ai/
│   │   ├── agents/
│   │   │   └── travel-intelligence.agent.js
│   │   ├── scoring/
│   │   │   └── lead-scoring.service.js
│   │   └── tools/
│   │       ├── web-search.tool.js
│   │       ├── social-search.tool.js
│   │       └── business-search.tool.js
│   │
│   ├── jobs/
│   │   ├── lead-processing.job.js
│   │   ├── notification.job.js
│   │   └── analytics.job.js
│   │
│   ├── db/
│   │   ├── migrations/
│   │   └── queries/
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
├── .env
├── package.json
└── README.md
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Update `.env` with your database and Redis configuration details.

3. **Start the Server**:
   ```bash
   npm start
   ```
