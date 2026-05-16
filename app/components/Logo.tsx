export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <defs>
        <linearGradient id="claim-e-grad" x1="4" y1="8" x2="52" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#1a56ff" />
        </linearGradient>
      </defs>
      {/* Arc ~300° sens horaire de 1h (38,11) à 11h (18,11) — ouverture centrée en haut */}
      <path d="M 38 11 A 20 20 0 1 1 18 11" stroke="url(#claim-e-grad)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* Flèche à 11h pointant vers 12h (direction clockwise) */}
      <polygon points="22,9 14,9 18,15" fill="url(#claim-e-grad)" />
      {/* Cube 3D — face du dessus */}
      <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="url(#claim-e-grad)" opacity="0.95" />
      {/* Cube 3D — face gauche */}
      <path d="M20 25.5 L28 30 L28 39 L20 34.5 Z" fill="#1a3a9f" />
      {/* Cube 3D — face droite */}
      <path d="M28 30 L36 25.5 L36 34.5 L28 39 Z" fill="#2045c0" />
      {/* Reflet léger sur la face du dessus */}
      <path d="M28 21 L36 25.5 L28 30 L20 25.5 Z" fill="white" opacity="0.18" />
    </svg>
  );
}
