import { Configuration, OpenAIApi } from 'openai';
import {console} from "next/dist/compiled/@edge-runtime/primitives/console";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const basePromptPrefix =
    `
我想写一本书，我给你一个概括做提示，你帮我生成书籍名称。
内容:
`

const generateAction = async (req,res) => {
    console.log(`API: ${basePromptPrefix}${req.body.userInput}`)
    const baseCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${basePromptPrefix}${req.body.userInput}`,
        temperature: 0.7,
        max_tokens: 250,
    });
    const basePromptOutput = baseCompletion.data.choices.pop();
    console.log(`第一次返回的结果是:${basePromptOutput.text}`)

    // I build Prompt #2.
    const secondPrompt =
        `
  我给我的书起了一个名字，我给你一些线索，你帮我生成一篇文章.
  ${basePromptOutput.text} 
  大致内容: ${req.body.userInput}
  `
    console.log(`第二次提示: ${secondPrompt}`)

    // I call the OpenAI API a second time with Prompt #2
    const secondPromptCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${secondPrompt}`,
        // I set a higher temperature for this one. Up to you!
        temperature: 0.85,
        // I also increase max_tokens.
        max_tokens: 2580,
    });

    // Get the output
    const secondPromptOutput = secondPromptCompletion.data.choices.pop();
    res.status(200).json({ output: secondPromptOutput });

    // Send over the Prompt #2's output to our UI instead of Prompt #1's.

}

export default generateAction;