require('dotenv').config();
const { graphql } = require('@octokit/graphql');

const express = require('express');
const cors = require('cors'); 
const { processRepoStats } = require('./services/agregator');
const { fetchGitHubData } = require('./services/graphql'); 

const app = express();
app.use(cors()); 
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { owner, repo} = req.body;
    const token = process.env.GITHUB_PAT;
    if (!token) {
        return res.status(400).json({ error: "GitHub Token is required" });
    }

    const rawData = await fetchGitHubData(owner, repo, token);
    const analysis = processRepoStats(rawData);
    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze repo', details: error.message });
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