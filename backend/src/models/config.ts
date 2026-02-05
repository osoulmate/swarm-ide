// 模型配置管理

// 模型提供商类型
export type ProviderType = "glm" | "openrouter" | "deepseek" | string;

// 基础配置接口
export interface BaseConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// GLM配置接口
export interface GLMConfig extends BaseConfig {
  // GLM特定配置
}

// OpenRouter配置接口
export interface OpenRouterConfig extends BaseConfig {
  httpReferer: string;
  appTitle: string;
}

// DeepSeek配置接口
export interface DeepSeekConfig extends BaseConfig {
  // DeepSeek特定配置
}

// 千问配置接口
export interface QwenConfig extends BaseConfig {
  // 千问特定配置
}

// Kimi配置接口
export interface KimiConfig extends BaseConfig {
  // Kimi特定配置
}

// Minimax配置接口
export interface MinimaxConfig extends BaseConfig {
  // Minimax特定配置
}

// 豆包配置接口
export interface DoubaoConfig extends BaseConfig {
  // 豆包特定配置
}

// Gemini配置接口
export interface GeminiConfig extends BaseConfig {
  // Gemini特定配置
}

// 配置管理器类
export class ConfigManager {
  // 获取GLM配置
  static getGLMConfig(): GLMConfig {
    const apiKey = process.env.GLM_API_KEY ?? process.env.ZHIPUAI_API_KEY ?? "";
    const baseUrl = process.env.GLM_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    const model = process.env.GLM_MODEL ?? "glm-4.7";

    if (!apiKey) {
      throw new Error("Missing GLM API key (set GLM_API_KEY or ZHIPUAI_API_KEY)");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取OpenRouter配置
  static getOpenRouterConfig(): OpenRouterConfig {
    const apiKey = process.env.OPENROUTER_API_KEY ?? "";
    const baseUrl = this.normalizeOpenRouterUrl(
      process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1/chat/completions"
    );
    const model = process.env.OPENROUTER_MODEL ?? "";
    const httpReferer = process.env.OPENROUTER_HTTP_REFERER ?? "";
    const appTitle = process.env.OPENROUTER_APP_TITLE ?? "";

    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
      httpReferer,
      appTitle,
    };
  }

  // 获取DeepSeek配置
  static getDeepSeekConfig(): DeepSeekConfig {
    const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
    const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1/chat/completions";
    const model = process.env.DEEPSEEK_MODEL ?? "";

    if (!apiKey) {
      throw new Error("Missing DEEPSEEK_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取千问配置
  static getQwenConfig(): QwenConfig {
    const apiKey = process.env.QWEN_API_KEY ?? "";
    const baseUrl = process.env.QWEN_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    const model = process.env.QWEN_MODEL ?? "qwen2-72b-instruct";

    if (!apiKey) {
      throw new Error("Missing QWEN_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取Kimi配置
  static getKimiConfig(): KimiConfig {
    const apiKey = process.env.KIMI_API_KEY ?? "";
    const baseUrl = process.env.KIMI_BASE_URL ?? "https://api.moonshot.cn/v1/chat/completions";
    const model = process.env.KIMI_MODEL ?? "moonshot-v1-8k";

    if (!apiKey) {
      throw new Error("Missing KIMI_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取Minimax配置
  static getMinimaxConfig(): MinimaxConfig {
    const apiKey = process.env.MINIMAX_API_KEY ?? "";
    const baseUrl = process.env.MINIMAX_BASE_URL ?? "https://api.minimax.chat/v1/text/chatcompletion_pro";
    const model = process.env.MINIMAX_MODEL ?? "abab5.5-chat";

    if (!apiKey) {
      throw new Error("Missing MINIMAX_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取豆包配置
  static getDoubaoConfig(): DoubaoConfig {
    const apiKey = process.env.DOUBAO_API_KEY ?? "";
    const baseUrl = process.env.DOUBAO_BASE_URL ?? "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    const model = process.env.DOUBAO_MODEL ?? "ep-20240115175546-467jv";

    if (!apiKey) {
      throw new Error("Missing DOUBAO_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 获取Gemini配置
  static getGeminiConfig(): GeminiConfig {
    const apiKey = process.env.GEMINI_API_KEY ?? "";
    const baseUrl = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-lite:generateContent";
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-lite";

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    return {
      apiKey,
      baseUrl,
      model,
    };
  }

  // 规范化OpenRouter URL
  private static normalizeOpenRouterUrl(value: string): string {
    if (!value) return "https://openrouter.ai/api/v1/chat/completions";
    if (value.endsWith("/chat/completions")) return value;
    if (value.endsWith("/api/v1")) return `${value}/chat/completions`;
    if (value.endsWith("/v1")) return `${value}/chat/completions`;
    return value;
  }

  // 获取指定提供商的配置
  static getConfig(provider: ProviderType): BaseConfig {
    switch (provider.toLowerCase()) {
      case "glm":
        return this.getGLMConfig();
      case "openrouter":
      case "open-router":
      case "or":
        return this.getOpenRouterConfig();
      case "deepseek":
      case "ds":
        return this.getDeepSeekConfig();
      case "qwen":
        return this.getQwenConfig();
      case "kimi":
        return this.getKimiConfig();
      case "minimax":
        return this.getMinimaxConfig();
      case "doubao":
        return this.getDoubaoConfig();
      case "gemini":
        return this.getGeminiConfig();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // 获取默认提供商
  static getDefaultProvider(): ProviderType {
    return (process.env.LLM_PROVIDER ?? "glm").toLowerCase();
  }

  // 验证提供商配置
  static validateProvider(provider: ProviderType): void {
    try {
      this.getConfig(provider);
    } catch (error) {
      throw new Error(`Invalid configuration for provider ${provider}: ${(error as Error).message}`);
    }
  }
}
