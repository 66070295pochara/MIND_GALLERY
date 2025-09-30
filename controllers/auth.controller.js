
import { cognito, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand } from "../config/aws.js";
import axios from "axios";
import qs from "querystring";
import { secretHash } from "../utils/secretHash.js";

function setAccessCookie(res, token, maxAgeSec) {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeSec * 1000,
    path: "/",
  });
}


export const renderSignup = (req, res) => res.render("signup", { title: "Sign Up" });

export const signup = async (req, res) => {
  const { username, password, email, name } = req.body;
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
    SecretHash: secretHash(username),
  };
  try {
    await cognito.send(new SignUpCommand(params));
    res.json({ message: "Sign up successful! Please check your email for verification." });
  } catch (err) {
    return res.status(400).json({ error: "Error during sign up: " + err.message });
  }
};


export const renderConfirm = (req, res) => res.render("confirm", { title: "Confirm Sign Up" });

export const confirm = async (req, res) => {
  const { username, code } = req.body;
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
    SecretHash: secretHash(username),
  };
  try {
    await cognito.send(new ConfirmSignUpCommand(params));
    res.json({ message: "Confirmation successful! You can now log in." });
  } catch (err) {
    return res.status(400).json({ error: "Error during confirmation: " + err.message });
  }
};


export const renderLogin = (req, res) => res.render("login", { title: "Log In" });

export const login = async (req, res) => {
  const { username, password } = req.body;
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash(username),
    },
  };
  try {
    const data = await cognito.send(new InitiateAuthCommand(params));
    const { AccessToken, ExpiresIn } = data.AuthenticationResult;
    setAccessCookie(res, AccessToken, ExpiresIn);
    // สำหรับ API/Frontend SPA: ส่ง JSON กลับ
    res.json({ message: "Login successful", username });
    // ถ้าเป็น SSR/redirect ให้ใช้ return res.redirect(...)
  } catch (err) {
    return res.status(400).json({ error: "Error during login: " + err.message });
  }
};


export const logout = (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.redirect("/login");
};


export const oauthCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      `https://${process.env.COGNITO_DOMAIN}/oauth2/token`,
      qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.COGNITO_CLIENT_ID,
        code,
        redirect_uri: process.env.COGNITO_REDIRECT_URI || "http://localhost:3000/auth/callback",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = tokenRes.data;
    setAccessCookie(res, access_token, expires_in);
    return res.redirect("/owngallery");
  } catch (e) {
    console.error(e.response?.data || e);
    return res.status(400).send("Callback exchange failed");
  }
};
