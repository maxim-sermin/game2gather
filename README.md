# game2gather
Built with [Spring Boot](https://spring.io/) and [Angular](https://angular.io/)

Rate some games
![Rate games](screenshots/rate.PNG)

Choose players and find games you all like
![Match games](screenshots/match.PNG)

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