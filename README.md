This is a simple repo to collect prompts, examples, benchmarks and other useful resources for LLM-based transcription and diarization.

# Comparisons

To run the comparisons, run `bun comparisons/compare.ts` - or look at `comparisons/results.txt`. The WER estimation is based on using [Myer's Diff](https://www.nathaniel.ai/myers-diff/) to get references points and then compare. This isn't the proper way to do this, but the relative differences should hold. YMMV and IANA Specialist in this field :)

# Prompts

## Transcription

Here's the simple prompt we're using for transcription:

```
Transcribe this audio file in its entirety.
```

This prompt significantly improves the word error rate on some audio files:

```
Here is audio of someone speaking. Transcribe the whole thing for me, correcting for possible mistranscriptions based on your understanding.
```

Likely could be made a lot better, but this is a good start.

## Diarization

This is Google's suggested prompt.

```
Generate audio diarization, including transcriptions and speaker information for each transcription, for this interview. Organize the transcription by the time they happened.
```

Works really well, but hard to clean out the non-transcription parts or use as structured data.

From [@zhanghaoxxxx on Twitter](https://x.com/zhanghaoxxxx/status/1845960480248213551):

```
Please transcribe the audio file into lrc format, separating each speaker’s dialogue by labeling them as Speaker 1, Speaker 2, etc. Ensure that all spoken content is clearly segmented and each speaker is identified.
```

This works much better, but you can modify it for video files to identify speaker names (if it's in the video):

```
Please transcribe the video file into lrc format, separating each speaker’s dialogue by labeling them as with the appropriate names from the video. Ensure that all spoken content is clearly segmented and each speaker is identified.
```

If you want proper structured data, you can use the JSON prompt below with the schema. This is good at identifying speakers and returning good structured data, but for some reason punctuation keeps getting left out compared to the other methods.

`````
Transcribe this for me, following this typespec:

\`\`\`typescript
type Transcript = {
  title: string;
  speakerNames: string[];
  transcript: {
    speaker: name;
    startTime: number;
    text: string;
  }[];
}
\`\`\````

Respond only in JSON.
`````

Use this Schema:

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "speakerNames": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "transcript": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "speaker": {
            "type": "string"
          },
          "startTime": {
            "type": "number"
          },
          "text": {
            "type": "string"
          }
        },
        "required": ["speaker", "startTime", "text"]
      }
    }
  },
  "required": ["title", "speakerNames", "transcript"]
}
```
