export default function FlowerLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 꽃잎 6장 */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="16"
          cy="16"
          rx="3.2"
          ry="7"
          fill="white"
          fillOpacity="0.85"
          transform={`rotate(${angle} 16 16) translate(0 -5)`}
        />
      ))}
      {/* 중심 */}
      <circle cx="16" cy="16" r="3" fill="white" />
    </svg>
  );
}
