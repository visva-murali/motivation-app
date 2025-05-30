const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { pipeline } = require('transformers');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
let llamaPipeline;

(async () => {
  // Load model and tokenizer once at startup
  llamaPipeline = await pipeline('text-generation', 'meta-llama/Meta-Llama-3-8B-Instruct', {
    quantized: false, // set true if you want quantized model for less RAM
  });
})();

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
    const prompt = `You are a motivational coach. Based on the user's core 'whys' and motivations, generate a personalized, inspiring message.\nGenerate a motivational message for someone whose core motivations are: ${whys.join(', ')}`;
    if (!llamaPipeline) {
      return res.status(503).json({ error: 'Model is still loading, please try again in a moment.' });
    }
    const output = await llamaPipeline(prompt, { max_new_tokens: 200 });
    const motivation = output[0]?.generated_text?.replace(prompt, '').trim() || output[0]?.generated_text || '';
    
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