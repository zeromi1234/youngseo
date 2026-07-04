"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserData, AnalysisResults } from "@/app/page";

type Props = {
  userData: UserData;
  onDone: (results: AnalysisResults) => void;
};

const STAGES = [
  { section: "saju_chart",    label: "사주",    text: "생년월일시로 8글자를 계산하고\n오행과 살을 찾고 있어요" },
  { section: "saju_combined", label: "사주 풀이", text: "성격·직업·금전운·건강·연애를\n사주로 깊이 분석하고 있어요" },
  { section: "zwds_combined", label: "자미두수", text: "자미두수 12궁을 펼쳐\n배우자궁과 인간관계를 읽어요" },
  { section: "ast_combined",  label: "점성술",  text: "출생 당시 행성 위치로\n연애 시기와 감정 패턴을 봐요" },
  { section: "integrated",    label: "통합",    text: "세 가지를 하나로 엮어\n보고서를 완성하고 있어요" },
];

async function fetchSection(section: string, userData: UserData): Promise<string> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, userData }),
    });
    const data = await res.json();
    return data.result ?? "";
  } catch {
    return "";
  }
}

export default function LoadingScreen({ userData, onDone }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const results: AnalysisResults = {};

    (async () => {
      for (let i = 0; i < STAGES.length; i++) {
        if (doneRef.current) break;
        setStageIndex(i);

        const { section } = STAGES[i];
        const result = await fetchSection(section, userData);
        results[section] = result;

        setProgress(Math.round(((i + 1) / STAGES.length) * 100));

        // 마지막 단계가 아니면 짧게 대기
        if (i < STAGES.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      if (!doneRef.current) {
        doneRef.current = true;
        await new Promise((r) => setTimeout(r, 800));
        onDone(results);
      }
    })();

    return () => { doneRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = STAGES[stageIndex];

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center px-8">
      <div className="mb-14">
        <Image src="/logo.png" alt="Yomi" width={100} height={40} className="mx-auto opacity-80" style={{ objectFit: "contain" }} />
      </div>

      <div className="mb-5">
        <span className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-500 ${
          current.label === "통합"
            ? "bg-[#1c1c1e] text-white"
            : "bg-white border border-[#e5e5ea] text-[#8e8e93]"
        }`}>
          {current.label}
        </span>
      </div>

      <p className="text-center text-[#1c1c1e] text-lg font-medium leading-relaxed whitespace-pre-line transition-all duration-500 min-h-[56px]">
        {current.text}
      </p>

      <div className="flex gap-1.5 mt-8 mb-12">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#c7c7cc] animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>

      <div className="w-full max-w-xs">
        <div className="h-1 bg-[#e5e5ea] rounded-full overflow-hidden">
          <div className="h-full bg-[#1c1c1e] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {STAGES.map((s, i) => (
            <span key={i} className={`text-[10px] transition-colors duration-300 ${i <= stageIndex ? "text-[#1c1c1e] font-medium" : "text-[#c7c7cc]"}`}>
              {s.label}
            </span>
          ))}
        </div>
        <p className="text-center text-[#8e8e93] text-xs mt-4">
          {stageIndex + 1} / {STAGES.length} 분석 중 · 1-2분 소요돼요
        </p>
      </div>
    </div>
  );
}
