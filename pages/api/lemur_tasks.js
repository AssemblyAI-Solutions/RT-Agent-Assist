// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY,
});

export default async function handler(req, res) {
    const { transcript } = req.body;
    const { previousNotes } = req.body;

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

    var prompt = `You are a helpful customer service agent assistant. Your job is to make suggestions for the agent during the phone call.
    I will provide you will a live transcript of the call and a list of the previous suggestions you made.

    You must only give the following suggestions if one of the following rules is true:
    - If customer says they live in an apartment or home, suggest that the agent ask if they own or rent.
    - If a customer says they are using an alternative service that isn't AT&T,suggest that the agent ask them what they don't like about their current service.
    - If a customer wants internet or cable service, suggest that the agent ask them if they'd be interested in bundling other services.
    
    Instructions:
    - Only include a suggestion if it meets the given rules.
    - Do not repeat suggestions you have already made.
    - Provide your suggestions in an JSON array format like this: {"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}.
    - Return the JSON and no preamble or sign-off.
    - If you have no suggestions, return an empty array.
    `

    if (previousNotes.length > 0) {
        prompt += 'Previous Suggestions:\n'
        for (var i = 0; i < previousNotes.length; i++) {
            prompt += previousNotes[i] + '\n'
        }
    }
    console.log(prompt)
    const { response } = await client.lemur.task({
        input_text: inputText,
        prompt: prompt,
    })
    var parsed = JSON.parse(response.replaceAll('\n', '').trim())

    res.send(parsed)
}