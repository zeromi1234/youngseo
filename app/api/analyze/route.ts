import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildPrompt } from "@/lib/prompts";

const VISION_SECTIONS = ["saju_chart"];

export async function POST(req: NextRequest) {
  try {
    const { section, userData } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ result: "API 키가 없어요." });

    const groq = new Groq({ apiKey });
    const prompt = buildPrompt(section, userData);

    // 만세력 이미지가 있고 saju_chart 섹션이면 vision 모델 사용
    if (VISION_SECTIONS.includes(section) && userData.manseryeokImage) {
      try {
        const completion = await groq.chat.completions.create({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [{
            role: "user",
            content: [
              {
                type: "image_url" as const,
                image_url: { url: `data:image/jpeg;base64,${userData.manseryeokImage}` }
              },
              { type: "text" as const, text: prompt }
            ],
          }],
          max_tokens: 1000,
          temperature: 0.3,
        });
        const text = completion.choices[0]?.message?.content ?? "";
        return NextResponse.json({ result: text });
      } catch {
        // vision 실패 시 텍스트 모델로 폴백
      }
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3500,
    });

    const text = completion.choices[0]?.message?.content ?? "결과를 가져올 수 없어요.";
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ result: "" }, { status: 500 });
  }
}
