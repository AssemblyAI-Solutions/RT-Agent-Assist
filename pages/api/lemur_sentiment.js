// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY,
});

export default async function handler(req, res) {
    const { transcript } = req.body;

    if (!transcript) {
        res.status(400).json({ error: "Transcript is required" });
        return;
    }
    // get text from the transcript
    var inputText = ''

    for (var i = 0; i < transcript.length; i++) {
        var utt = transcript[i]
        if (utt.speaker == 'A') {
          inputText += 'Agent:\n' + utt.text + '\n'
        }
        else {
          inputText += 'Customer:\n' + utt.text + '\n'
        }
    }

    var prompt = `You are a helpful customer service agent assistant. Your job is to analyze the sentiment of the agent and customer during the phone call.
    I will provide you will a live transcript of the call.

    Return your answer in JSON like this "{"agent": <sentiment score out of 100>, "customer": <sentiment score out of 100>}".
    Return only your JSON and no preamble or sign-off.
    `

    const { response } = await client.lemur.task({
        input_text: inputText,
        prompt: prompt,
    })

    var sentiment = JSON.parse(response.replaceAll('\n', '').trim())
    res.send({response: sentiment})
}