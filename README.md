# Cravy Yard

Cravy Yard is my restaurant discovery and review platform project. Customers can find restaurants, share reviews, and explore South Indian food, while restaurant owners and administrators can manage listings and platform content.

## What it does

- Browse, search, filter, and sort restaurant listings.
- View restaurant details, ratings, rating distributions, and customer reviews.
- Register and sign in as a customer.
- Create, edit, and delete your own restaurant reviews.
- Give restaurant owners access to manage an assigned restaurant.
- Give administrators tools to manage users, restaurants, owner accounts, and reviews.
- Store data in MongoDB and authenticate API requests with JWTs.

## Tech stack

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens; passwords are hashed with `bcryptjs`

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB Atlas database

## Run locally

### Configure and start the backend

In a VS Code terminal at the project root:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `MONGODB_URI` in `backend/.env` to your database connection string and replace `JWT_SECRET` with a private random value. Generate one with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not share or commit your `.env` file. Make sure MongoDB is running and reachable, then install dependencies and start the API:

```powershell
npm install
npm run dev
```

The API listens on `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it is running.

### Start the frontend

Open a second terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. During development, Vite forwards `/api` requests to the backend at `http://localhost:5000`.

## Demo accounts

On a fresh database, the backend seeds sample accounts and restaurants on startup. The sign-in page also provides quick-login buttons for the demo roles.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@platform.com` | `Admin@1234` |
| Owner | `owner.mario@platform.com` | `Owner@1234` |
| Owner | `owner.sakura@platform.com` | `Owner@1234` |
| Owner | `owner.priya@platform.com` | `Owner@1234` |
| Customer | `customer.alex@example.com` | `Customer@1234` |
| Customer | `customer.sarah@example.com` | `Customer@1234` |

These are development-only credentials. Do not use them in a deployed application.

The sample restaurant listings use fictional South Indian themes, with demo dishes such as dosa, idli, medu vada, pongal, appam, puttu, banana-leaf meals, and filter coffee.

### Important: seeding replaces database contents

The current `backend/seed.js` clears the `User`, `Restaurant`, and `Review` collections before recreating demo data. The backend also runs the seeder automatically when it connects to a database with no users. Use a dedicated, disposable learning database and back up any data you need before running `npm run seed`. Do not run it against a database containing data you want to keep.

Demo customer accounts already have sample reviews for some restaurants. The app allows one review per customer per restaurant, so those accounts should edit their existing review at those restaurants. Try another restaurant or create a new customer account to submit a first review.

To update the sample restaurants without clearing other collections, run this from the `backend` folder:

```powershell
npm run update:restaurants
```

The updater changes matching demo listings and adds or refreshes additional samples. It leaves users, reviews, and unrelated restaurants untouched. Refresh the frontend after it completes.

## Project structure

```text
backend/
  config/          MongoDB connection
  controllers/     Authentication, restaurant, review, and admin handlers
  middleware/      Authentication, validation, and error handling
  models/          User, restaurant, and review schemas
  routes/          Express API routes
  seed.js          Demo database seeder
  updateRestaurantBranding.js
                   Targeted update for South Indian demo listings
  server.js        API entry point
frontend/
  src/
    components/    Shared interface components
    context/       Authentication state
    pages/         Home, detail, sign-in, registration, and dashboards
    services/      API client
    App.jsx        Main application views
    index.css      Application styles
  vite.config.js   Development server and API proxy
postman_collection.json
```

## Review behavior

A customer can have one review for each restaurant. The API checks for an existing review, and MongoDB enforces uniqueness for each customer/restaurant pair. Customers can edit or delete their own reviews; administrators can remove reviews for moderation.

Ratings must be whole numbers from 1 to 5. Restaurant averages and rating distributions are calculated from stored reviews.

## API overview

All API routes start with `/api`.

| Endpoint | Methods | Access | Purpose |
| --- | --- | --- | --- |
| `/auth/register` | `POST` | Public | Register a customer |
| `/auth/login` | `POST` | Public | Sign in and receive a token |
| `/auth/me` | `GET` | Signed in | Get the current user |
| `/restaurants` | `GET` | Public | Browse and filter restaurants |
| `/restaurants` | `POST` | Admin | Create a restaurant |
| `/restaurants/:id` | `GET`, `PUT`, `DELETE` | Public / owner or admin | View or manage a restaurant |
| `/restaurants/:id/reviews` | `GET`, `POST` | Public / customer | List or submit restaurant reviews |
| `/reviews/:id` | `PUT`, `DELETE` | Review author / admin for delete | Update or remove a review |
| `/restaurants/owner/my-restaurant` | `GET` | Owner | View the owner's restaurant |
| `/admin/dashboard` | `GET` | Admin | View platform statistics |
| `/admin/users` | `GET` | Admin | Search and filter users |
| `/admin/owners` | `POST` | Admin | Create an owner account |
| `/admin/reviews` | `GET` | Admin | View reviews for moderation |
| `/health` | `GET` | Public | Check API availability |

For example requests, import `postman_collection.json` into Postman.

## Build the frontend

From the project root:

```powershell
npm run build
```

## Before deploying

- Use a private database and a unique, strong `JWT_SECRET`.
- Do not deploy the demo accounts or sample data.
- Restrict CORS to the frontend origins you intend to support.
- Configure production API and frontend URLs; the local Vite proxy is for development.
- Review authentication, access control, and environment settings for your deployment.
