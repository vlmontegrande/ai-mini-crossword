require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  try {
    const { words } = req.body;
    let model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `
    Your job is to create crossword clues for the 6 words "${words}". Make sure to follow all of the following:
    - Use this JSON schema:
    { 
      "type": "object",
      "properties": {
        "clues": { 
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "word": { "type": "string" },
              "clue": { "type": "string" }
            },
            "required": ["word", "clue"]
          }
        }
      },
      "required": ["clues"]
    }
    - Only generate the clues, without any other response. This includes any validation that you received this prompt, the length of the words, or any other unnecessary additions.
    - Make sure the clues are correct and fits a definition of the word. The clues could reference clever meanings of the word, puns, pop culture references involving the word, or other creative usages of the word. Just make sure that the clues are correct and relevant, and that they encapsulates a well-known understanding of the words.
    - Limit the clues to one sentence.
    - Make the clues simple enough so that an average middle schooler would be able to get the words.
    `;

    /*const prompt = `
    Your job is to create a crossword clue for the word "${word}". Make sure to follow all of the following:
    - Only generate the clue, without any other response. This includes any validation that you received this prompt, the length of the word, or any other unnecessary additions.
    - Make sure the clue is correct and fits a definition of the word. The clue could reference clever meanings of the word, puns, pop culture references involving the word, or other creative usages of the word. Just make sure that the clue is correct and relevant, and that it encapsulates a well-known understanding of the word.
    - Limit the clue to one sentence.
    - Make the clue simple enough so that an average middle schooler would be able to get the word.
    `;*/
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    res.json({ text });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: `We are unable to generate a crossword clue at this time. Please try again later. ${error.statusText && "Server error status: " + error.statusText}${error.errorDetails && error.errorDetails.length > 0 ? "\n Server error details: " + error.errorDetails.map(detail => detail.reason).join("\n") : ""}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




/*const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});
const prompt = "Give me a short summary of this lecture: " + data;
const result = await model.generateContent(prompt);
const response = await result.response;
const text = await response.text();
return text

app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    const result = await model.generateContent([
      "What is in this photo?",
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/png'
        }
      }
    ]);
    res.json({ text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});*/
