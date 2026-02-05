import type { GLMAssembledState } from "@/lib/glm-stream";
import type { OpenAIAssembledState } from "@/lib/openai-stream";

// 统一的组装状态类型
export type AssembledState = GLMAssembledState | OpenAIAssembledState;

// 模型提供商配置接口
export interface ModelProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  [key: string]: any;
}

// 模型请求参数接口
export interface ModelRequestParams {
  messages: Array<{
    role: string;
    content: string;
    tool_calls?: unknown;
    reasoning_content?: string
  }>;
  tools?: unknown[];
  thinking?: unknown;
  model?: string;
  [key: string]: any;
}

// 模型提供商接口
export interface ModelProvider {
  // 提供商名称
  name: string;

  // 获取配置
  getConfig(): ModelProviderConfig;

  // 构建请求参数
  buildRequestParams(params: ModelRequestParams): Record<string, any>;

  // 构建请求头
  buildHeaders(): Record<string, string>;

  // 获取流汇编器
  getStreamAssembler(): any;

  // 处理错误响应
  handleErrorResponse(response: Response): Promise<never>;
}

// 流处理器接口
export interface StreamProcessor {
  // 处理单个流事件
  processEvent(event: any): AssembledState;

  // 获取当前状态快照
  snapshot(): AssembledState;
}
