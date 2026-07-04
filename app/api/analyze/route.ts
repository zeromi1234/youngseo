import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { section, userData } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ result: "API 키가 설정되지 않았습니다." });
    }

    const groq = new Groq({ apiKey });
    const prompt = buildPrompt(section, userData);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content ?? "결과를 가져올 수 없습니다.";
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ result: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
