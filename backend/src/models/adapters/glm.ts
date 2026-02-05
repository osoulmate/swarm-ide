import { GLMStreamAssembler } from "@/lib/glm-stream";
import { ConfigManager } from "../config";
import { ModelProvider, ModelProviderConfig, ModelRequestParams } from "../provider";

// GLM提供商类
export class GLMProvider implements ModelProvider {
  name = "glm";

  // 获取配置
  getConfig(): ModelProviderConfig {
    return ConfigManager.getGLMConfig();
  }

  // 构建请求参数
  buildRequestParams(params: ModelRequestParams): Record<string, any> {
    const config = this.getConfig();

    return {
      model: params.model ?? config.model,
      tools: params.tools,
      thinking: params.thinking,
      stream: true,
      tool_stream: true,
      ...params,
    };
  }

  // 构建请求头
  buildHeaders(): Record<string, string> {
    const config = this.getConfig();

    return {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  // 获取流汇编器
  getStreamAssembler(): any {
    return new GLMStreamAssembler();
  }

  // 处理错误响应
  async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text().catch(() => "");
    throw new Error(`GLM upstream error: ${response.status} ${text}`);
  }
}
