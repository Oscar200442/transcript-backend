const express = require('express');
const YouTubeTranscriptApi = require('youtube-transcript-api');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['https://oscar200442.github.io'] }));
app.use(express.json());

app.post('/transcripts', async (req, res) => {
  const { urls } = req.body;
  const transcripts = {};

  for (const url of urls) {
    const videoId = url.match(/(?:v=)([^&=?\s]{11})/)?.[1];
    if (!videoId) {
      transcripts[url] = 'Invalid YouTube URL';
      continue;
    }
    try {
      const transcript = await YouTubeTranscriptApi.getTranscript(videoId);
      transcripts[url] = transcript.map(t => `${t.start.toFixed(2)} --> ${(t.start + t.duration).toFixed(2)}\n${t.text}`).join('\n');
    } catch (error) {
      transcripts[url] = `Error: ${error.message}`;
    }
  }
  res.json(transcripts);
});

module.exports = app;
