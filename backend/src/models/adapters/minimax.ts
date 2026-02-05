import { ModelProvider, ModelRequestParams, ModelProviderConfig } from "../provider";
import { ConfigManager } from "../config";
import { GLMStreamAssembler } from "@/lib/glm-stream";

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

// Minimax提供商类
export class MinimaxProvider implements ModelProvider {
  name = "minimax";

  // 获取配置
  getConfig(): ModelProviderConfig {
    return ConfigManager.getMinimaxConfig();
  }

  // 构建请求参数
  buildRequestParams(params: ModelRequestParams): Record<string, any> {
    const config = this.getConfig();
    
    // Minimax API格式
    const payload: Record<string, any> = {
      model: params.model ?? config.model,
      messages: stripReasoningFromMessages(params.messages),
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    };
    
    // Minimax不直接支持tools参数，需要特殊处理
    if (params.tools) {
      // 将tools转换为system prompt的一部分
      const toolsPrompt = `Available tools: ${JSON.stringify(params.tools)}`;
      payload.system_prompt = (params.system_prompt ?? "") + "\n" + toolsPrompt;
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
    return new GLMStreamAssembler();
  }

  // 处理错误响应
  async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text().catch(() => "");
    throw new Error(`Minimax upstream error: ${response.status} ${text}`);
  }
}
