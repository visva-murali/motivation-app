
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Create user profile
app.post('/api/users', async (req, res) => {
  const { name, whys } = req.body;
  
  try {
    const user = await prisma.user.create({
      data: {
        name,
        whys: JSON.stringify(whys),
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate motivation
app.post('/api/generate-motivation/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
    });
    
    const whys = JSON.parse(user.whys);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a motivational coach. Based on the user's core 'whys' and motivations, generate a personalized, inspiring message."
        },
        {
          role: "user",
          content: `Generate a motivational message for someone whose core motivations are: ${whys.join(', ')}`
        }
      ],
      max_tokens: 200,
    });
    
    const motivation = completion.choices[0].message.content;
    
    // Save to database
    const saved = await prisma.motivation.create({
      data: {
        userId: user.id,
        content: motivation,
      },
    });
    
    res.json({ motivation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});