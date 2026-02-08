import OpenAI from 'openai';
import { requireCapability } from '@/lib/env.server';

// Lazy initialization — throws ProviderNotConfiguredError if OPENAI_API_KEY is missing
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  requireCapability('ai');
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openai;
}

export interface AIGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIGenerationResult {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

/**
 * Generate text content using OpenAI
 */
export async function generateText(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<AIGenerationResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to environment variables.');
  }

  const model = options.model || 'gpt-4o';
  const maxTokens = options.maxTokens || 2000;
  const temperature = options.temperature || 0.7;

  try {
    const response = await getOpenAI().chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage!;

    // Calculate cost (GPT-4o pricing as of 2024)
    const inputCost = (usage.prompt_tokens / 1_000_000) * 2.5;
    const outputCost = (usage.completion_tokens / 1_000_000) * 10;
    const totalCost = inputCost + outputCost;

    return {
      content,
      tokensUsed: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      cost: totalCost,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
    throw new Error(errorMessage);
  }
}

/**
 * Generate JSON-formatted content using OpenAI
 */
export async function generateJSON<T = unknown>(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<{
  data: T;
  tokensUsed: { prompt: number; completion: number; total: number };
  cost: number;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const model = options.model || 'gpt-4o';
  const maxTokens = options.maxTokens || 2000;

  try {
    const response = await getOpenAI().chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const data = JSON.parse(content);
    const usage = response.usage!;

    const inputCost = (usage.prompt_tokens / 1_000_000) * 2.5;
    const outputCost = (usage.completion_tokens / 1_000_000) * 10;

    return {
      data,
      tokensUsed: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      cost: inputCost + outputCost,
    };
  } catch (error) {
    console.error('OpenAI JSON error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate JSON';
    throw new Error(errorMessage);
  }
}
