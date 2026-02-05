export const runtime = "nodejs";

import { parseSSEJsonLines } from "@/lib/glm-stream";
import { getProvider } from "@/models/factory";
import { ModelRequestParams } from "@/models/provider";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    provider?: string;
    model?: string;
    messages: Array<{ role: string; content: string; tool_calls?: unknown; reasoning_content?: string }>;
    tools?: unknown[];
    thinking?: unknown;
  };

  const encoder = new TextEncoder();

  try {
    // 获取模型提供商实例
    const provider = getProvider(body.provider);
    const config = provider.getConfig();

    // 构建请求参数
    const params: ModelRequestParams = {
      messages: body.messages,
      tools: body.tools,
      thinking: body.thinking,
      model: body.model,
    };

    const payload = provider.buildRequestParams(params);
    const headers = provider.buildHeaders();
    const baseUrl = config.baseUrl;

    // 发送请求
    const upstream = await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!upstream.ok || !upstream.body) {
      await provider.handleErrorResponse(upstream);
    }

    // 获取流汇编器
    const assembler = provider.getStreamAssembler();

    // 创建可读流
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const evt of parseSSEJsonLines(upstream.body!)) {
            const state = assembler.push(evt as any);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ event: "llm.stream", data: state })}\n\n`)
            );
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ event: "llm.done", data: assembler.snapshot() })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
