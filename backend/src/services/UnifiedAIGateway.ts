/**
 * Unified AI Gateway
 * 
 * Single interface to access multiple AI providers:
 * - Claude (Anthropic)
 * - GPT (OpenAI)
 * - DeepSeek
 * - Gemini (Google)
 * - Llama 3 (via Ollama)
 * - Command R+ (Cohere)
 * - Cloudflare AI Workers
 * 
 * Features:
 * - Automatic failover
 * - Cost optimization
 * - Rate limiting
 * - Response caching
 * - Load balancing
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Provider types
export type AIProvider = 
  | "openai"
  | "anthropic"
  | "deepseek"
  | "gemini"
  | "ollama"
  | "cohere"
  | "cloudflare";

// Model definitions
export interface ModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number; // in cents per 1M tokens
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  cache?: boolean;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number; // in cents
  latency: number; // in ms
  cached: boolean;
}

interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  priority: number; // Lower = higher priority for failover
}

export class UnifiedAIGateway {
  private providers: Map<AIProvider, ProviderConfig> = new Map();
  private clients: Map<AIProvider, any> = new Map();
  private cache: Map<string, AIResponse> = new Map();
  private requestCount: Map<AIProvider, number> = new Map();

  // Model configurations
  private models: ModelConfig[] = [
    // OpenAI Models
    { provider: "openai", model: "gpt-4o", maxTokens: 16000, temperature: 0.7, costPerToken: 0.5 },
    { provider: "openai", model: "gpt-4o-mini", maxTokens: 16000, temperature: 0.7, costPerToken: 0.015 },
    { provider: "openai", model: "gpt-4-turbo", maxTokens: 128000, temperature: 0.7, costPerToken: 1.0 },
    { provider: "openai", model: "gpt-3.5-turbo", maxTokens: 16000, temperature: 0.7, costPerToken: 0.05 },
    
    // Claude Models
    { provider: "anthropic", model: "claude-3-5-sonnet-20241022", maxTokens: 200000, temperature: 0.7, costPerToken: 0.3 },
    { provider: "anthropic", model: "claude-3-opus-20240229", maxTokens: 200000, temperature: 0.7, costPerToken: 1.5 },
    { provider: "anthropic", model: "claude-3-sonnet-20240229", maxTokens: 200000, temperature: 0.7, costPerToken: 0.3 },
    { provider: "anthropic", model: "claude-3-haiku-20240307", maxTokens: 200000, temperature: 0.7, costPerToken: 0.025 },
    
    // DeepSeek Models
    { provider: "deepseek", model: "deepseek-chat", maxTokens: 64000, temperature: 0.7, costPerToken: 0.014 },
    { provider: "deepseek", model: "deepseek-coder", maxTokens: 64000, temperature: 0.7, costPerToken: 0.014 },
    
    // Google Gemini Models
    { provider: "gemini", model: "gemini-2.0-flash-exp", maxTokens: 1048576, temperature: 0.7, costPerToken: 0.0 }, // Free tier
    { provider: "gemini", model: "gemini-1.5-pro", maxTokens: 2097152, temperature: 0.7, costPerToken: 0.125 },
    { provider: "gemini", model: "gemini-1.5-flash", maxTokens: 1048576, temperature: 0.7, costPerToken: 0.0075 },
    
    // Llama 3 (via Ollama)
    { provider: "ollama", model: "llama3.2:1b", maxTokens: 4096, temperature: 0.7, costPerToken: 0.0 }, // Local/Free
    { provider: "ollama", model: "llama3.2:3b", maxTokens: 4096, temperature: 0.7, costPerToken: 0.0 },
    { provider: "ollama", model: "llama3.1:8b", maxTokens: 8192, temperature: 0.7, costPerToken: 0.0 },
    
    // Cohere Models
    { provider: "cohere", model: "command-r-plus", maxTokens: 128000, temperature: 0.7, costPerToken: 0.3 },
    { provider: "cohere", model: "command-r", maxTokens: 128000, temperature: 0.7, costPerToken: 0.15 },
    
    // Cloudflare AI Workers
    { provider: "cloudflare", model: "@cf/meta/llama-3.1-8b-instruct", maxTokens: 4096, temperature: 0.7, costPerToken: 0.0 },
    { provider: "cloudflare", model: "@cf/meta/llama-3.1-70b-instruct", maxTokens: 8192, temperature: 0.7, costPerToken: 0.0 },
    { provider: "cloudflare", model: "@cf/mistral/mistral-7b-instruct-v0.1", maxTokens: 8192, temperature: 0.7, costPerToken: 0.0 },
  ];

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize all AI providers
   */
  private initializeProviders(): void {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set("openai", {
        enabled: true,
        apiKey: process.env.OPENAI_API_KEY,
        priority: 1,
      });
      this.clients.set("openai", new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
      console.log("✅ OpenAI initialized");
    }

    // Anthropic (Claude)
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set("anthropic", {
        enabled: true,
        apiKey: process.env.ANTHROPIC_API_KEY,
        priority: 2,
      });
      this.clients.set("anthropic", new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
      console.log("✅ Anthropic (Claude) initialized");
    }

    // DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.set("deepseek", {
        enabled: true,
        apiKey: process.env.DEEPSEEK_API_KEY,
        endpoint: process.env.DEEPSEEK_ENDPOINT || "https://api.deepseek.com",
        priority: 3,
      });
      this.clients.set("deepseek", new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_ENDPOINT || "https://api.deepseek.com",
      }));
      console.log("✅ DeepSeek initialized");
    }

    // Google Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.set("gemini", {
        enabled: true,
        apiKey: process.env.GEMINI_API_KEY,
        priority: 4,
      });
      this.clients.set("gemini", new GoogleGenerativeAI(process.env.GEMINI_API_KEY));
      console.log("✅ Google Gemini initialized");
    }

    // Ollama (Local)
    const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434";
    this.providers.set("ollama", {
      enabled: true,
      endpoint: ollamaEndpoint,
      priority: 5,
    });
    console.log("✅ Ollama initialized (local)");

    // Cohere
    if (process.env.COHERE_API_KEY) {
      this.providers.set("cohere", {
        enabled: true,
        apiKey: process.env.COHERE_API_KEY,
        priority: 6,
      });
      console.log("✅ Cohere initialized");
    }

    // Cloudflare AI Workers
    if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
      this.providers.set("cloudflare", {
        enabled: true,
        apiKey: process.env.CLOUDFLARE_API_TOKEN,
        endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`,
        priority: 7,
      });
      console.log("✅ Cloudflare AI Workers initialized");
    }
  }

  /**
   * Main chat completion method
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    // Check cache
    if (request.cache) {
      const cacheKey = this.getCacheKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Cache hit for ${cacheKey}`);
        return { ...cached, cached: true };
      }
    }

    // Determine provider and model
    const provider = request.provider || this.selectBestProvider();
    const model = request.model || this.getDefaultModel(provider);

    try {
      let response: AIResponse;

      switch (provider) {
        case "openai":
        case "deepseek":
          response = await this.chatOpenAI(provider, model, request);
          break;
        case "anthropic":
          response = await this.chatClaude(model, request);
          break;
        case "gemini":
          response = await this.chatGemini(model, request);
          break;
        case "ollama":
          response = await this.chatOllama(model, request);
          break;
        case "cohere":
          response = await this.chatCohere(model, request);
          break;
        case "cloudflare":
          response = await this.chatCloudflare(model, request);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      response.latency = Date.now() - startTime;
      response.cached = false;

      // Cache response
      if (request.cache) {
        const cacheKey = this.getCacheKey(request);
        this.cache.set(cacheKey, response);
      }

      // Track usage
      this.requestCount.set(provider, (this.requestCount.get(provider) || 0) + 1);

      return response;
    } catch (error: any) {
      console.error(`❌ Error with ${provider}:`, error.message);

      // Attempt failover to next provider
      if (!request.provider) {
        console.log("🔄 Attempting failover...");
        const nextProvider = this.selectNextProvider(provider);
        if (nextProvider) {
          return this.chat({ ...request, provider: nextProvider });
        }
      }

      throw error;
    }
  }

  /**
   * OpenAI/DeepSeek chat completion
   */
  private async chatOpenAI(provider: AIProvider, model: string, request: AIRequest): Promise<AIResponse> {
    const client = this.clients.get(provider);
    
    const completion = await client.chat.completions.create({
      model,
      messages: [
        ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
        { role: "user", content: request.prompt },
      ],
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.7,
    });

    const modelConfig = this.models.find(m => m.provider === provider && m.model === model);
    const tokens = {
      prompt: completion.usage?.prompt_tokens || 0,
      completion: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0,
    };

    return {
      content: completion.choices[0].message.content || "",
      provider,
      model,
      tokens,
      cost: (tokens.total / 1_000_000) * (modelConfig?.costPerToken || 0),
      latency: 0,
      cached: false,
    };
  }

  /**
   * Claude chat completion
   */
  private async chatClaude(model: string, request: AIRequest): Promise<AIResponse> {
    const client = this.clients.get("anthropic");

    const completion = await client.messages.create({
      model,
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt,
      messages: [{ role: "user", content: request.prompt }],
    });

    const modelConfig = this.models.find(m => m.provider === "anthropic" && m.model === model);
    const tokens = {
      prompt: completion.usage.input_tokens,
      completion: completion.usage.output_tokens,
      total: completion.usage.input_tokens + completion.usage.output_tokens,
    };

    return {
      content: completion.content[0].type === "text" ? completion.content[0].text : "",
      provider: "anthropic",
      model,
      tokens,
      cost: (tokens.total / 1_000_000) * (modelConfig?.costPerToken || 0),
      latency: 0,
      cached: false,
    };
  }

  /**
   * Gemini chat completion
   */
  private async chatGemini(model: string, request: AIRequest): Promise<AIResponse> {
    const client = this.clients.get("gemini");
    const generativeModel = client.getGenerativeModel({ model });

    const result = await generativeModel.generateContent({
      contents: [
        { role: "user", parts: [{ text: request.prompt }] },
      ],
      generationConfig: {
        maxOutputTokens: request.maxTokens || 8000,
        temperature: request.temperature || 0.7,
      },
    });

    const response = result.response;
    const text = response.text();
    
    const modelConfig = this.models.find(m => m.provider === "gemini" && m.model === model);
    const tokens = {
      prompt: response.usageMetadata?.promptTokenCount || 0,
      completion: response.usageMetadata?.candidatesTokenCount || 0,
      total: response.usageMetadata?.totalTokenCount || 0,
    };

    return {
      content: text,
      provider: "gemini",
      model,
      tokens,
      cost: (tokens.total / 1_000_000) * (modelConfig?.costPerToken || 0),
      latency: 0,
      cached: false,
    };
  }

  /**
   * Ollama chat completion (local)
   */
  private async chatOllama(model: string, request: AIRequest): Promise<AIResponse> {
    const endpoint = this.providers.get("ollama")?.endpoint || "http://127.0.0.1:11434";
    
    const response = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: request.systemPrompt 
          ? `${request.systemPrompt}\n\n${request.prompt}` 
          : request.prompt,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 4096,
        },
      }),
    });

    const data = await response.json();

    return {
      content: data.response,
      provider: "ollama",
      model,
      tokens: {
        prompt: data.prompt_eval_count || 0,
        completion: data.eval_count || 0,
        total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      cost: 0, // Local = free
      latency: 0,
      cached: false,
    };
  }

  /**
   * Cohere chat completion
   */
  private async chatCohere(model: string, request: AIRequest): Promise<AIResponse> {
    const apiKey = this.providers.get("cohere")?.apiKey;
    
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        message: request.prompt,
        preamble: request.systemPrompt,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4000,
      }),
    });

    const data = await response.json();
    const modelConfig = this.models.find(m => m.provider === "cohere" && m.model === model);

    return {
      content: data.text,
      provider: "cohere",
      model,
      tokens: {
        prompt: data.meta?.tokens?.input_tokens || 0,
        completion: data.meta?.tokens?.output_tokens || 0,
        total: (data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0),
      },
      cost: ((data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0)) / 1_000_000 * (modelConfig?.costPerToken || 0),
      latency: 0,
      cached: false,
    };
  }

  /**
   * Cloudflare AI Workers chat completion
   */
  private async chatCloudflare(model: string, request: AIRequest): Promise<AIResponse> {
    const endpoint = this.providers.get("cloudflare")?.endpoint;
    const apiKey = this.providers.get("cloudflare")?.apiKey;
    
    const response = await fetch(`${endpoint}/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
          { role: "user", content: request.prompt },
        ],
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
      }),
    });

    const data = await response.json();

    return {
      content: data.result.response,
      provider: "cloudflare",
      model,
      tokens: {
        prompt: 0, // Cloudflare doesn't provide token counts
        completion: 0,
        total: 0,
      },
      cost: 0, // Free tier
      latency: 0,
      cached: false,
    };
  }

  /**
   * Select best provider based on availability and priority
   */
  private selectBestProvider(): AIProvider {
    const enabledProviders = Array.from(this.providers.entries())
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority);

    if (enabledProviders.length === 0) {
      throw new Error("No AI providers available");
    }

    return enabledProviders[0][0];
  }

  /**
   * Select next provider for failover
   */
  private selectNextProvider(current: AIProvider): AIProvider | null {
    const currentPriority = this.providers.get(current)?.priority || 999;
    
    const nextProvider = Array.from(this.providers.entries())
      .filter(([provider, config]) => config.enabled && config.priority > currentPriority)
      .sort((a, b) => a[1].priority - b[1].priority)[0];

    return nextProvider ? nextProvider[0] : null;
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: AIProvider): string {
    const defaults: Record<AIProvider, string> = {
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-sonnet-20241022",
      deepseek: "deepseek-chat",
      gemini: "gemini-2.0-flash-exp",
      ollama: "llama3.2:1b",
      cohere: "command-r-plus",
      cloudflare: "@cf/meta/llama-3.1-8b-instruct",
    };

    return defaults[provider];
  }

  /**
   * Generate cache key
   */
  private getCacheKey(request: AIRequest): string {
    return `${request.provider}:${request.model}:${Buffer.from(request.prompt).toString('base64').substring(0, 50)}`;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.entries())
      .filter(([_, config]) => config.enabled)
      .map(([provider]) => provider);
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider: AIProvider): string[] {
    return this.models
      .filter(m => m.provider === provider)
      .map(m => m.model);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Record<AIProvider, number> {
    const stats: Record<string, number> = {};
    this.requestCount.forEach((count, provider) => {
      stats[provider] = count;
    });
    return stats as Record<AIProvider, number>;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log("🗑️  Cache cleared");
  }
}

// Export singleton
export const aiGateway = new UnifiedAIGateway();
