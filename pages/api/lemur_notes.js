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

    var prompt = `You are a helpful customer service agent assistant. Your job is to take dilligent notes for the agent during the phone call.
    I will provide you will a live transcript of the call and the previous notes you took.

    Instructions:
    - Return your notes in a JSON array like this: {"notes": ["note 1", "note 2", "note 3"]}.
    - Return the JSON and no preamble or sign-off.
    - Only include notes about the customer and not about the agent's business.
    - Do not repeat new notes that are already included in the previous notes.
    `

    if (previousNotes.length > 0) {
        prompt += 'Previous Notes:\n'
        for (var i = 0; i < previousNotes.length; i++) {
            prompt += previousNotes[i] + '\n'
        }
    }
    const { response } = await client.lemur.task({
        input_text: inputText,
        prompt: prompt,
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