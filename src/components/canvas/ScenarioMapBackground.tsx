import type { VisualSettings } from '../../types/scenario';

interface ScenarioMapBackgroundProps {
  visualSettings: VisualSettings;
}

export const ScenarioMapBackground = ({ visualSettings }: ScenarioMapBackgroundProps) => {
  if (!visualSettings.showBackgroundMap) {
    return <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,168,106,0.08),transparent_25%),linear-gradient(180deg,#0a1017,#070b11)]" />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(199,168,106,0.1),transparent_18%),radial-gradient(circle_at_70%_20%,rgba(120,191,208,0.08),transparent_20%),linear-gradient(180deg,#0e1721,#070b11)]" />
      <div className="absolute inset-0 bg-bronze-grid bg-[size:88px_88px] opacity-25" />
      <svg className="absolute inset-0 h-full w-full opacity-80" preserveAspectRatio="none" viewBox="0 0 1600 900">
        <defs>
          <linearGradient id="continent" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(24,52,67,0.8)" />
            <stop offset="100%" stopColor="rgba(12,24,34,0.92)" />
          </linearGradient>
        </defs>
        <g fill="url(#continent)" stroke="rgba(199,168,106,0.12)" strokeWidth="2">
          <path d="M60 250C120 140 290 80 420 120C490 140 520 210 515 285C440 340 390 410 260 430C185 440 98 375 60 250Z" />
          <path d="M540 145C620 92 790 88 900 140C1010 192 1060 300 1030 370C950 405 870 392 770 418C625 450 540 375 515 272C512 226 525 180 540 145Z" />
          <path d="M1110 205C1170 155 1300 145 1410 170C1510 192 1560 260 1540 330C1500 384 1420 420 1310 430C1205 438 1115 392 1082 300C1070 260 1080 228 1110 205Z" />
          <path d="M980 495C1065 438 1225 435 1340 478C1420 518 1456 595 1430 662C1360 714 1240 736 1130 720C1052 708 972 648 950 575C946 543 958 515 980 495Z" />
        </g>
        {visualSettings.showCountryLabels ? (
          <g fill="rgba(235,228,210,0.68)" fontFamily="Palatino Linotype, serif" fontSize="24" letterSpacing="6">
            <text x="250" y="470">AMERICAS</text>
            <text x="695" y="465">EMEA</text>
            <text x="1180" y="470">APAC</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};
