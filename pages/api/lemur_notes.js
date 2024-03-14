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
        Use the live transcript of the call to generate new notes for the agent.

        More Instructions:
        - Return your notes in a JSON array like this: {"notes": ["note 1", "note 2", "note 3"]}.
        - Return the JSON and no preamble or sign-off.
        - Only include notes about the customer and not about the agent's business.`
    }
    else {
      finalPrompt = `You are a helpful customer service agent assistant. Your job is to take notes for the agent during the phone call.
      Use the live transcript of the call to generate new notes for the agent.

      More Instructions:
      - Return your notes in a JSON array like this: {"notes": ["note 1", "note 2", "note 3"]}.
      - Return the JSON and no preamble or sign-off.
      - Only include notes about the customer and not about the agent's business.
      `
    }

    // removing this for now as passing previous notes to lemur is not improving the results
    // if (previousNotes.length > 0) {
    //   inputText += '\nPrevious Call Notes:\n'
    //     for (var i = 0; i < previousNotes.length; i++) {
    //       inputText += previousNotes[i] + '\n'
    //     }
    // }

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