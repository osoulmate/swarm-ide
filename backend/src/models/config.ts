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
