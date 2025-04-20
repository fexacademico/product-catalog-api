// Copyright © 2025 Felix Lee Pan
// All rights reserved. Unauthorized copying, modification, or distribution of this software is prohibited.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { idea } = req.body;

  if (!idea) return res.status(400).json({ error: 'Prompt no proporcionado' });

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: idea,
        n: 1,
        size: '512x512'
      })
    });

    const data = await response.json();
    res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    res.status(500).json({ error: 'Error al comunicarse con OpenAI' });
  }
});

app.post('/describe', async (req, res) => {
  const { features } = req.body;

  if (!features) return res.status(400).json({ error: 'Texto no proporcionado' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Actúa como un redactor profesional de catálogos de productos. Mejora textos para que suenen persuasivos y claros.'
          },
          {
            role: 'user',
            content: features
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json({ description: data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Error al comunicarse con OpenAI' });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
