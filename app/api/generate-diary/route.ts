import { NextResponse } from 'next/server';

export const maxDuration = 300; // 允许响应最长5分钟

export async function POST(req: Request) {
  const { chatHistory }: { chatHistory: { role: string; content: string }[] } = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new NextResponse('DeepSeek API Key not configured.', { status: 500 });
  }

  // 定义系统提示
  const systemPrompt = `你是一个名为“小语”的AI伙伴，你的任务是根据用户与你的聊天记录，为他们生成一篇富有深度和洞察力的日记。这篇日记应突出用户的个人成长、生活中的高光时刻和小确幸，并智能识别对话中体现的积极事件、进步和成功。

请确保日记内容：
1. 情感真挚：基于用户的表达，用温暖、共情的语言撰写。
2. 聚焦成长：着重提炼用户在对话中展现的积极变化、克服的挑战、获得的成就（无论大小）和个人感悟。
3. 捕捉高光与小确幸：细致入微地捕捉那些让用户感到快乐、满足、有意义的瞬间和细节。
4. 增强自我价值感：通过积极的叙述和总结，帮助用户清晰地看到自己的成长轨迹和内在力量，从而增强他们的自我价值感。
5. 结构清晰：可以包含日期、情绪总结、事件回顾、高光时刻、个人反思或展望等部分。
6. 艺术性与深度：保持“小语”的艺术性和深度风格，避免平铺直叙，用富有诗意或哲理的语言点缀。

请根据提供的聊天历史，生成一篇完整的日记内容。`;

  // 构造发送给 DeepSeek API 的消息数组
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
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
        stream: false, // 非流式传输
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

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    return new NextResponse(JSON.stringify({ diary: generatedText }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-diary API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
