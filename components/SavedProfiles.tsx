"use client";

import Image from "next/image";
import { UserData } from "@/app/page";

type Props = {
  profiles: UserData[];
  onBack: () => void;
  onLoad: (profile: UserData) => void;
  onDelete: (index: number) => void;
};

export default function SavedProfiles({ profiles, onBack, onLoad, onDelete }: Props) {
  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-[#e5e5ea] px-5 py-3">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button onClick={onBack} className="text-[#1c1c1e] text-sm font-medium">
            ← 이전
          </button>
          <Image src="/logo.png" alt="Yomi" width={56} height={22} style={{ objectFit: "contain" }} />
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-sm mx-auto px-5 pt-6 pb-20">
        <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-1">저장된 사주</h2>
        <p className="text-[#8e8e93] text-sm mb-6">탭하면 바로 분석 결과를 볼 수 있어요</p>

        {profiles.length === 0 ? (
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-8 text-center">
            <p className="text-[#c7c7cc] text-sm">저장된 사주가 없어요</p>
            <button onClick={onBack} className="mt-4 text-[#1c1c1e] text-sm font-medium">
              새로 입력하기 →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {profiles.map((profile, index) => (
              <div
                key={index}
                className="bg-white border border-[#e5e5ea] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#1c1c1e] font-semibold">{profile.name || "이름 없음"}</p>
                    <p className="text-[#8e8e93] text-sm mt-0.5">
                      {profile.year}.{profile.month}.{profile.day} · {profile.gender === "female" ? "여성" : "남성"}
                    </p>
                    <p className="text-[#c7c7cc] text-xs mt-0.5">{profile.birthplace}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    profile.tone === "brutal"
                      ? "bg-red-50 text-red-400 border-red-100"
                      : "bg-[#f2f2f7] text-[#8e8e93] border-[#e5e5ea]"
                  }`}>
                    {profile.tone === "brutal" ? "팩폭" : "순화"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoad(profile)}
                    className="flex-1 py-3 rounded-xl bg-[#1c1c1e] text-white text-sm font-medium"
                  >
                    분석 보기
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="px-4 py-3 rounded-xl bg-[#f2f2f7] text-[#8e8e93] text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
