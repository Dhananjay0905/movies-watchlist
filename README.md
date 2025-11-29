# 🎬 MovieWatchlist

A full-stack application to search for movies, view details (Cast, Director, Overview), and save them to a personal watchlist.

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** IBM Cloudant (CouchDB)
- **Auth:** IBM App ID
- **Deployment:** Docker & IBM Code Engine

## How to Run (Docker)
1. Create a `.env` file in the `server` folder with your IBM credentials.
2. Run:
   ```bash
   docker build -t movie-app .
   docker run -p 3000:3000 --env-file ./server/.env movie-app
   