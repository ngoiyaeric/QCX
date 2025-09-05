import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { openai } from '@ai-sdk/openai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { createXai } from '@ai-sdk/xai';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID(): string {
  return uuidv4();
}

export function getModel(modelId: string = 'default') {
  if (modelId !== 'default') {
    if (modelId === 'deepseek-r1') {
      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        const deepseek = createOpenAI({
          baseURL: 'https://api.deepseek.com/v1',
          apiKey: deepseekKey,
        });
        return deepseek('deepseek-r1');
      } else {
        console.warn("DeepSeek API key not set, falling back to default");
      }
    } else {
      console.warn("Unknown modelId " + modelId + ", falling back to default");
    }
  }

  const xaiApiKey = process.env.XAI_API_KEY
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const awsRegion = process.env.AWS_REGION
  const bedrockModelId = ''

  if (xaiApiKey) {
    const xai = createXai({
      apiKey: xaiApiKey,
      baseURL: 'https://api.x.ai/v1',
    })
    // Optionally, add a check for credit status or skip xAI if credits are exhausted
    try {
      return xai('grok-3-fast-beta')
    } catch (error) {
      console.warn('xAI API unavailable, falling back to OpenAI:')
    }
  }

  // AWS Bedrock

  if (awsAccessKeyId && awsSecretAccessKey) {
    const bedrock = createAmazonBedrock({
      bedrockOptions: {
        region: awsRegion,
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      },
    })
    const model = bedrock(bedrockModelId, {
      additionalModelRequestFields: { top_k: 350 },
    })
    return model
  }

  // Default fallback (OpenAI)
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  return openai('gpt-4o')
}