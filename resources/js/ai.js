require('dotenv').config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env_var.GEMINI_API_KEY);

async function generateClue(word) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = `
Your job is to create a crossword clue for the word "${word}". Make sure to follow all of the following:
- Only generate the clue, without any other response. This includes any validation that you received this prompt, the length of the word, or any other unnecessary additions.
- Make sure the clue is correct and fits a definition of the word. The clue could reference clever meanings of the word, puns, pop culture references involving the word, or other creative usages of the word. Just make sure that the clue is correct and relevant, and that it encapsulates a well-known understanding of the word.
- Limit the clue to one sentence.
- Make the clue simple enough so that an average middle schooler would be able to get the word.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

console.log(process.env.AUTH_TOKEN);