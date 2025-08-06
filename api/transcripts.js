const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const translate = require('translate');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['https://oscar200442.github.io'] }));
app.use(express.json());

app.post('/transcripts', async (req, res) => {
  const { urls, targetLang = 'en' } = req.body;
  const transcripts = {};

  for (const url of urls) {
    const videoId = url.match(/(?:v=)([^&=?\s]{11})/)?.[1];
    if (!videoId) {
      transcripts[url] = 'Invalid YouTube URL';
      continue;
    }
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      let transcriptText = transcript.map(t => `${t.offset / 1000} --> ${(t.offset / 1000) + t.duration / 1000}\n${t.text}`).join('\n');
      if (targetLang !== 'en') {
        const lines = transcriptText.split('\n');
        const translatedLines = [];
        for (let i = 0; i < lines.length; i += 2) {
          const timeLine = lines[i];
          const textLine = lines[i + 1] || '';
          const translatedText = await translate(textLine, { to: targetLang });
          translatedLines.push(timeLine, translatedText);
        }
        transcriptText = translatedLines.join('\n');
      }
      transcripts[url] = transcriptText;
    } catch (error) {
      transcripts[url] = `Error: ${error.message}`;
    }
  }
  res.json(transcripts);
});

app.get('/transcripts', (req, res) => {
  res.json({ message: 'GET request received. Use POST to fetch transcripts.' });
});

module.exports = app;
