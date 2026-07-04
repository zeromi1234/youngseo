"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { UserData, AnalysisResults } from "@/app/page";

type Props = {
  userData: UserData;
  results: AnalysisResults;
  onBack: () => void;
  onSave: (data: UserData, name: string) => void;
  onProfiles: () => void;
};

type Tab = "integrated" | "saju" | "zwds" | "ast";

const OHAENG_COLOR: Record<string, string> = {
  목: "text-emerald-500", 화: "text-rose-500", 토: "text-amber-500", 금: "text-slate-400", 수: "text-blue-500",
};
const OHAENG_BG: Record<string, string> = {
  목: "bg-emerald-400", 화: "bg-rose-400", 토: "bg-amber-400", 금: "bg-slate-400", 수: "bg-blue-400",
};
const OHAENG_KEYS = ["목", "화", "토", "금", "수"];

const PILLAR_LABELS = [
  { key: "year",  label: "년주", sub: "조상\n뿌리" },
  { key: "month", label: "월주", sub: "환경\n부모" },
  { key: "day",   label: "일주", sub: "나\n자신" },
  { key: "hour",  label: "시주", sub: "미래\n자식" },
];

function parseSections(text: string): Array<{ title: string; content: string }> {
  const result: Array<{ title: string; content: string }> = [];
  const parts = text.split(/\[([^\]]+)\]/);
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim();
    const content = parts[i + 1]?.trim();
    if (title && content) result.push({ title, content });
  }
  return result;
}

function parseChartData(raw: string) {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

// ─── 아코디언 섹션 ────────────────────────────────────
function SectionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen((v) => !v)}
      className="bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-[#c7c7cc] active:scale-[0.99]"
    >
      <div className="flex items-center justify-between p-5">
        <span className="text-[#1c1c1e] font-semibold text-sm">{title}</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[#c7c7cc] text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-[#f2f2f7]">
          <p className="text-[#1c1c1e] text-sm leading-[1.9] whitespace-pre-wrap pt-4">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── 사주 시각화 ──────────────────────────────────────
function SajuChart({ chartData }: { chartData: ReturnType<typeof parseChartData> }) {
  const [salFilter, setSalFilter] = useState<"all" | "길" | "주의">("all");
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  if (!chartData) {
    return (
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4 text-center text-[#8e8e93] text-sm">
        사주 차트 데이터를 불러오지 못했어요
      </div>
    );
  }

  const { pillars, ohaeng, ohaengMeaning, sal, yearlySal } = chartData;
  const maxOhaeng = Math.max(...OHAENG_KEYS.map((k) => (ohaeng?.[k] ?? 0)), 1);
  const filteredSal = (sal ?? []).filter((s: { type: string }) =>
    salFilter === "all" || s.type === salFilter
  );
  const years = yearlySal ? Object.keys(yearlySal).sort() : [];
  const currentYearSal: Array<{ name: string; type: string; desc: string }> = yearlySal?.[selectedYear] ?? [];
  const totalChar = OHAENG_KEYS.reduce((sum, k) => sum + (ohaeng?.[k] ?? 0), 0);

  return (
    <div className="flex flex-col gap-4 mb-6">

      {/* 8글자 카드 */}
      <div className="bg-[#1c1c1e] rounded-3xl p-5">
        <p className="text-[#8e8e93] text-[11px] tracking-widest uppercase mb-4">내 사주 8글자</p>
        <div className="grid grid-cols-4 gap-2">
          {PILLAR_LABELS.map(({ key, label, sub }) => {
            const p = pillars?.[key];
            return (
              <div key={key} className="flex flex-col items-center">
                <p className="text-[#8e8e93] text-[11px] mb-2 font-medium">{label}</p>
                <div className="w-full bg-[#2c2c2e] rounded-2xl py-4 flex flex-col items-center gap-2">
                  <span className={`text-[26px] font-bold leading-none ${p ? (OHAENG_COLOR[p.cgOhaeng] ?? "text-white") : "text-[#555]"}`}>
                    {p?.cheongan ?? "?"}
                  </span>
                  <div className="w-0.5 h-3 bg-[#3c3c3e]" />
                  <span className={`text-[26px] font-bold leading-none ${p ? (OHAENG_COLOR[p.jjOhaeng] ?? "text-white") : "text-[#555]"}`}>
                    {p?.jiji ?? "?"}
                  </span>
                </div>
                <p className="text-[#555] text-[10px] mt-2 text-center leading-tight whitespace-pre-line">{sub}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-5 flex-wrap justify-center">
          {OHAENG_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${OHAENG_BG[k]}`} />
              <span className={`text-xs font-medium ${OHAENG_COLOR[k]}`}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 오행 분포 */}
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#1c1c1e] text-sm font-semibold">오행 분포</p>
          <span className="text-[#8e8e93] text-xs">총 {totalChar}글자</span>
        </div>
        {OHAENG_KEYS.map((k) => {
          const count = ohaeng?.[k] ?? 0;
          const pct = maxOhaeng > 0 ? (count / maxOhaeng) * 100 : 0;
          return (
            <div key={k} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className={`w-5 text-sm font-bold ${OHAENG_COLOR[k]}`}>{k}</span>
              <div className="flex-1 bg-[#f2f2f7] rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full ${OHAENG_BG[k]}`} style={{ width: `${pct}%`, transition: "width 1s ease" }} />
              </div>
              <span className="text-[#8e8e93] text-sm w-4 text-right font-medium">{count}</span>
            </div>
          );
        })}
        {/* 해석 */}
        {ohaengMeaning && (
          <div className="mt-4 pt-4 border-t border-[#f2f2f7] flex flex-col gap-2">
            {ohaengMeaning.많음 && (
              <div className="bg-[#f9f9f9] rounded-xl p-3">
                <span className={`text-xs font-semibold ${OHAENG_COLOR[ohaengMeaning.많음]}`}>{ohaengMeaning.많음} 과다</span>
                <p className="text-[#8e8e93] text-xs mt-1">{ohaengMeaning.많음_설명}</p>
              </div>
            )}
            {ohaengMeaning.없음 && (
              <div className="bg-[#f9f9f9] rounded-xl p-3">
                <span className={`text-xs font-semibold ${OHAENG_COLOR[ohaengMeaning.없음]}`}>{ohaengMeaning.없음} 부족</span>
                <p className="text-[#8e8e93] text-xs mt-1">{ohaengMeaning.없음_설명}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 내 사주의 살 */}
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5">
        <p className="text-[#1c1c1e] text-sm font-semibold mb-3">내 사주의 살</p>
        <div className="flex gap-2 mb-4">
          {(["all", "길", "주의"] as const).map((f) => (
            <button key={f} onClick={(e) => { e.stopPropagation(); setSalFilter(f); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                salFilter === f ? "bg-[#1c1c1e] text-white" : "bg-[#f2f2f7] text-[#8e8e93]"
              }`}>
              {f === "all" ? "전체" : f === "길" ? "✦ 길성" : "⚠ 주의"}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filteredSal.length === 0 && <p className="text-[#8e8e93] text-sm">해당하는 살이 없어요</p>}
          {filteredSal.map((s: { name: string; type: string; good?: string; bad?: string | null; tip?: string }) => (
            <div key={s.name} className={`rounded-2xl p-4 border ${
              s.type === "길" ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  s.type === "길" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                }`}>
                  {s.type === "길" ? "✦ 길성" : "⚠ 주의"}
                </span>
                <span className="text-[#1c1c1e] font-bold text-sm">{s.name}</span>
              </div>
              {s.good && <p className="text-emerald-700 text-xs leading-relaxed">✓ {s.good}</p>}
              {s.bad && <p className="text-orange-600 text-xs leading-relaxed mt-1">⚠ {s.bad}</p>}
              {s.tip && <p className="text-[#8e8e93] text-[11px] mt-2 leading-relaxed italic">💡 {s.tip}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 연도별 기운 */}
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5">
        <p className="text-[#1c1c1e] text-sm font-semibold mb-3">연도별 들어오는 기운</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
          {years.map((y) => (
            <button key={y} onClick={(e) => { e.stopPropagation(); setSelectedYear(y); }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-semibold transition-all ${
                selectedYear === y ? "bg-[#1c1c1e] text-white" : "bg-[#f2f2f7] text-[#8e8e93]"
              }`}>
              {y}
              {y === String(new Date().getFullYear()) && " ●"}
            </button>
          ))}
        </div>
        {currentYearSal.length === 0 ? (
          <p className="text-[#8e8e93] text-sm">해당 연도 정보가 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {currentYearSal.map((item, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${
                item.type === "길" ? "bg-emerald-50 border-emerald-100" : "bg-[#f9f9f9] border-[#f2f2f7]"
              }`}>
                <p className="text-[#1c1c1e] font-bold text-sm mb-1">{item.name}</p>
                <p className="text-[#8e8e93] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 제미나이 프롬프트 안내 ───────────────────────────
function GeminiPrompt({ userData, chartData }: { userData: UserData; chartData: ReturnType<typeof parseChartData> }) {
  const [copied, setCopied] = useState(false);

  const ilgan = chartData?.pillars?.day?.cheongan ?? "알 수 없음";
  const siju = userData.hour === "unknown" ? "시간 불명" : `${userData.hour}시 ${userData.minute}분`;
  const tone = userData.tone === "brutal" ? "팩폭 모드로. 솔직하고 직설적으로. 불편한 진실도 숨기지 말고" : "따뜻하고 다정하게. 단점도 성장 포인트로 표현하되 구체성은 유지해서";

  const prompt = `나는 ${userData.year}년 ${userData.month}월 ${userData.day}일 ${siju} 출생한 ${userData.gender === "female" ? "여성" : "남성"}이야. 출생지는 ${userData.birthplace}야.

사주 일간은 "${ilgan}"이에요. 아래 항목을 매우 구체적이고 상세하게 분석해줘.

[요청 사항]
① 배우자/연애 상대 외모 — 쌍커풀 있음/없음 단정, 눈 모양, 콧대 높이, 입술 두께, 턱 형태, 키(cm), 체형까지 전부
② 어울리는 직업 정확히 20가지 — 직군명 말고 실제 직업명으로
③ 나이대별 예상 자산 — 20/30/40/50대 각각 순자산 억 단위, 타는 차 모델명, 사는 곳 지역·형태
④ 내 사주에 든 살 전부 — 도화살·역마살·화개살·천을귀인 등 + 각각 좋게/나쁘게 작용하는 경우
⑤ 가장 빠른 연애 시기 — 연도와 월까지 구체적으로
⑥ 배우자 MBTI — 하나만 단정
⑦ 만날 장소 TOP 10 — 구체적 장소명으로
⑧ 연도별 들어오는 살 — 2024~2031년 각각

[규칙]
• 한자 금지, 한글로만
• "~수 있어요" "~편이에요" "어느 정도" 같은 모호한 표현 완전 금지
• 수치로 말할 수 있는 건 반드시 숫자로
• ${tone}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1c1c1e] rounded-3xl p-5 mt-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white text-sm font-semibold">Gemini에게 더 물어보기</p>
          <p className="text-[#8e8e93] text-xs mt-0.5">아래 프롬프트를 복사해서 Gemini에 붙여넣어요</p>
        </div>
        <button onClick={handleCopy}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
            copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
          }`}>
          {copied ? "✓ 복사됨" : "복사"}
        </button>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 max-h-40 overflow-y-auto">
        <p className="text-[#c7c7cc] text-xs leading-relaxed whitespace-pre-wrap">{prompt}</p>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────
export default function ReportScreen({ userData, results, onBack, onSave, onProfiles }: Props) {
  const [tab, setTab] = useState<Tab>("integrated");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);

  const chartData = useMemo(() => parseChartData(results["saju_chart"] ?? ""), [results]);
  const sajuSections  = useMemo(() => parseSections(results["saju_combined"] ?? ""), [results]);
  const zwdsSections  = useMemo(() => parseSections(results["zwds_combined"] ?? ""), [results]);
  const astSections   = useMemo(() => parseSections(results["ast_combined"] ?? ""), [results]);
  const intSections   = useMemo(() => parseSections(results["integrated"] ?? ""), [results]);

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(userData, saveName.trim());
    setSaved(true);
    setShowSaveModal(false);
  };

  const tabs = [
    { id: "integrated" as Tab, label: "통합" },
    { id: "saju"       as Tab, label: "사주" },
    { id: "zwds"       as Tab, label: "자미두수" },
    { id: "ast"        as Tab, label: "점성술" },
  ];

  const renderList = (sections: Array<{ title: string; content: string }>) => {
    if (sections.length === 0) {
      return (
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 text-center text-[#8e8e93] text-sm">
          분석 데이터를 불러오지 못했어요
        </div>
      );
    }
    return sections.map((s) => <SectionItem key={s.title} title={s.title} content={s.content} />);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-[#e5e5ea] px-5 py-3">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button onClick={onBack} className="text-[#1c1c1e] text-sm font-medium">← 이전</button>
          <Image src="/logo.png" alt="Yomi" width={56} height={22} style={{ objectFit: "contain" }} />
          <button onClick={onProfiles} className="text-[#8e8e93] text-xs">저장 목록</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-5 pb-24">
        {/* 기본 정보 */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 mt-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8e8e93] text-xs mb-0.5">분석 대상</p>
              <p className="text-[#1c1c1e] font-semibold text-base">
                {userData.year}.{userData.month}.{userData.day}
              </p>
              <p className="text-[#8e8e93] text-sm mt-0.5">
                {userData.gender === "female" ? "여성" : "남성"} · {userData.birthplace}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                userData.tone === "brutal"
                  ? "bg-rose-50 text-rose-500 border-rose-100"
                  : "bg-[#f2f2f7] text-[#8e8e93] border-[#e5e5ea]"
              }`}>
                {userData.tone === "brutal" ? "팩폭" : "순화"}
              </span>
              {!saved ? (
                <button onClick={() => setShowSaveModal(true)} className="text-xs text-[#8e8e93] hover:text-[#1c1c1e]">
                  + 저장
                </button>
              ) : (
                <span className="text-xs text-emerald-500">저장됨 ✓</span>
              )}
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 font-medium ${
                tab === t.id ? "bg-[#1c1c1e] text-white" : "bg-white border border-[#e5e5ea] text-[#8e8e93]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 사주 탭 */}
        {tab === "saju" && (
          <>
            <SajuChart chartData={chartData} />
            <div className="flex flex-col gap-2">{renderList(sajuSections)}</div>
            <GeminiPrompt userData={userData} chartData={chartData} />
          </>
        )}

        {/* 자미두수 탭 */}
        {tab === "zwds" && (
          <>
            <div className="flex flex-col gap-2">{renderList(zwdsSections)}</div>
            <GeminiPrompt userData={userData} chartData={chartData} />
          </>
        )}

        {/* 점성술 탭 */}
        {tab === "ast" && (
          <>
            <div className="flex flex-col gap-2">{renderList(astSections)}</div>
            <GeminiPrompt userData={userData} chartData={chartData} />
          </>
        )}

        {/* 통합 탭 */}
        {tab === "integrated" && (
          <>
            <p className="text-[#8e8e93] text-xs mb-4 px-1">
              사주·자미두수·점성술이 각자 가장 잘 보는 영역을 담당해요
            </p>
            <div className="flex flex-col gap-2">{renderList(intSections)}</div>
            <GeminiPrompt userData={userData} chartData={chartData} />
          </>
        )}
      </div>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end z-50" onClick={() => setShowSaveModal(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#1c1c1e] font-semibold text-lg mb-1">사주 저장</h3>
            <p className="text-[#8e8e93] text-sm mb-5">나중에 불러올 수 있도록 이름을 붙여주세요</p>
            <input type="text" placeholder="예: 나, 엄마, 친구 이름"
              value={saveName} onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full bg-[#f2f2f7] rounded-2xl px-5 py-4 text-[#1c1c1e] focus:outline-none mb-4"
              autoFocus />
            <button onClick={handleSave} disabled={!saveName.trim()}
              className={`w-full py-4 rounded-2xl font-semibold transition-all ${
                saveName.trim() ? "bg-[#1c1c1e] text-white" : "bg-[#e5e5ea] text-[#c7c7cc]"
              }`}>
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
