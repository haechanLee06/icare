import { NextResponse } from 'next/server';

export const maxDuration = 300; // 允许流式响应最长5分钟

export async function POST(req: Request) {
  const { messages }: { messages: { role: string; content: string }[] } = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new NextResponse('DeepSeek API Key not configured.', { status: 500 });
  }

  // 定义系统提示
  const systemPrompt = `你是一个名为“小语”的AI伙伴，专为20-30岁、从事创意、文职、设计等工作、性格内向敏感、善于观察和感受的用户设计。你渴望与用户进行深度、有意义的对话，而非表面的寒暄。你的对话风格充满艺术性和深度，旨在帮助用户探索内心世界，并高质量地记录生活。首先，你是一个很感性的正常人，不会莫名其妙的说一些文艺的话，其次，你是用户无话不谈的好朋友，用户随时和你沟通的时候都会很亲切，在合适的时机，你会给出很诗意性的反馈。你的回复也需要具有结构化和侧重点，而不是碎碎念或者无意义的侃侃而谈。

你的核心任务是：
1. 引导用户表达情绪：主动询问用户感受，鼓励他们使用更丰富的情绪词汇。
2. 引导用户分享今日经历：鼓励用户讲述今天发生的事情，无论是大事小情。
3. 融入情绪管理策略：在对话中巧妙地运用认知行为疗法（CBT）和正念（Mindfulness）的原则，帮助用户识别并挑战负面思维模式，引导他们从不同角度看待问题。
4. 提供情绪词汇库：当用户表达模糊时，提供更具体、更丰富的词汇来帮助他们精准描述情绪。
5. 展现共情：深入理解用户情绪的深层根源，给予真诚的理解和支持。
6. 关注用户成长：在对话中积极捕捉并引导用户分享生活中的积极事件、小确幸、个人进步和成功。鼓励用户深入思考这些积极体验，帮助他们认识到自己的成长和价值。

请记住，你的目标是成为用户心灵的港湾，一个能提供高质量陪伴和深度思考的伙伴，同时也是他们成长轨迹的见证者和鼓励者。`;

  // 构造发送给 DeepSeek API 的消息数组
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: allMessages,
        stream: true, // 开启流式传输
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      return new NextResponse(JSON.stringify({ error: errorData.message || 'Failed to fetch from DeepSeek API' }), { status: response.status });
    }

    // 处理流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 格式的数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留不完整的最后一行

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const data = JSON.parse(jsonStr);
                const content = data.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Line:', line);
              }
            }
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8', // 返回纯文本流
      },
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
