import { ModelProvider } from "./provider";
import { ProviderType, ConfigManager } from "./config";
import { GLMProvider } from "./adapters/glm";
import { OpenRouterProvider } from "./adapters/openrouter";
import { DeepSeekProvider } from "./adapters/deepseek";

// 模型提供商工厂类
export class ModelProviderFactory {
  // 提供商实例缓存
  private static providers: Map<string, ModelProvider> = new Map();

  // 创建或获取模型提供商实例
  static createProvider(providerType: ProviderType): ModelProvider {
    const normalizedType = this.normalizeProviderType(providerType);

    // 检查缓存中是否已有实例
    if (this.providers.has(normalizedType)) {
      return this.providers.get(normalizedType)!;
    }

    // 创建新的提供商实例
    let provider: ModelProvider;

    switch (normalizedType) {
      case "glm":
        provider = new GLMProvider();
        break;
      case "openrouter":
        provider = new OpenRouterProvider();
        break;
      case "deepseek":
        provider = new DeepSeekProvider();
        break;
      default:
        throw new Error(`Unsupported model provider: ${providerType}`);
    }

    // 缓存并返回实例
    this.providers.set(normalizedType, provider);
    return provider;
  }

  // 规范化提供商类型
  private static normalizeProviderType(providerType: ProviderType): string {
    const lowerType = (providerType ?? "").toLowerCase();

    if (lowerType === "openrouter" || lowerType === "open-router" || lowerType === "or") {
      return "openrouter";
    }

    if (lowerType === "deepseek" || lowerType === "ds") {
      return "deepseek";
    }

    return lowerType || "glm"; // 默认使用glm
  }

  // 获取默认提供商
  static getDefaultProvider(): ModelProvider {
    const defaultType = ConfigManager.getDefaultProvider();
    return this.createProvider(defaultType);
  }

  // 列出所有支持的提供商
  static listSupportedProviders(): string[] {
    return ["glm", "openrouter", "deepseek"];
  }

  // 验证提供商是否支持
  static isProviderSupported(providerType: ProviderType): boolean {
    const normalizedType = this.normalizeProviderType(providerType);
    return this.listSupportedProviders().includes(normalizedType);
  }
}

// 便捷函数：获取提供商
export function getProvider(providerType?: ProviderType): ModelProvider {
  return ModelProviderFactory.createProvider(providerType ?? ConfigManager.getDefaultProvider());
}

// 便捷函数：获取默认提供商
export function getDefaultProvider(): ModelProvider {
  return ModelProviderFactory.getDefaultProvider();
}
