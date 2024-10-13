const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireJwtAuth } = require('~/server/middleware/');
const { speechToText } = require('~/server/services/Files/Audio');
const WebSocket = require('ws');

const upload = multer();

router.post('/', requireJwtAuth, upload.single('audio'), async (req, res) => {
  await speechToText(req, res);
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const audioBuffer = Buffer.from(message);
    const req = { file: { buffer: audioBuffer } };
    const res = {
      json: (data) => ws.send(JSON.stringify(data)),
      status: (statusCode) => ({
        json: (data) => ws.send(JSON.stringify({ statusCode, ...data })),
      }),
    };
    await speechToText(req, res);
  });
});

module.exports = { router, wss };
