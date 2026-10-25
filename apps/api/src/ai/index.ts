import { config } from '../config.js';
import type { AIProvider } from './types.js';
import { MockAIProvider } from './providers/mock.js';
import { OllamaAIProvider } from './providers/ollama.js';
import { OpenRouterAIProvider } from './providers/openrouter.js';

export function getAIProvider(overrideMock = false): AIProvider {
  if (overrideMock || config.AI_PROVIDER === 'mock') {
    return new MockAIProvider();
  }

  if (config.AI_PROVIDER === 'ollama') {
    return new OllamaAIProvider(config.OLLAMA_BASE_URL, config.AI_MODEL);
  }

  if (config.AI_PROVIDER === 'openrouter' && config.OPENROUTER_API_KEY) {
    return new OpenRouterAIProvider(config.OPENROUTER_API_KEY, config.AI_MODEL);
  }

  console.log('Defaulting to deterministic Mock AI Provider for robust execution.');
  return new MockAIProvider();
}

export * from './types.js';
export * from './aggregator/deterministic.js';
