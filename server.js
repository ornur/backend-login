const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const axios = require('axios');
const app = express();
const port = process.env.PORT;
const UserHistory = require('./model/userHistory'); // Import the UserHistory model/schema
const apiKey = process.env.OPENWEATHERMAP_API_KEY;
const path = require('path');
const unsplashApiKey = process.env.UNSPLASH_API_KEY; // Load your Unsplash API key from environment variables
const unsplashBaseUrl = 'https://api.unsplash.com';

// Connect to MongoDB Atlas
mongoose.connect(process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
const { Types: { ObjectId } } = require('mongoose');

// Middleware for session management
app.use(session ({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Middleware for parsing incoming request bodies
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err.message || 'Something went wrong!');
});

app.get('/', (req, res) => {
    const isAdmin = req.session.isAdmin;
    res.render('login', { isAdmin });
});

// Login post route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            // Store user ID and username in session
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.isAdmin = user.adminStatus; // Store admin status in session

            //if user is admin, redirect to admin page
            if (user.adminStatus) {
                res.redirect('/admin');
            } else {
                res.redirect('/main');
            }
        } else {
            res.send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Modify the /main route to pass the photoUrl and googleMapsApiKey variables
app.get('/main', async (req, res) => {
    const isAdmin = req.session.isAdmin;
    const photoUrl = ''; // Initialize photoUrl to an empty string
    const data = {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
        latitude: 51.509865,
        longitude:  -0.118092,
    };
    res.render('main', { weatherData: [], isAdmin: isAdmin, photoUrl: photoUrl, data});
});

app.post('/weather', async (req, res) => {
    const { city } = req.body;
    const username = req.session.username;

    try {
        // Make API call to retrieve weather data
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        const weatherData = weatherResponse.data;

        // Make API call to Unsplash to fetch a random photo based on weather description
        const unsplashResponse = await axios.get(`${unsplashBaseUrl}/search/photos`, {
            params: {
                query: weatherData.weather[0].description, // Use weather description as query
                client_id: unsplashApiKey,
                per_page: 30 // Fetch multiple photos to choose from
            }
        });

        const photos = unsplashResponse.data.results;
        const randomIndex = Math.floor(Math.random() * photos.length); // Generate a random index
        const photoData = photos[randomIndex]; // Get a random photo

        // Extract the photo URL
        const photoUrl = photoData.urls.regular;

        const data = {
            apiKey: process.env.GOOGLE_MAPS_API_KEY,
            latitude: weatherData.coord.lat,
            longitude: weatherData.coord.lon,
        };

        // Find user based on username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find user history data based on userId
        let userHistoryData = await UserHistory.findOne({ userId: user._id });

        if (!userHistoryData) {
            // If no entry exists, create a new one with an empty weatherData array
            userHistoryData = new UserHistory({ userId: user._id, username, weatherData: [weatherData], photoUrl: photoUrl });
        } else {
            // Ensure that weatherData is always an array
            userHistoryData.weatherData = userHistoryData.weatherData || [];
            // Push the new weather data to the weatherData array
            userHistoryData.weatherData.push(weatherData);
        }

        // Save the updated or new entry to the userhistories table
        await userHistoryData.save();
        // Render the main template with weatherData
        res.render('main', { weatherData: [weatherData], isAdmin: req.session.isAdmin, photoUrl, data});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.all('/history', async (req, res) => {
    try {
        const username = req.session.username; // Retrieve username from session

        // Find user based on username
        const user = await User.findOne({ username });

        if (!user) {
            // If user not found, handle error
            return res.status(404).send('User not found');
        }

        // Find user history data based on userId
        const userHistoryData = await UserHistory.findOne({ userId: user._id });

        if (!userHistoryData) {
            // If no entry exists, return an empty history array
            return res.render('history', { history: [] });
        }

        // Extract the weatherData array from userHistoryData
        const history = userHistoryData.weatherData || [];

        // Render the history template with history data
        res.render('history', { history, isAdmin: req.session.isAdmin, photoUrl: userHistoryData.photoUrl });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/admin', async (req, res) => {
    const isAdmin = req.session.isAdmin;
    if (req.session && isAdmin) {
        const users = await User.find({});
        // Render admin page with list of users
        res.render('admin', { users, isAdmin });
    } else {
        res.redirect('/');
    }
});


app.post('/admin/add', async (req, res) => {
    const { username, password } = req.body;

    try {        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await User.create({
            username,
            password: hashedPassword
        });

        res.redirect('/admin');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/admin/edit/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('edit', { user, isAdmin: req.session.isAdmin});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/admin/edit/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, password } = req.body;

    try {
        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user in database
        await User.updateOne({ _id: new ObjectId(userId) }, { $set: { username, password : hashedPassword } });

        res.redirect('/admin');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/admin/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Delete user from the user table
        await User.deleteOne({ _id: new ObjectId(userId) });

        // Delete user history from the UserHistory table based on userId
        await UserHistory.deleteMany({ userId: new ObjectId(userId) });

        res.redirect('/admin');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Logout route
app.all('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect the user to the login page after logout
            res.redirect('/');
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});