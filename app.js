const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { Issuer, generators } = require('openid-client');
const crypto = require('crypto');
const app = express();
app.use(express.json());
// let client;
// // Initialize OpenID Client
// async function initializeClient() {
//     const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2gbAkvO36');
//     client = new issuer.Client({
//         client_id: 'pe9oa47b42at3jqvdk088u2io',
//         client_secret: '<client secret>',
//         redirect_uris: ['https://d84l1y8p4kdic.cloudfront.net'],
//         response_types: ['code']
//     });
// };
// initializeClient().catch(console.error);
// app.use(session({
//     secret: 'some secret',
//     resave: false,
//     saveUninitialized: false
// }));

// const checkAuth = (req, res, next) => {
//     if (!req.session.userInfo) {
//         req.isAuthenticated = false;
//     } else {
//         req.isAuthenticated = true;
//     }
//     next();
// };
// app.get('/', checkAuth, (req, res) => {
//     res.render('home', {
//         isAuthenticated: req.isAuthenticated,
//         userInfo: req.session.userInfo
//     });
// });
// app.get('/login', (req, res) => {
//     const nonce = generators.nonce();
//     const state = generators.state();

//     req.session.nonce = nonce;
//     req.session.state = state;

//     const authUrl = client.authorizationUrl({
//         scope: 'phone openid email',
//         state: state,
//         nonce: nonce,
//     });

//     res.redirect(authUrl);
// });
// // Helper function to get the path from the URL. Example: "http://localhost/hello" returns "/hello"
// function getPathFromURL(urlString) {
//     try {
//         const url = new URL(urlString);
//         return url.pathname;
//     } catch (error) {
//         console.error('Invalid URL:', error);
//         return null;
//     }
// }

// app.get(getPathFromURL('https://d84l1y8p4kdic.cloudfront.net'), async (req, res) => {
//     try {
//         const params = client.callbackParams(req);
//         const tokenSet = await client.callback(
//             'https://d84l1y8p4kdic.cloudfront.net',
//             params,
//             {
//                 nonce: req.session.nonce,
//                 state: req.session.state
//             }
//         );

//         const userInfo = await client.userinfo(tokenSet.access_token);
//         req.session.userInfo = userInfo;

//         res.redirect('/');
//     } catch (err) {
//         console.error('Callback error:', err);
//         res.redirect('/');
//     }
// });
// // Logout route
// app.get('/logout', (req, res) => {
//     req.session.destroy();
//     const logoutUrl = `https://<user pool domain>/logout?client_id=pe9oa47b42at3jqvdk088u2io&logout_uri=<logout uri>`;
//     res.redirect(logoutUrl);
// });

require('dotenv').config();

function secretHash(username) {
  return crypto
    .createHmac('sha256', process.env.COGNITO_CLIENT_SECRET)  // ใช้ secret
    .update(username + process.env.COGNITO_CLIENT_ID)         // concat username+clientId
    .digest('base64');                                        // แปลงเป็น Base64
}


AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: new AWS.Credentials(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.AWS_SESSION_TOKEN ,// ต้องมี
  ),
});


const cognito = new AWS.CognitoIdentityServiceProvider();

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'mam01', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    }else {
            res.sendStatus(401);
        }
    };
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID, // อ่านจาก .env
    Username: username,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
       { Name: 'name', Value: username }
    ],SECRET_HASH: secretHash(username),
  };

  try {
    const data = await cognito.signUp(params).promise();
    res.json({ message: 'User signed up successfully', data });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/confirm', async (req, res) => {
    const { username, confirmationCode } = req.body;

    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: username,
        ConfirmationCode: confirmationCode,
        SECRET_HASH: secretHash(username),
    };
    try {
        const data = await cognito.confirmSignUp(params).promise();
        res.json({ message: 'User confirmed successfully', data });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash(username),
        }
    };
    try {
       const data = await cognito.initiateAuth(params).promise();
        
        res.json({
        message: 'User logged in successfully',
        tokens: data.AuthenticationResult //AccessToken, IdToken, RefreshToken
    });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/homepage', authenticateJWT, (req, res) => {
    res.json({ message: `Welcome to the homepage, ${req.user.username}!` });
});



app.set('view engine', 'ejs');
app.listen(3000, () => console.log('Server running on http://localhost:3000'));