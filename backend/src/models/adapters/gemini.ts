import { OpenAIStreamAssembler } from "@/lib/openai-stream";
import { ConfigManager } from "../config";
import { ModelProvider, ModelProviderConfig, ModelRequestParams } from "../provider";

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

// Gemini提供商类
export class GeminiProvider implements ModelProvider {
  name = "gemini";

  // 获取配置
  getConfig(): ModelProviderConfig {
    const config = ConfigManager.getGeminiConfig();
    // 构建包含API密钥的完整URL
    if (config.apiKey && !config.baseUrl.includes('key=')) {
      const separator = config.baseUrl.includes('?') ? '&' : '?';
      config.baseUrl = `${config.baseUrl}${separator}key=${config.apiKey}`;
    }
    console.log('Gemini config:', { baseUrl: config.baseUrl.replace(/key=.*$/, 'key=***') });
    return config;
  }

  // 构建请求参数
  buildRequestParams(params: ModelRequestParams): Record<string, any> {
    // Gemini API格式
    const payload: Record<string, any> = {
      contents: stripReasoningFromMessages(params.messages).map((msg) => {
        if (msg.role === "tool") {
          return {
            role: "model",
            parts: [{
              text: msg.content
            }]
          };
        }
        return {
          role: msg.role,
          parts: [{
            text: msg.content
          }]
        };
      }),
      stream: true,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    // Gemini不直接支持tools参数，需要特殊处理
    if (params.tools) {
      // 将tools转换为system instruction的一部分
      const toolsPrompt = `Available tools: ${JSON.stringify(params.tools)}`;
      payload.systemInstruction = (params.systemInstruction ?? "") + "\n" + toolsPrompt;
    }

    return payload;
  }

  // 构建请求头
  buildHeaders(): Record<string, string> {
    return {
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
    throw new Error(`Gemini upstream error: ${response.status} ${text}`);
  }
}
