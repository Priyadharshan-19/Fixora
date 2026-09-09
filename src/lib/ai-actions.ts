'use server';

import Groq from 'groq-sdk';

// 1. Pre-Visit AI Action (Groq Edition)
export async function getPrepInsights(applianceName: string, issue: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in .env.local");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
      You are an expert appliance repair AI. 
      Appliance: ${applianceName}
      Reported Issue: ${issue}
      
      Return a JSON object with exactly two keys:
      "insight": A short, 1-2 sentence professional prediction of what the most likely mechanical failure is.
      "parts": An array of 1 to 3 strings listing the specific tools or replacement parts the technician should bring.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0.2,
      reasoning_effort: 'low',
      max_completion_tokens: 1024,
      response_format: { type: 'json_object' }, // Native JSON lock
    });

    const text = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(text);

  } catch (error) {
    console.error('Groq Prep AI Error:', error);
    return {
      insight: "AI Diagnostics unavailable. Please proceed with standard diagnostic protocol.",
      parts: ["Standard Toolkit", "Multimeter"]
    };
  }
}

// 2. Co-Pilot Chat Action (Groq Edition)
export async function sendCoPilotMessage(applianceName: string, issue: string, chatHistory: any[], newMessage: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in .env.local");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Map existing UI history perfectly to Groq's expected format
    const formattedHistory = chatHistory.map(msg => ({
      role: (msg.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: msg.text
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are 'Fixora AI Co-Pilot', an expert technician assistant. You are currently at a customer's house helping fix a ${applianceName}. The reported issue is: "${issue}". Give concise, highly technical step-by-step diagnostic advice.`
        },
        ...formattedHistory,
        { role: 'user', content: newMessage }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.5,
      reasoning_effort: 'low',
      max_completion_tokens: 1024,
    });

    return { 
      success: true, 
      text: chatCompletion.choices[0]?.message?.content || "No response generated." 
    };

  } catch (error: any) {
    console.error('Groq Co-Pilot Error:', error);
    return { 
      success: false, 
      text: "Connection to Groq Co-Pilot lost. Please verify your API key and network." 
    };
  }
}