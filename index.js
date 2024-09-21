// Import the express and fetch libraries
const express = require('express');
// const fetch = require("node-fetch");
const API_KEY = 'b8hleghbkqen93okdfh6464u'; // also called as clientId
const REDIRECT_URI = 'https://app.sellerpundit.com/profile';


// Create a new express application
const app = express();

// Test API key
app.get('/ping', async (req, res) => {
    const requestOptions = {
        'method': 'GET',
        'headers': {
            'x-api-key': API_KEY,
        },
    };

    const response = await fetch(
        'https://api.etsy.com/v3/application/openapi-ping',
        requestOptions
    );

    console.log("Response: ", response)

    if (response.ok) {
        const data = await response.json();
        console.log("Data: ", data)
        res.send(data);
    } else {
        // Log http status to the console
        console.log(response.status, response.statusText);

        // For non-500 errors, the endpoints return a JSON object as an error response
        const errorData = await response.json();
        console.log(errorData);
        res.send("oops");
    }
});

// Generate OAuth URL
app.get('/token', async (req, res) => {
    const response = await fetch(`https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${REDIRECT_URI}&scope=transactions_r%20transactions_w&client_id=${API_KEY}&state=superstate&code_challenge=DSWlW2Abh-cf8CeLL8-g3hQ2WQyYdKyiu83u_s7nRhI&code_challenge_method=S256`);

    console.log("Response: ", response);
})

// Get token from Etsy via auth code received
app.get("/oauth/redirect", async (req, res) => {
    // The req.query object has the query params that Etsy authentication sends
    // to this route. The authorization code is in the `code` param
    const authCode = req.query.code;
    const tokenUrl = 'https://api.etsy.com/v3/public/oauth/token';
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: API_KEY,
            redirect_uri: REDIRECT_URI,
            code: authCode,
            code_verifier: clientVerifier,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(tokenUrl, requestOptions);

    // Extract the access token from the response access_token data field
    if (response.ok) {
        const tokenData = await response.json();
        res.send(tokenData);
    } else {
        // Log http status to the console
        console.log(response.status, response.statusText);

        // For non-500 errors, the endpoints return a JSON object as an error response
        const errorData = await response.json();
        console.log(errorData);
        res.send("oops");
    }
});

// Get user first name
app.get("/welcome", async (req, res) => {
    // We passed the access token in via the querystring
    const { access_token } = req.query;

    // An Etsy access token includes your shop/user ID
    // as a token prefix, so we can extract that too
    const user_id = access_token.split('.')[0];

    const requestOptions = {
        headers: {
            'x-api-key': API_KEY,
            // Scoped endpoints require a bearer token
            Authorization: `Bearer ${access_token}`,
        }
    };

    const response = await fetch(
        `https://api.etsy.com/v3/application/users/${user_id}`,
        requestOptions
    );

    if (response.ok) {
        const userData = await response.json();
        // Load the template with the first name as a template variable.
        res.render("welcome", {
            first_name: userData.first_name
        });
    } else {
        // Log http status to the console
        console.log(response.status, response.statusText);

        // For non-500 errors, the endpoints return a JSON object as an error response
        const errorData = await response.json();
        console.log(errorData);
        res.send("oops");
    }
});

// Get refresh token
app.get("/refreshToken", async (req, res) => {
    try {
        const refresh_token = "sdsf";
        const response = await fetch(`https://api.etsy.com/v3/public/oauth/token?grant_type=refresh_token&client_id=${API_KEY}&refresh_token=${refresh_token}`);
        if (response.ok) {
            console.log("Refresh token data: ", response)
            const data = response.json();
            console.log("Data: ", data)
        }
        else {
            console.log(response.status, response.statusText);

            // For non-500 errors, the endpoints return a JSON object as an error response
            const errorData = await response.json();
            console.log(errorData);
            res.send("oops");
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Internal server error");
    }
})

// Get all active listings

app.get('/getActiveListings', async (req, res) => {
    const API_KEY = 'your_api_key_here';
    const limit = 100; 
    const sort_on = 'created'; 
    const sort_order = 'desc';

    const url = `https://api.etsy.com/v3/application/listings/active?api_key=${API_KEY}&limit=${limit}&sort_on=${sort_on}&sort_order=${sort_order}`;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            console.log("Data: ", data);
            res.json(data); // Send the data back to the client
        } else {
            console.log("Response was not successful");
            res.status(response.status).send("Failed to fetch listings");
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start the server on port 3003
const port = 3003;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});