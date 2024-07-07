require('dotenv').config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env_var.GEMINI_API_KEY);

async function generateClue(word) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = `
Your job is to create a crossword clue for the word(s) "${word}". Make sure to follow all of the following:
- Only generate the clue, without any other response. This includes any validation that you received this prompt, the length of the word(s), or any other unnecessary additions.
- Make sure the clue is correct and fits a definition of the word(s). The clue could reference clever meanings of the word(s), puns, pop culture references involving the word(s), or other creative usages of the word(s). Just make sure that the clue is correct and relevant, and that it encapsulates a well-known understanding of the word(s).
- If the word(s) is generally obscure, use wordplay or a pun to make the clue more accessible. For example, if the word is "kat", you could say "___niss Everdeen".
- If the word(s) doesn't make sense, it could be used as an acronym. For example, "lac" could be "Acronym for NBA team Clippers".
- Limit the clue to one sentence.
- Make the clue simple enough so that an average middle schooler would be able to get the word.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

console.log(process.env.AUTH_TOKEN);