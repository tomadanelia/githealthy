require('dotenv').config();
const { graphql } = require('@octokit/graphql');

require('dotenv').config();
const { encrypt, decrypt } = require('./utils/encryption');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { processRepoStats } = require('./services/agregator');
const { fetchGitHubData } = require('./services/graphql'); 

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://flowcheckfront.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY 
);
app.get('/auth/github', (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo read:org`;
  res.redirect(redirectUri);
});
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');

  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const { login, avatar_url } = userRes.data;
        const encryptedToken = encrypt(accessToken);

    const { error } = await supabase
      .from('github_users')
      .upsert({ 
        username: login, 
        avatar_url: avatar_url,
        access_token: encryptedToken,
        updated_at: new Date()
      });

    if (error) throw error;

   
    res.cookie('app_user', login, {
      httpOnly: true, 
      secure: false,  
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.redirect(`${process.env.FRONTEND_URL}?login=success`);

  } catch (error) {
    console.error('Auth Failed:', error);
    res.redirect(`${process.env.FRONTEND_URL}?login=failed`);
  }
});

app.get('/auth/me', async (req, res) => {
  const username = req.cookies.app_user;
  if (!username) return res.json({ user: null });

  const { data } = await supabase
    .from('github_users')
    .select('username, avatar_url')
    .eq('username', username)
    .single();

  res.json({ user: data });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('app_user');
  res.json({ success: true });
});
app.post('/api/analyze', async (req, res) => {
  try {
    const { owner, repo } = req.body;
    let token = req.body.token; 
    if (!token && req.cookies && req.cookies.app_user) {
      const { data } = await supabase
        .from('github_users')
        .select('access_token')
        .eq('username', req.cookies.app_user)
        .single();
        
      if (data && data.access_token) {
        try {
          token = decrypt(data.access_token);
        } catch (err) {
          console.error("Decryption failed:", err);
          return res.status(500).json({ error: "Failed to decrypt token. Please login again." });
        }
      }
    }

    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Please login or provide a PAT." });
    }

    const rawData = await fetchGitHubData(owner, repo, token);
    const analysis = processRepoStats(rawData);
    res.json(analysis);

  } catch (error) {
    console.error("Analyze Error:", error.message);
    const msg = error.response?.status === 404 ? "Repo not found or private." : error.message;
    res.status(500).json({ error: 'Failed to analyze', details: msg });
  }
});
app.get('/api/rate-limit', async (req, res) => {
  try {
    const token = process.env.GITHUB_PAT;
    const query = `
      query {
        rateLimit {
          limit
          remaining
          resetAt
          used
        }
      }
    `;
    
    const data = await graphql(query, {
      headers: { authorization: `token ${token}` }
    });
    
    res.json(data.rateLimit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});