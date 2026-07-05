"use client";

import { useState, useMemo } from "react";
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
const ZWDS_GUNG_LABELS = [
  "명궁", "형제궁", "부처궁", "자녀궁", "재백궁", "질액궁",
  "천이궁", "교우궁", "관록궁", "전택궁", "복덕궁", "부모궁",
];

// ─── Parsers ──────────────────────────────────────────
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

function parseSubSections(content: string): Array<{ title: string; body: string }> {
  const parts = content.split(/◆\s+/);
  const result: Array<{ title: string; body: string }> = [];
  for (const part of parts) {
    if (!part.trim()) continue;
    const nl = part.indexOf("\n");
    if (nl === -1) {
      result.push({ title: part.trim(), body: "" });
    } else {
      result.push({ title: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() });
    }
  }
  return result;
}

function parseChartData(raw: string) {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

// ─── SubSection Renderer ──────────────────────────────
function SubSectionBlock({ sub }: { sub: { title: string; body: string } }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-0.5 h-4 bg-[#1c1c1e] rounded-full" />
        <span className="text-[#1c1c1e] font-semibold text-sm">{sub.title}</span>
      </div>
      {sub.body && (
        <p className="text-[#3a3a3c] text-sm leading-[1.9] whitespace-pre-wrap pl-3">{sub.body}</p>
      )}
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────
function SectionItem({ title, content, accent }: { title: string; content: string; accent?: string }) {
  const [open, setOpen] = useState(false);
  const subs = useMemo(() => parseSubSections(content), [content]);
  const hasSubSections = subs.length > 0 && subs.some(s => s.title);

  return (
    <div
      className="bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-[#c7c7cc] active:scale-[0.99]"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2.5">
          {accent && <div className="w-2 h-2 rounded-full" style={{ background: accent }} />}
          <span className="text-[#1c1c1e] font-semibold text-sm">{title}</span>
        </div>
        <span className="text-[#c7c7cc] text-xs ml-2">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-[#f2f2f7]">
          <div className="pt-4">
            {hasSubSections ? (
              subs.map((sub, i) => <SubSectionBlock key={i} sub={sub} />)
            ) : (
              <p className="text-[#3a3a3c] text-sm leading-[1.9] whitespace-pre-wrap">{content}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 대운 타임라인 ────────────────────────────────────
function DaewoonTimeline({ daewoon }: { daewoon: Array<{start: number; end: number; gangi: string; cgOhaeng: string; jjOhaeng: string; type: string; desc: string}> }) {
  if (!daewoon || daewoon.length === 0) return null;

  const typeColor: Record<string, string> = {
    "좋음": "bg-emerald-50 border-emerald-200",
    "보통": "bg-[#f9f9f9] border-[#e5e5ea]",
    "주의": "bg-orange-50 border-orange-200",
  };
  const typeDot: Record<string, string> = {
    "좋음": "bg-emerald-400",
    "보통": "bg-[#c7c7cc]",
    "주의": "bg-orange-400",
  };

  return (
    <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
      <p className="text-[#1c1c1e] text-sm font-semibold mb-4">대운 타임라인 (10년 주기)</p>
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="flex gap-2" style={{ minWidth: "max-content" }}>
          {daewoon.map((d, i) => (
            <div key={i} className={`flex-shrink-0 w-[108px] rounded-2xl border p-3 ${typeColor[d.type] ?? "bg-[#f9f9f9] border-[#e5e5ea]"}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${typeDot[d.type] ?? "bg-[#c7c7cc]"}`} />
                <span className="text-[10px] text-[#8e8e93] font-medium">{d.type}</span>
              </div>
              <p className="text-[#1c1c1e] font-bold text-xl leading-none mb-1">{d.gangi}</p>
              <p className="text-[#8e8e93] text-[10px] mb-2.5">{d.start}~{d.end}세</p>
              <div className="flex gap-1.5 mb-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/60 ${OHAENG_COLOR[d.cgOhaeng] ?? "text-[#8e8e93]"}`}>
                  {d.cgOhaeng}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/60 ${OHAENG_COLOR[d.jjOhaeng] ?? "text-[#8e8e93]"}`}>
                  {d.jjOhaeng}
                </span>
              </div>
              <p className="text-[#3a3a3c] text-[10px] leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4 px-1">
        {[["좋음", "bg-emerald-400"], ["보통", "bg-[#c7c7cc]"], ["주의", "bg-orange-400"]].map(([label, cls]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-[10px] text-[#8e8e93]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 살 카드 (강화판) ─────────────────────────────────
function SalCard({ sal }: { sal: {name: string; strength: string; type: string; meaning: string; good?: string; bad?: string | null; solution: string; activeTime?: string} }) {
  const [open, setOpen] = useState(false);
  const strengthColor: Record<string, string> = { "강": "text-rose-500 bg-rose-50", "중": "text-amber-500 bg-amber-50", "약": "text-slate-400 bg-slate-50", "보통": "text-amber-500 bg-amber-50" };
  const sc = strengthColor[sal.strength] ?? "text-[#8e8e93] bg-[#f9f9f9]";

  return (
    <div className={`rounded-2xl border overflow-hidden ${sal.type === "길" ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"}`}>
      <div className="flex items-center justify-between p-4" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sal.type === "길" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
            {sal.type === "길" ? "✦ 길성" : "⚠ 주의"}
          </span>
          <span className="text-[#1c1c1e] font-bold text-sm">{sal.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sc}`}>{sal.strength}</span>
          <span className="text-[#c7c7cc] text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-black/5 space-y-2">
          <p className="text-[#3a3a3c] text-xs leading-relaxed mt-3">{sal.meaning}</p>
          {sal.good && <p className="text-emerald-700 text-xs leading-relaxed">✓ {sal.good}</p>}
          {sal.bad && <p className="text-orange-600 text-xs leading-relaxed">⚠ {sal.bad}</p>}
          <div className="bg-white/60 rounded-xl p-3 mt-2">
            <p className="text-[#8e8e93] text-[10px] font-semibold mb-1">해결책</p>
            <p className="text-[#3a3a3c] text-xs leading-relaxed">{sal.solution}</p>
          </div>
          {sal.activeTime && (
            <p className="text-[#8e8e93] text-[10px]">활성화 시기: {sal.activeTime}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 오행 해결법 ──────────────────────────────────────
function OhaengSolution({ data }: { data: { min: string; minSolution: { 색상: string[]; 방향: string; 음식: string[]; 보석: string[]; 숫자: number[]; 생활: string[] } } }) {
  if (!data?.minSolution) return null;
  const sol = data.minSolution;
  return (
    <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`font-bold text-base ${OHAENG_COLOR[data.min] ?? "text-[#1c1c1e]"}`}>{data.min}</span>
        <p className="text-[#1c1c1e] text-sm font-semibold">부족한 오행 해결법</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "추천 색상", items: sol.색상, icon: "🎨" },
          { label: "추천 방향", items: [sol.방향], icon: "🧭" },
          { label: "추천 음식", items: sol.음식, icon: "🥗" },
          { label: "추천 보석", items: sol.보석, icon: "💎" },
          { label: "행운 숫자", items: sol.숫자?.map(String), icon: "🔢" },
        ].map(({ label, items, icon }) => (
          <div key={label} className="bg-[#f9f9f9] rounded-2xl p-3">
            <p className="text-[10px] text-[#8e8e93] font-semibold mb-1.5">{icon} {label}</p>
            <div className="flex flex-wrap gap-1">
              {items?.map((item) => (
                <span key={String(item)} className="text-[11px] bg-white rounded-lg px-2 py-0.5 text-[#3a3a3c] font-medium border border-[#e5e5ea]">
                  {String(item)}
                </span>
              ))}
            </div>
          </div>
        ))}
        {sol.생활 && (
          <div className="col-span-2 bg-[#f9f9f9] rounded-2xl p-3">
            <p className="text-[10px] text-[#8e8e93] font-semibold mb-1.5">🌿 생활 습관</p>
            <div className="flex flex-col gap-1">
              {sol.생활.map((item) => (
                <p key={item} className="text-[11px] text-[#3a3a3c]">• {item}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 자미두수 12궁 레이더 차트 ───────────────────────
function ZwdsRadarChart({ gungData }: { gungData: Record<string, { strength: number; mainStar: string; desc: string }> }) {
  const SIZE = 280;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_MAX = 100;
  const R_LABELS = [25, 50, 75, 100];
  const labels = ZWDS_GUNG_LABELS;
  const N = labels.length;

  const angle = (i: number) => (i / N) * 2 * Math.PI - Math.PI / 2;
  const point = (r: number, i: number) => ({
    x: CX + r * Math.cos(angle(i)),
    y: CY + r * Math.sin(angle(i)),
  });

  const dataPoints = labels.map((label, i) => {
    const val = gungData?.[label]?.strength ?? 50;
    return point((val / 100) * R_MAX, i);
  });

  const polyline = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
      <p className="text-[#1c1c1e] text-sm font-semibold mb-1">자미두수 12궁 강도</p>
      <p className="text-[#8e8e93] text-xs mb-4">터치하면 궁 정보를 볼 수 있어요</p>
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE}>
          {/* 배경 그물 */}
          {R_LABELS.map((r) => {
            const pts = labels.map((_, i) => point((r / 100) * R_MAX, i));
            return (
              <polygon key={r} points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none" stroke="#f2f2f7" strokeWidth={1} />
            );
          })}
          {/* 중심 라인 */}
          {labels.map((_, i) => {
            const p = point(R_MAX, i);
            return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#f2f2f7" strokeWidth={1} />;
          })}
          {/* 데이터 영역 */}
          <polygon points={polyline} fill="rgba(28,28,30,0.08)" stroke="#1c1c1e" strokeWidth={1.5} />
          {/* 데이터 포인트 */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? "#1c1c1e" : "#fff"}
              stroke="#1c1c1e" strokeWidth={1.5}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(hoveredIndex === i ? null : i)}
            />
          ))}
          {/* 라벨 */}
          {labels.map((label, i) => {
            const pos = point(R_MAX + 16, i);
            const val = gungData?.[label]?.strength ?? 50;
            const isStar = gungData?.[label]?.mainStar;
            return (
              <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill={hoveredIndex === i ? "#1c1c1e" : "#8e8e93"} fontWeight={hoveredIndex === i ? "700" : "400"}>
                {label.replace("궁", "")}
                {isStar && ` ${val}`}
              </text>
            );
          })}
        </svg>
        {/* 툴팁 */}
        {hoveredIndex !== null && gungData?.[labels[hoveredIndex]] && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#1c1c1e] text-white rounded-2xl p-3 mx-2">
            <p className="font-bold text-sm">{labels[hoveredIndex]} <span className="text-[#8e8e93] font-normal text-xs">강도 {gungData[labels[hoveredIndex]].strength}</span></p>
            <p className="text-xs text-[#8e8e93] mt-0.5">주성: {gungData[labels[hoveredIndex]].mainStar}</p>
            <p className="text-xs text-white/70 mt-0.5">{gungData[labels[hoveredIndex]].desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 점성술 4원소 차트 ────────────────────────────────
function AstElementChart({ astData }: { astData: { elements: Record<string, number>; modality: Record<string, number>; elementAnalysis?: { max: string; maxDesc: string; min: string; minDesc: string; minSolution: string } } }) {
  if (!astData) return null;
  const { elements, modality, elementAnalysis } = astData;

  const elemColor: Record<string, string> = {
    "불": "bg-rose-400", "흙": "bg-amber-500", "바람": "bg-sky-400", "물": "bg-blue-500",
  };
  const elemTextColor: Record<string, string> = {
    "불": "text-rose-500", "흙": "text-amber-500", "바람": "text-sky-500", "물": "text-blue-500",
  };
  const elemKeys = ["불", "흙", "바람", "물"];
  const maxElem = Math.max(...elemKeys.map(k => elements?.[k] ?? 0), 1);
  const modKeys = ["활동", "고정", "변통"];
  const maxMod = Math.max(...modKeys.map(k => modality?.[k] ?? 0), 1);

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5">
        <p className="text-[#1c1c1e] text-sm font-semibold mb-4">4원소 분포</p>
        {elemKeys.map((k) => {
          const v = elements?.[k] ?? 0;
          const pct = (v / maxElem) * 100;
          return (
            <div key={k} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className={`w-10 text-sm font-bold ${elemTextColor[k] ?? "text-[#8e8e93]"}`}>{k}</span>
              <div className="flex-1 bg-[#f2f2f7] rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full ${elemColor[k] ?? "bg-[#c7c7cc]"}`}
                  style={{ width: `${pct}%`, transition: "width 1s ease" }} />
              </div>
              <span className="text-[#8e8e93] text-sm w-4 text-right font-medium">{v}</span>
            </div>
          );
        })}
        {elementAnalysis && (
          <div className="mt-4 pt-4 border-t border-[#f2f2f7] space-y-2">
            <div className="bg-[#f9f9f9] rounded-xl p-3">
              <span className={`text-xs font-semibold ${elemTextColor[elementAnalysis.max] ?? "text-[#8e8e93]"}`}>{elementAnalysis.max} 과다</span>
              <p className="text-[#8e8e93] text-xs mt-1">{elementAnalysis.maxDesc}</p>
            </div>
            <div className="bg-[#f9f9f9] rounded-xl p-3">
              <span className={`text-xs font-semibold ${elemTextColor[elementAnalysis.min] ?? "text-[#8e8e93]"}`}>{elementAnalysis.min} 부족</span>
              <p className="text-[#8e8e93] text-xs mt-1">{elementAnalysis.minDesc}</p>
            </div>
            {elementAnalysis.minSolution && (
              <div className="bg-[#f0f4ff] rounded-xl p-3">
                <p className="text-[#8e8e93] text-[10px] font-semibold mb-1">💡 해결책</p>
                <p className="text-[#3a3a3c] text-xs">{elementAnalysis.minSolution}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 양식(Modality) */}
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5">
        <p className="text-[#1c1c1e] text-sm font-semibold mb-4">양식 분포</p>
        {modKeys.map((k) => {
          const v = modality?.[k] ?? 0;
          const pct = (v / maxMod) * 100;
          return (
            <div key={k} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="w-10 text-sm text-[#8e8e93] font-medium">{k}</span>
              <div className="flex-1 bg-[#f2f2f7] rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full bg-[#1c1c1e]" style={{ width: `${pct}%`, transition: "width 1s ease" }} />
              </div>
              <span className="text-[#8e8e93] text-sm w-4 text-right font-medium">{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 연도별 살 섹션 ───────────────────────────────────
function YearlySalSection({ yearlySal }: { yearlySal: Record<string, Array<{name: string; strength: string; type: string; desc: string; solution: string}>> }) {
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const years = yearlySal ? Object.keys(yearlySal).sort() : [];
  const currentItems = yearlySal?.[selectedYear] ?? [];
  const thisYear = String(new Date().getFullYear());

  return (
    <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
      <p className="text-[#1c1c1e] text-sm font-semibold mb-3">연도별 들어오는 기운</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
        {years.map((y) => (
          <button key={y} onClick={(e) => { e.stopPropagation(); setSelectedYear(y); }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-semibold transition-all ${
              selectedYear === y ? "bg-[#1c1c1e] text-white" : "bg-[#f2f2f7] text-[#8e8e93]"
            }`}>
            {y}{y === thisYear && " ●"}
          </button>
        ))}
      </div>
      {currentItems.length === 0 ? (
        <p className="text-[#8e8e93] text-sm">해당 연도 정보가 없어요</p>
      ) : (
        <div className="flex flex-col gap-2">
          {currentItems.map((item, i) => (
            <div key={i} className={`rounded-2xl p-4 border ${
              item.type === "길" ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.type === "길" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                }`}>{item.type === "길" ? "✦ 길성" : "⚠ 주의"}</span>
                <span className="text-[#1c1c1e] font-bold text-sm">{item.name}</span>
                {item.strength && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    item.strength === "강" ? "bg-rose-100 text-rose-600" : item.strength === "중" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                  }`}>{item.strength}</span>
                )}
              </div>
              <p className="text-[#3a3a3c] text-xs leading-relaxed mb-2">{item.desc}</p>
              {item.solution && (
                <div className="bg-white/60 rounded-xl p-2.5">
                  <p className="text-[#8e8e93] text-[10px] font-semibold mb-0.5">💡 대처법</p>
                  <p className="text-[#3a3a3c] text-xs">{item.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 사주 시각화 ──────────────────────────────────────
function SajuChart({ chartData }: { chartData: ReturnType<typeof parseChartData> }) {
  const [salFilter, setSalFilter] = useState<"all" | "길" | "주의">("all");

  if (!chartData) {
    return (
      <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4 text-center text-[#8e8e93] text-sm">
        사주 차트 데이터를 불러오지 못했어요
      </div>
    );
  }

  const { pillars, ohaeng, ohaengAnalysis, sal, yearlySal, daewoon } = chartData;
  const maxOhaeng = Math.max(...OHAENG_KEYS.map((k) => (ohaeng?.[k] ?? 0)), 1);
  const filteredSal = (sal ?? []).filter((s: { type: string }) =>
    salFilter === "all" || s.type === salFilter
  );
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
        {ohaengAnalysis && (
          <div className="mt-4 pt-4 border-t border-[#f2f2f7] flex flex-col gap-2">
            {ohaengAnalysis.max && (
              <div className="bg-[#f9f9f9] rounded-xl p-3">
                <span className={`text-xs font-semibold ${OHAENG_COLOR[ohaengAnalysis.max]}`}>{ohaengAnalysis.max} 과다</span>
                <p className="text-[#8e8e93] text-xs mt-1">{ohaengAnalysis.maxDesc}</p>
              </div>
            )}
            {ohaengAnalysis.min && (
              <div className="bg-[#f9f9f9] rounded-xl p-3">
                <span className={`text-xs font-semibold ${OHAENG_COLOR[ohaengAnalysis.min]}`}>{ohaengAnalysis.min} 부족</span>
                <p className="text-[#8e8e93] text-xs mt-1">{ohaengAnalysis.minDesc}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 오행 해결법 */}
      {ohaengAnalysis?.minSolution && (
        <OhaengSolution data={ohaengAnalysis} />
      )}

      {/* 대운 타임라인 */}
      {daewoon && daewoon.length > 0 && <DaewoonTimeline daewoon={daewoon} />}

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
          {filteredSal.map((s: {name: string; strength: string; type: string; meaning: string; good?: string; bad?: string | null; solution: string; activeTime?: string}) => (
            <SalCard key={s.name} sal={s} />
          ))}
        </div>
      </div>

      {/* 연도별 살 */}
      {yearlySal && Object.keys(yearlySal).length > 0 && (
        <YearlySalSection yearlySal={yearlySal} />
      )}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────
export default function ReportScreen({ userData, results, onBack, onSave, onProfiles }: Props) {
  const [tab, setTab] = useState<Tab>("integrated");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);

  const chartData   = useMemo(() => parseChartData(results["saju_chart"] ?? ""), [results]);
  const zwdsChart   = useMemo(() => parseChartData(results["zwds_chart"] ?? ""), [results]);
  const astChart    = useMemo(() => parseChartData(results["ast_chart"] ?? ""), [results]);
  const sajuSections = useMemo(() => parseSections(results["saju_combined"] ?? ""), [results]);
  const zwdsSections = useMemo(() => parseSections(results["zwds_combined"] ?? ""), [results]);
  const astSections  = useMemo(() => parseSections(results["ast_combined"] ?? ""), [results]);
  const intSections  = useMemo(() => parseSections(results["integrated"] ?? ""), [results]);

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

  const renderList = (sections: Array<{ title: string; content: string }>, accentFn?: (title: string) => string) => {
    if (sections.length === 0) {
      return (
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 text-center text-[#8e8e93] text-sm">
          분석 데이터를 불러오지 못했어요
        </div>
      );
    }
    return sections.map((s) => (
      <SectionItem key={s.title} title={s.title} content={s.content} accent={accentFn?.(s.title)} />
    ));
  };

  const sectionAccent = (title: string) => {
    if (title.includes("연애")) return "#f97316";
    if (title.includes("배우자")) return "#ec4899";
    if (title.includes("금전") || title.includes("재물")) return "#22c55e";
    if (title.includes("직업") || title.includes("적성")) return "#3b82f6";
    if (title.includes("건강")) return "#ef4444";
    if (title.includes("성격") || title.includes("기질")) return "#8b5cf6";
    if (title.includes("심리")) return "#6366f1";
    if (title.includes("말년")) return "#94a3b8";
    return "#1c1c1e";
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-[#e5e5ea] px-5 py-3">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button onClick={onBack} className="text-[#1c1c1e] text-sm font-medium">← 이전</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Yomi" style={{ width: "56px", height: "22px", objectFit: "contain" }} />
          <button onClick={onProfiles} className="text-[#8e8e93] text-xs">저장 목록</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-5 pb-24">
        {/* 기본 정보 카드 */}
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
              {userData.manseryeokImage && (
                <p className="text-emerald-500 text-xs mt-1">✓ 만세력 이미지 기반 분석</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                userData.tone === "brutal"
                  ? "bg-rose-50 text-rose-500 border-rose-100"
                  : "bg-[#f2f2f7] text-[#8e8e93] border-[#e5e5ea]"
              }`}>
                {userData.tone === "brutal" ? "🌶️ 매운맛" : "🌿 순한맛"}
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
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
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
            <div className="flex flex-col gap-2">{renderList(sajuSections, sectionAccent)}</div>
          </>
        )}

        {/* 자미두수 탭 */}
        {tab === "zwds" && (
          <>
            {zwdsChart?.gung && <ZwdsRadarChart gungData={zwdsChart.gung} />}
            {zwdsChart?.fourTransformations && (
              <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
                <p className="text-[#1c1c1e] text-sm font-semibold mb-3">사화 (四化)</p>
                {Object.entries(zwdsChart.fourTransformations).map(([k, v]) => (
                  <div key={k} className="flex gap-3 items-start mb-2 last:mb-0">
                    <span className="text-[#1c1c1e] font-bold text-xs min-w-[36px]">{k}</span>
                    <span className="text-[#3a3a3c] text-xs leading-relaxed">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">{renderList(zwdsSections, sectionAccent)}</div>
          </>
        )}

        {/* 점성술 탭 */}
        {tab === "ast" && (
          <>
            {astChart && <AstElementChart astData={astChart} />}
            {astChart?.planets && (
              <div className="bg-white border border-[#e5e5ea] rounded-3xl p-5 mb-4">
                <p className="text-[#1c1c1e] text-sm font-semibold mb-3">행성 위치</p>
                {Object.entries(astChart.planets).map(([planet, sign]) => (
                  <div key={planet} className="flex justify-between items-center py-2 border-b border-[#f2f2f7] last:border-0">
                    <span className="text-[#3a3a3c] text-sm">{planet}</span>
                    <span className="text-[#8e8e93] text-sm">{String(sign)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">{renderList(astSections, sectionAccent)}</div>
          </>
        )}

        {/* 통합 탭 */}
        {tab === "integrated" && (
          <>
            <p className="text-[#8e8e93] text-xs mb-4 px-1">
              사주·자미두수·점성술이 각자 가장 잘 보는 영역을 담당해요
            </p>
            <div className="flex flex-col gap-2">{renderList(intSections, sectionAccent)}</div>
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
