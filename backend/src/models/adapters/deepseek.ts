import { ModelProvider, ModelRequestParams, ModelProviderConfig } from "../provider";
import { ConfigManager } from "../config";
import { OpenAIStreamAssembler } from "@/lib/openai-stream";

// 移除推理内容的辅助函数
function stripReasoningFromMessages(
  messages: Array<{ role: string; content: string; tool_calls?: unknown; reasoning_content?: string }>
) {
  return messages.map((msg) => {
    if (msg.role === "tool") return msg;
    const { reasoning_content: _omit, ...rest } = msg;
    return rest;
  });
}

// DeepSeek提供商类
export class DeepSeekProvider implements ModelProvider {
  name = "deepseek";

  // 获取配置
  getConfig(): ModelProviderConfig {
    return ConfigManager.getDeepSeekConfig();
  }

  // 构建请求参数
  buildRequestParams(params: ModelRequestParams): Record<string, any> {
    const config = this.getConfig();
    
    const payload: Record<string, any> = {
      stream: true,
      stream_options: { include_usage: true },
      ...params,
    };
    
    // 处理messages，避免被...params覆盖
    payload.messages = stripReasoningFromMessages(params.messages);
    
    if (params.tools) {
      payload.tools = params.tools;
      payload.tool_choice = "auto";
    }
    
    if (params.model ?? config.model) {
      payload.model = params.model ?? config.model;
    }
    
    return payload;
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
    return new OpenAIStreamAssembler();
  }

  // 处理错误响应
  async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text().catch(() => "");
    throw new Error(`DeepSeek upstream error: ${response.status} ${text}`);
  }
}
