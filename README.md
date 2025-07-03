# Subscription Tracker API

A RESTful API backend built with Node.js, Express, and MongoDB to manage user authentication, subscriptions, and workflows for reminders. This API supports user registration, login, subscription CRUD, upcoming renewals, and automatic email reminders for subscription renewals.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
- [API Routes](#api-routes)  
- [Authentication](#authentication)  
- [Workflow & Reminders](#workflow--reminders)  
- [Error Handling](#error-handling)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- User registration, login, and logout with JWT authentication  
- CRUD operations for managing subscriptions (create, read, update, delete)  
- View subscriptions filtered by user  
- Get upcoming renewals within the next 7 days  
- Cancel subscriptions (soft delete)  
- Automated email reminders sent at 7, 5, 2, and 1 day before renewal using Upstash Workflows 
- Integrated rate-limiting and bot protection to secure API endpoints 
- JWT-based authentication and protected routes  
- Error handling middleware for consistent API error responses  

---

## Tech Stack

- Node.js  
- Express  
- MongoDB (with Mongoose)  
- JWT for authentication  
- Bcrypt for password hashing  
- Upstash Workflows for subscription reminders  
- Rate-limiting and bot protection via Arcjet
- Day.js for date handling  
- Cookie-parser middleware  
- ES Modules (import/export syntax)  

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)  
- MongoDB instance (local or cloud, e.g., MongoDB Atlas)  
- Upstash account for Workflow integration (optional, required for reminders)  

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/subscription-tracker-api.git
cd subscription-tracker-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up the environment variables as described in the next section.

4. Start the server:

```bash
npm run dev
```
The server will run at `http://localhost:<PORT>`. The default port is typically `3000` or as set in your environment.

## Environment Variables
Create a .env file in the root directory or configure your environment variables:

```.env
PORT=3000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

SERVER_URL=http://localhost:3000

UPSTASH_WORKFLOW_URL=your_upstash_workflow_url
UPSTASH_TOKEN=your_upstash_token
```

`PORT`: Server port

`MONGODB_URI`: MongoDB connection string

`JWT_SECRET`: Secret key for JWT signing

`JWT_EXPIRES_IN`: JWT expiration duration (e.g., 1d, 12h)

`SERVER_URL`: Base URL for the server (used for workflow triggers)

`UPSTASH_WORKFLOW_URL`: For Upstash Workflow integration

`UPSTASH_TOKEN` : Upstash authentication token  

## API Routes
All API routes are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint                | Description         | Protected |
| ------ | ----------------------- | ------------------- | --------- |
| POST   | `/api/v1/auth/sign-up`  | Register a new user | No        |
| POST   | `/api/v1/auth/sign-in`  | Login a user        | No        |
| POST   | `/api/v1/auth/sign-out` | Logout a user       | No        |

This API uses JWT tokens for authentication. After signing in or signing up, you receive a token which must be included in requests requiring authorization.

Example successful login response:
```json
{
  "success": true,
  "token": "your_jwt_token_here",
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
  ```

### Users

| Method | Endpoint            | Description             | Protected |
| ------ | ------------------- | ----------------------- | --------- |
| GET    | `/api/v1/users`     | Get all users           | Yes       |
| GET    | `/api/v1/users/:id` | Get a specific user     | Yes       |
| PUT    | `/api/v1/users/:id` | Update user (self only) | Yes       |
| DELETE | `/api/v1/users/:id` | Delete user (self only) | Yes       |


### Subscriptions

| Method | Endpoint                                  | Description                                       | Protected |
| ------ | ----------------------------------------- | ------------------------------------------------- | --------- |
| GET    | `/api/v1/subscriptions`                   | Get all subscriptions of logged-in user           | Yes       |
| GET    | `/api/v1/subscriptions/user/:id`          | Get subscriptions for a specific user (self only) | Yes       |
| GET    | `/api/v1/subscriptions/:id`               | Get subscription details                          | Yes       |
| POST   | `/api/v1/subscriptions`                   | Create a new subscription                         | Yes       |
| PUT    | `/api/v1/subscriptions/:id`               | Update a subscription                             | Yes       |
| DELETE | `/api/v1/subscriptions/:id`               | Delete a subscription                             | Yes       |
| PUT    | `/api/v1/subscriptions/:id/cancel`        | Cancel (soft delete) a subscription               | Yes       |
| GET    | `/api/v1/subscriptions/upcoming-renewals` | List subscriptions renewing within 7 days         | Yes       |


## Authentication

This API uses JWT tokens for authentication. After signing in or signing up, you receive a token which must be included in requests requiring authorization.

Add the following header in your HTTP requests to protected endpoints:
```http
Authorization: Bearer <token>
```

## Workflow & Reminders

Subscription renewal reminders are managed by an Upstash Workflow that sends email reminders at intervals (7, 5, 2, and 1 day before the renewal date). When you create a subscription, the workflow is triggered automatically.

You can customize the email sending logic inside `utils/send-email.js` and the workflow logic inside `workflow.controller.js`.


## Error Handling

Errors are handled via centralized middleware (`error.middleware.js`) to return consistent JSON responses with appropriate HTTP status codes and messages.

Example error response:
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for bug reports and feature requests.

## License
This project is licensed under the MIT License.
