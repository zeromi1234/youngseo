"use client";

import { useEffect, useRef, useState } from "react";
import { UserData, AnalysisResults } from "@/app/page";

type Props = {
  userData: UserData;
  onDone: (results: AnalysisResults) => void;
};

const STAGES = [
  { section: "saju_chart",    label: "사주 차트",    text: "생년월일시로 8글자를 계산하고\n오행·살·대운을 뽑아내고 있어요" },
  { section: "zwds_chart",    label: "자미두수 차트", text: "자미두수 12궁 강도를\n계산하고 있어요" },
  { section: "ast_chart",     label: "점성술 차트",  text: "출생 당시 행성 위치로\n4원소 분포를 계산하고 있어요" },
  { section: "saju_combined", label: "사주 풀이",    text: "성격·직업·금전·건강·연애·배우자를\n사주로 깊이 분석하고 있어요" },
  { section: "zwds_combined", label: "자미두수 풀이", text: "자미두수 12궁을 펼쳐\n배우자궁·관록궁·재백궁을 읽어요" },
  { section: "ast_combined",  label: "점성술 풀이",  text: "금성·7하우스 기반으로\n연애 시기와 감정 패턴을 봐요" },
  { section: "integrated",    label: "통합 보고서",  text: "사주·자미두수·점성술을 하나로 엮어\n최종 보고서를 완성하고 있어요" },
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Yomi" style={{ width: "100px", display: "block", margin: "0 auto", opacity: 0.8, objectFit: "contain" }} />
      </div>

      <div className="mb-5">
        <span className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-500 ${
          current.label === "통합 보고서"
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
        <div className="flex justify-between text-xs text-[#8e8e93] mb-2">
          <span>분석 중</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-[#e5e5ea] rounded-full overflow-hidden">
          <div className="h-full bg-[#1c1c1e] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          {STAGES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < stageIndex ? "bg-[#1c1c1e]" : i === stageIndex ? "bg-[#1c1c1e] ring-2 ring-[#1c1c1e] ring-offset-1" : "bg-[#e5e5ea]"
              }`} />
            </div>
          ))}
        </div>
        <p className="text-center text-[#8e8e93] text-xs mt-4">
          {stageIndex + 1} / {STAGES.length} 분석 중 · 2-3분 소요돼요
        </p>
      </div>
    </div>
  );
}
