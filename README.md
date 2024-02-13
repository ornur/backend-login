# Assignment - 3: MongoDB and Deployment

## Overview
This individual assignment focuses on working with MongoDB and Deployment. The project includes developing a login page, admin panel, integrating APIs, and deploying the application.

## Features
1. **Login Page and Admin Panel:**
   - Develop a login page integrated with MongoDB Atlas.
   - Store user information including user ID, username, creation date, update date, deletion date, and admin status.
   - Implement an admin panel for managing users.

2. **API Integration:**
   - Integrated `OpenWeather API`, `Google Map API` and `Unplash API`.
   - In MongoDB Atlas database have table for user and their histories.

3. **Deployment:**
   - Deploy the project on a hosting service. I used `Microsoft Azure Virtual Machine` to get access my website
   
4. **Project Organization and Design:**
   - Maintain clean code and project structure.
   - Follow best practices for coding.
   - `Bootstrap` used
   
5. **Responsive Design and User Interface:**
   - Design visually appealing UI with EJS.
   - Implement a navigation bar for seamless redirection.

## Requirements
- The server must run on port `3000`.
- Grant IP access to Atlas from any location.

## Setup Instructions
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set environment variables for API keys.
4. Run the server using `npm start`.

## API Usage
- Provide instructions for API usage.
- Document endpoints and expected responses.
- create `.env` file into directory 
```bash
    PORT=3000
    mongoURI=YOUR-MONGODB-ATLAS
    SESSION_SECRET=ANY-WORD
    OPENWEATHERMAP_API_KEY=YOUR-API
    UNSPLASH_API_KEY=YOUR-API
    GOOGLE_MAPS_API_KEY=YOUR-API
```

## Admin Username and Password
- Admin username: Nurdaulet
- Admin password: In moodle

## Project Contributors
- Nurdaulet, Group SE-2201

## Links
- **Deployed Link:** http://20.82.148.215/
- **GitHub Repository:** https://github.com/ornur/backend-login
