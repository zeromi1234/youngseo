"use client";

import { useState } from "react";
import Image from "next/image";
import { UserData } from "@/app/page";

type Props = {
  onComplete: (data: UserData) => void;
  onProfiles: () => void;
  hasProfiles: boolean;
};

function calcSiju(hour: number, minute: number, useYaJasi: boolean): string {
  const totalMin = hour * 60 + minute;
  const b = useYaJasi ? 30 : 0;

  const inJasi = useYaJasi
    ? totalMin >= 23 * 60 + 30 || totalMin < 1 * 60 + 30
    : totalMin >= 23 * 60 || totalMin < 1 * 60;
  if (inJasi) return "자시 (子時)";

  const siMap = [
    { s: 1 * 60, e: 3 * 60, name: "축시 (丑時)" },
    { s: 3 * 60, e: 5 * 60, name: "인시 (寅時)" },
    { s: 5 * 60, e: 7 * 60, name: "묘시 (卯時)" },
    { s: 7 * 60, e: 9 * 60, name: "진시 (辰時)" },
    { s: 9 * 60, e: 11 * 60, name: "사시 (巳時)" },
    { s: 11 * 60, e: 13 * 60, name: "오시 (午時)" },
    { s: 13 * 60, e: 15 * 60, name: "미시 (未時)" },
    { s: 15 * 60, e: 17 * 60, name: "신시 (申時)" },
    { s: 17 * 60, e: 19 * 60, name: "유시 (酉時)" },
    { s: 19 * 60, e: 21 * 60, name: "술시 (戌時)" },
    { s: 21 * 60, e: 23 * 60, name: "해시 (亥時)" },
  ];

  for (const si of siMap) {
    if (totalMin >= si.s + b && totalMin < si.e + b) return si.name;
  }
  return "자시 (子時)";
}

export default function OnboardingScreen({ onComplete, onProfiles, hasProfiles }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<UserData>>({ yaJasi: false });
  const [timeHour, setTimeHour] = useState("");
  const [timeMinute, setTimeMinute] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [finalData, setFinalData] = useState<UserData | null>(null);

  const totalSteps = 5;

  const goBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const canNext = () => {
    if (step === 0) return data.year && data.month && data.day;
    if (step === 1) return true;
    if (step === 3) return data.birthplace;
    if (step === 4) return data.tone;
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const completed = data as UserData;
      setFinalData(completed);
      setShowSaveModal(true);
    }
  };

  const handleSaveAndGo = () => {
    if (!finalData) return;
    const named = { ...finalData, name: saveName.trim() || undefined };
    onComplete(named);
  };

  const handleSkipSave = () => {
    if (finalData) onComplete(finalData);
  };

  const handleTimeConfirm = () => {
    const h = parseInt(timeHour);
    const m = parseInt(timeMinute || "0");
    if (!isNaN(h) && h >= 0 && h <= 23) {
      const siju = calcSiju(h, m, data.yaJasi ?? false);
      setData({ ...data, hour: timeHour, minute: timeMinute || "0", siju });
    } else {
      setData({ ...data, hour: "unknown", minute: "0", siju: "불명" });
    }
    setStep(step + 1);
  };

  const handleGenderSelect = (gender: "female" | "male") => {
    setData({ ...data, gender });
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        {step > 0 ? (
          <button onClick={goBack} className="text-[#1c1c1e] text-sm font-medium px-1">
            ← 이전
          </button>
        ) : (
          <div className="w-10" />
        )}
        {hasProfiles && step === 0 && (
          <button onClick={onProfiles} className="text-[#8e8e93] text-sm">
            저장된 사주
          </button>
        )}
      </div>

      <div className="flex-1 px-5 pb-10 max-w-sm mx-auto w-full">
        {/* 로고 (step 0에서만) */}
        {step === 0 && (
          <div className="text-center mb-10 mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Yomi" style={{ width: "160px", height: "auto", display: "block", margin: "0 auto" }} />
            <p className="text-xs text-[#8e8e93] tracking-wide" style={{ marginTop: "4px" }}>영미가 보려고 만든 사주 보고서</p>
          </div>
        )}

        {/* 진행 바 */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{ background: i <= step ? "#1c1c1e" : "#d1d1d6" }}
            />
          ))}
        </div>

        {/* Step 0: 생년월일 */}
        {step === 0 && (
          <div>
            <p className="text-[#8e8e93] text-xs uppercase tracking-widest mb-2">Step 01</p>
            <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-8">생년월일을 알려주세요</h2>
            <div className="flex gap-3">
              {[
                { label: "년도", key: "year", placeholder: "1995", min: 1900, max: 2010 },
                { label: "월", key: "month", placeholder: "06", min: 1, max: 12 },
                { label: "일", key: "day", placeholder: "15", min: 1, max: 31 },
              ].map((f) => (
                <div key={f.key} className="flex-1">
                  <label className="text-[#8e8e93] text-xs mb-2 block">{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    min={f.min} max={f.max}
                    value={(data as Record<string, string>)[f.key] || ""}
                    onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                    className="w-full bg-white border border-[#e5e5ea] rounded-2xl px-2 py-4 text-[#1c1c1e] text-center text-lg focus:outline-none focus:border-[#1c1c1e] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: 시간 */}
        {step === 1 && (
          <div>
            <p className="text-[#8e8e93] text-xs uppercase tracking-widest mb-2">Step 02</p>
            <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-2">태어난 시간</h2>
            <p className="text-[#8e8e93] text-sm mb-6">모르면 건너뛸 수 있어요</p>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1">
                <label className="text-[#8e8e93] text-xs mb-2 block">시 (0–23)</label>
                <input
                  type="number" placeholder="14" min="0" max="23"
                  value={timeHour}
                  onChange={(e) => setTimeHour(e.target.value)}
                  className="w-full bg-white border border-[#e5e5ea] rounded-2xl px-2 py-4 text-[#1c1c1e] text-center text-xl focus:outline-none focus:border-[#1c1c1e] transition-colors"
                />
              </div>
              <span className="text-[#8e8e93] text-2xl mt-5">:</span>
              <div className="flex-1">
                <label className="text-[#8e8e93] text-xs mb-2 block">분 (0–59)</label>
                <input
                  type="number" placeholder="30" min="0" max="59"
                  value={timeMinute}
                  onChange={(e) => setTimeMinute(e.target.value)}
                  className="w-full bg-white border border-[#e5e5ea] rounded-2xl px-2 py-4 text-[#1c1c1e] text-center text-xl focus:outline-none focus:border-[#1c1c1e] transition-colors"
                />
              </div>
            </div>

            {timeHour !== "" && (
              <div className="bg-white border border-[#e5e5ea] rounded-2xl px-5 py-4 mb-5">
                <p className="text-[#8e8e93] text-xs mb-1">계산된 시주</p>
                <p className="text-[#1c1c1e] font-medium">
                  {calcSiju(parseInt(timeHour), parseInt(timeMinute || "0"), data.yaJasi ?? false)}
                </p>
              </div>
            )}

            <div className="bg-white border border-[#e5e5ea] rounded-2xl px-5 py-4 mb-6">
              <p className="text-[#8e8e93] text-xs mb-3">자시 기준 방식</p>
              <div className="flex gap-2">
                {[
                  { val: false, label: "정자시", desc: "23:00 기준" },
                  { val: true, label: "야자시", desc: "23:30 기준" },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setData({ ...data, yaJasi: opt.val })}
                    className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                      data.yaJasi === opt.val
                        ? "bg-[#1c1c1e] text-white font-medium"
                        : "bg-[#f2f2f7] text-[#8e8e93]"
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className={`text-xs mt-0.5 ${data.yaJasi === opt.val ? "text-white/60" : "text-[#c7c7cc]"}`}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTimeConfirm}
              className="w-full py-4 rounded-2xl text-base font-medium bg-[#1c1c1e] text-white hover:bg-black/80 transition-all"
            >
              {timeHour !== "" ? "다음" : "시간 모름으로 건너뛰기"}
            </button>
          </div>
        )}

        {/* Step 2: 성별 (다음 버튼 없음, 선택 즉시 이동) */}
        {step === 2 && (
          <div>
            <p className="text-[#8e8e93] text-xs uppercase tracking-widest mb-2">Step 03</p>
            <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-2">성별</h2>
            <p className="text-[#8e8e93] text-sm mb-8">선택하면 바로 다음 단계로 이동해요</p>
            <div className="flex flex-col gap-3">
              {[
                { value: "female", label: "여성" },
                { value: "male", label: "남성" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleGenderSelect(g.value as "female" | "male")}
                  className="py-6 rounded-2xl text-lg font-medium bg-white border border-[#e5e5ea] text-[#1c1c1e] hover:bg-[#1c1c1e] hover:text-white transition-all"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 출생지 */}
        {step === 3 && (
          <div>
            <p className="text-[#8e8e93] text-xs uppercase tracking-widest mb-2">Step 04</p>
            <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-2">출생지</h2>
            <p className="text-[#8e8e93] text-sm mb-8">시·군 단위로 입력해주세요</p>
            <input
              type="text"
              placeholder="예: 서울특별시, 부산광역시"
              value={data.birthplace || ""}
              onChange={(e) => setData({ ...data, birthplace: e.target.value })}
              className="w-full bg-white border border-[#e5e5ea] rounded-2xl px-5 py-4 text-[#1c1c1e] text-lg focus:outline-none focus:border-[#1c1c1e] transition-colors placeholder:text-[#c7c7cc]"
            />
          </div>
        )}

        {/* Step 4: 톤 선택 */}
        {step === 4 && (
          <div>
            <p className="text-[#8e8e93] text-xs uppercase tracking-widest mb-2">Step 05</p>
            <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-2">보고서 톤</h2>
            <p className="text-[#8e8e93] text-sm mb-8">언제든 바꿀 수 있어요</p>
            <div className="flex flex-col gap-3">
              {[
                { value: "soft", label: "순화 모드", desc: "부드럽고 희망적인 표현으로 전달해요" },
                { value: "brutal", label: "팩폭 모드", desc: "직설적이고 구체적으로. 감추는 거 없이" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setData({ ...data, tone: t.value as "soft" | "brutal" })}
                  className={`py-5 px-6 rounded-2xl text-left transition-all border ${
                    data.tone === t.value
                      ? "bg-[#1c1c1e] text-white border-[#1c1c1e]"
                      : "bg-white border-[#e5e5ea] text-[#1c1c1e]"
                  }`}
                >
                  <div className="text-lg font-medium mb-1">{t.label}</div>
                  <div className={`text-sm ${data.tone === t.value ? "text-white/60" : "text-[#8e8e93]"}`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 다음 버튼 (step 1, 2 제외) */}
        {step !== 1 && step !== 2 && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={`w-full mt-10 py-4 rounded-2xl text-base font-medium transition-all ${
              canNext()
                ? "bg-[#1c1c1e] text-white hover:bg-black/80"
                : "bg-[#e5e5ea] text-[#c7c7cc] cursor-not-allowed"
            }`}
          >
            {step === totalSteps - 1 ? "보고서 생성하기" : "다음"}
          </button>
        )}
      </div>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-w-sm mx-auto">
            <h3 className="text-[#1c1c1e] font-semibold text-xl mb-1">이 사주를 저장할까요?</h3>
            <p className="text-[#8e8e93] text-sm mb-6">저장하면 나중에 바로 불러올 수 있어요</p>
            <input
              type="text"
              placeholder="이름 입력 (예: 나, 엄마, 친구 이름)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full bg-[#f2f2f7] rounded-2xl px-5 py-4 text-[#1c1c1e] focus:outline-none mb-3 text-base"
            />
            <button
              onClick={handleSaveAndGo}
              className="w-full py-4 rounded-2xl font-medium bg-[#1c1c1e] text-white mb-2"
            >
              저장하고 시작하기
            </button>
            <button
              onClick={handleSkipSave}
              className="w-full py-3 text-[#8e8e93] text-sm"
            >
              저장 없이 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
