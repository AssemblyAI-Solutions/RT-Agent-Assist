// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY,
});

export default async function handler(req, res) {
    var { transcript } = req.body;
    const { previousNotes } = req.body;
    const { prompt } = req.body;

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

    var finalPrompt = ''
    if (prompt && prompt != '') {
        finalPrompt = prompt
        finalPrompt += `
        Use the live transcript of the call and a list of the previous suggestions. Do not repeat suggestions that have already been made.

        More Instructions:
        - Provide your suggestions in an JSON array format like this: {"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}.
        - Return the JSON and no preamble or sign-off.
        - If you have no suggestions, return an empty array.`
    }
    else {
      finalPrompt = `You are a helpful customer service agent assistant. Your job is to make suggestions for the agent during the phone call. Do not repeat suggestions that have already been made.

        You must only give the following suggestions if one of the following rules is true:
        - If customer says they live in an apartment or home, suggest that the agent ask if they own or rent.
        - If a customer says they are using an alternative service that isn't AT&T,suggest that the agent ask them what they don't like about their current service.
        - If a customer wants internet or cable service, suggest that the agent ask them if they'd be interested in bundling other services.
        
        Use the live transcript of the call and a list of the previous suggestions. Do not repeat suggestions that have already been made.

        More Instructions:
        - Provide your suggestions in an JSON array format like this: {"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}.
        - Return the JSON and no preamble or sign-off.
        - If you have no suggestions, return an empty array.`
    }

    if (previousNotes.length > 0) {
      inputText += '\nPrevious Agent Suggestions:\n'
        for (var i = 0; i < previousNotes.length; i++) {
          inputText += previousNotes[i] + '\n'
        }
    }
    
    console.log(finalPrompt)

    const { response } = await client.lemur.task({
        input_text: inputText,
        prompt: finalPrompt,
    })

    try {
      var cleanRes = response.replaceAll('\n', '').trim()
      cleanRes = '{' + cleanRes.split('{')[1]
      var parsed = JSON.parse(cleanRes)
    }
    catch (e) {
      console.log(e)
      res.status(400).json({ error: response });
      return;
    }

    res.send(parsed)
}