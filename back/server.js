const express = require('express');
const { processRepoStats } = require('./services/aggregator');
const { fetchRepoStats } = require('./services/githubGraphql');

const app = express();
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { owner, repo, token } = req.body;
    const rawData = await fetchRepoStats(owner, repo, token);
    const analysis = processRepoStats(rawData);
    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze repo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
