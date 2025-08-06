const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
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
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcripts[url] = transcript.map(t => `${t.offset / 1000} --> ${(t.offset / 1000) + t.duration / 1000}\n${t.text}`).join('\n');
    } catch (error) {
      transcripts[url] = `Error: ${error.message}`;
    }
  }
  res.json(transcripts);
});

module.exports = app;
