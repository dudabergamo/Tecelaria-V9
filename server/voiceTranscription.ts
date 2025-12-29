import OpenAI from 'openai';
import { ENV } from './_core/env';

const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: {
      value: audioBuffer,
      name: 'audio.webm',
    },
  });

  return response.text;
}
