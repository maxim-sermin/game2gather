# game2gather
A web app where you and your friends can find games you would like to play together

## Running locally
### Database
- Spin up any SQL database (tested with PostgreSQL)
### Backend
- Set environment variables:
  - DATABASE_URL=postgres://game2gather-user:secret_pw@localhost:5432/game2gather
  - FRONTENDURLS=http://localhost:4200
- Run with ".\gradlew.bat bootRun"
### UI
- Make sure backend is already running
- Run `npm start` for a dev server. Navigate to `http://localhost:4200/`