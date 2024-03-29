// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY,
});

export default async function handler(req, res) {
    var { transcript } = req.body;

    if (!transcript) {
        res.status(400).json({ error: "Transcript is required" });
        return;
    }
    // get text from the transcript
    var inputText = ''

    transcript = transcript.sort((a, b) => a.audio_start - b.audio_start)

    for (var i = 0; i < transcript.length; i++) {
        var utt = transcript[i]
        if (utt.speaker == 'A') {
          inputText += 'Agent:\n' + utt.text + '\n'
        }
        else {
          inputText += 'Customer:\n' + utt.text + '\n'
        }
    }

    var prompt = `You are a helpful customer service agent assistant. Your job is to analyze the sentiment of the agent and customer during the phone call using the live transcript.

    Sentiment score is out of 100.
    Positive sentiment is 70-100.
    Neutral sentiment is 40-60.
    Negative sentiment is 0-30.

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