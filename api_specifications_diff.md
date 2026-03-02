--- api_specifications.md (原始)


+++ api_specifications.md (修改后)
# UniLink Platform API Specifications

## Base URL
```
https://api.unilink.africa/v1
```

## Authentication
All endpoints require authentication via JWT token in header:
```
Authorization: Bearer <jwt_token>
```

## Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "error": null
}
```

## Error Response Format
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## 1. User Management

### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student|teacher",
  "phoneNumber": "+254712345678",
  "countryCode": "KE"
}
```
Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token"
}
```

### POST /auth/login
Login existing user
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
Response:
```json
{
  "user": { /* user object */ },
  "token": "jwt_token"
}
```

### GET /auth/me
Get current user profile
Response:
```json
{
  "user": { /* complete user object */ }
}
```

### PUT /users/profile
Update user profile
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "My bio",
  "profileImageUrl": "https://..."
}
```

## 2. KYC Management (Teachers Only)

### POST /kyc/documents
Submit KYC documents
```json
{
  "documentType": "passport|national_id|teaching_cert",
  "documentUrl": "https://s3.amazonaws.com/..."
}
```

### GET /kyc/status
Check KYC status
Response:
```json
{
  "status": "pending|verified|rejected",
  "documents": [
    {
      "id": "uuid",
      "documentType": "passport",
      "documentUrl": "...",
      "verificationStatus": "pending|verified|rejected"
    }
  ]
}
```

## 3. Wallet & Payments

### GET /wallet/balance
Get wallet balance
Response:
```json
{
  "balance": 150.50,
  "currency": "USD"
}
```

### POST /wallet/deposit
Initiate deposit via payment provider
```json
{
  "amount": 50.00,
  "provider": "ecocash|paynow|flutterwave|paystack",
  "countryCode": "ZW|KE|NG"
}
```
Response:
```json
{
  "paymentLink": "https://...",
  "referenceId": "txn_ref_123",
  "provider": "ecocash"
}
```

### POST /wallet/payment-webhook
Payment gateway webhook (internal)
```json
{
  "provider": "ecocash",
  "referenceId": "txn_ref_123",
  "status": "completed|failed",
  "amount": 50.00,
  "userId": "uuid",
  "signature": "hmac_signature"
}
```

### GET /wallet/transactions
Get transaction history
Response:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "deposit|spend|earning|payout",
      "amount": 50.00,
      "currency": "USD",
      "description": "Course viewing",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### POST /wallet/payout
Request payout (teachers only)
```json
{
  "amount": 100.00,
  "provider": "ecocash|paynow|mobile_money_provider",
  "recipientAccount": "phone_number_or_account"
}
```

## 4. Course Management (Teachers)

### POST /courses
Create a new course
```json
{
  "title": "Introduction to Programming",
  "description": "Learn programming basics",
  "level": "secondary|tertiary|professional",
  "pricePerMinute": 0.08, // Optional override
  "thumbnailUrl": "https://..."
}
```

### GET /courses?level=tertiary&search=programming
Search and filter courses
Response:
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Course Title",
      "description": "...",
      "level": "tertiary",
      "teacher": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "isVerified": true
      },
      "pricePerMinute": 0.08,
      "durationMinutes": 120,
      "averageRating": 4.5,
      "totalEnrollments": 150,
      "thumbnailUrl": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

### POST /courses/{courseId}/videos
Upload video to course
```json
{
  "title": "Variables and Data Types",
  "description": "Understanding variables",
  "durationSeconds": 1800
}
```
Response:
```json
{
  "videoId": "uuid",
  "uploadUrl": "https://s3-presigned-url...",
  "uploadFields": {
    "key": "...",
    "policy": "...",
    "signature": "..."
  }
}
```

### PUT /courses/{courseId}/structure
Define course structure (adaptive learning)
```json
{
  "nodes": [
    {
      "id": "uuid", // for existing nodes
      "videoId": "uuid",
      "nodeType": "video|quiz|workspace",
      "prerequisiteNodeId": "uuid",
      "nextNodeId": "uuid",
      "nextNodePassId": "uuid",
      "nextNodeFailId": "uuid",
      "minScoreForPass": 70,
      "maxScoreForFail": 49
    }
  ]
}
```

## 5. Video Playback & Billing

### GET /videos/{videoId}/playback
Get video playback information
Response:
```json
{
  "video": {
    "id": "uuid",
    "title": "Video Title",
    "description": "...",
    "hlsPlaylistUrl": "https://...",
    "durationSeconds": 1800,
    "isLive": false,
    "overlayConfig": {},
    "audioTracks": {
      "original": "url",
      "swahili": "url",
      "french": "url"
    }
  },
  "billingRate": 0.08, // per minute
  "isLive": false,
  "courseLevel": "tertiary"
}
```

### POST /billing/heartbeat
Billing heartbeat (sent every 60 seconds during video playback)
```json
{
  "videoId": "uuid",
  "currentTime": 360, // seconds watched in current session
  "sessionId": "uuid" // from initial playback request
}
```
Response:
```json
{
  "status": "ok|insufficient_balance",
  "remainingBalance": 45.20,
  "minutesBilled": 6,
  "amountCharged": 0.48,
  "teacherRevenue": 0.32,
  "platformFee": 0.16
}
```

### POST /billing/session-end
End billing session (when video stops)
```json
{
  "videoId": "uuid",
  "sessionId": "uuid",
  "totalTimeWatched": 1200 // seconds
}
```

## 6. Interactive Workspaces

### POST /workspaces/{videoId}/run-code
Execute code in workspace
```json
{
  "language": "javascript|python|java|c++",
  "code": "console.log('Hello World');",
  "input": "" // optional input for program
}
```
Response:
```json
{
  "output": "Hello World",
  "stderr": "",
  "exitCode": 0,
  "executionTimeMs": 150
}
```

### POST /workspaces/{videoId}/submit
Submit workspace task
```json
{
  "submissionType": "code|spreadsheet|assignment",
  "content": "submitted content",
  "isCorrect": true
}
```

## 7. AI Features

### POST /ai/neuromancer/chat
Chat with Neuromancer AI
```json
{
  "videoId": "uuid",
  "question": "Explain variables in programming"
}
```
Response:
```json
{
  "answer": "Variables are containers that store data values...",
  "references": [
    {
      "timestamp": 120,
      "context": "In the video at 2:00..."
    }
  ],
  "tokensUsed": 150
}
```

### POST /ai/generate-course
Generate course via Genesis Engine
```json
{
  "topic": "Quantum Physics",
  "targetLevel": "tertiary",
  "durationMinutes": 3
}
```
Response:
```json
{
  "courseId": "uuid",
  "status": "processing|completed",
  "estimatedCompletion": "2023-01-01T00:05:00Z"
}
```

## 8. Social Features

### GET /feed
Get social feed of followed teachers
Response:
```json
{
  "posts": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "isVerified": true,
        "profileImageUrl": "..."
      },
      "content": "New video about algorithms...",
      "imageUrls": ["https://..."],
      "likesCount": 25,
      "commentsCount": 5,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### POST /posts
Create a new post
```json
{
  "content": "Check out my new video!",
  "imageUrls": ["https://..."]
}
```

### POST /follows/{userId}
Follow a user
Response:
```json
{
  "following": true,
  "followerCount": 150
}
```

## 9. Live Streaming

### POST /live/start
Start a live session (teachers only)
Response:
```json
{
  "streamKey": "abc-def-ghi-jkl",
  "playbackUrl": "https://ivs-playback-url...",
  "sessionId": "uuid",
  "viewerCount": 0
}
```

### GET /live/{sessionId}/chat
Get live chat messages
Response:
```json
{
  "messages": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Student",
        "isPremium": false
      },
      "message": "Great explanation!",
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### POST /live/{sessionId}/chat
Send chat message
```json
{
  "message": "Question about the algorithm?"
}
```

## 10. Progress & Gamification

### GET /progress/courses/{courseId}
Get course progress
Response:
```json
{
  "course": { /* course object */ },
  "progressPercentage": 45,
  "completedVideos": 8,
  "totalVideos": 18,
  "currentStreak": 5,
  "totalXp": 1250
}
```

### GET /leaderboards
Get leaderboard rankings
Response:
```json
{
  "global": [
    {
      "user": { /* user object */ },
      "xp": 5000,
      "rank": 1
    }
  ],
  "subject": {
    "programming": [
      { /* ranked users */ }
    ]
  },
  "region": {
    "KE": [
      { /* ranked users */ }
    ]
  }
}
```

## 11. Talent Scout

### GET /talent/search?skills=javascript&xpMin=1000
Search for talents
Response:
```json
{
  "talents": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Developer",
        "profileImageUrl": "..."
      },
      "skills": ["javascript", "react", "nodejs"],
      "xp": 2500,
      "portfolioUrl": "https://...",
      "percentileRank": 85 // top 15%
    }
  ]
}
```

### POST /talent/{talentId}/unlock-contact
Unlock talent contact info
```json
{
  "accessFee": 10.00
}
```
Response:
```json
{
  "contactInfo": {
    "email": "talent@example.com",
    "phone": "+254712345678",
    "linkedin": "https://linkedin.com/in/talent"
  },
  "feePaid": 10.00
}
```

## 12. Edge Device Sync

### GET /sync/manifest?lastSync=2023-01-01T00:00:00Z
Get content manifest for edge device
Response:
```json
{
  "videos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "encryptedDownloadUrl": "https://...",
      "checksum": "sha256_hash",
      "sizeBytes": 10485760
    }
  ],
  "courses": [
    {
      "id": "uuid",
      "title": "Course Title",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "lastSync": "2023-01-01T00:00:00Z"
}
```

### POST /sync/logs
Upload viewing logs from edge device
```json
{
  "deviceLogs": [
    {
      "userId": "uuid",
      "videoId": "uuid",
      "minutesWatched": 15,
      "date": "2023-01-01"
    }
  ]
}
```

## Rate Limits
- Authenticated endpoints: 1000 requests/hour
- Unauthenticated endpoints: 100 requests/hour
- Payment webhooks: 10000 requests/hour

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 402: Payment Required (insufficient balance)
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error