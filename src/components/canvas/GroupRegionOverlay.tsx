import type { VisualSettings } from '../../types/scenario';

interface GroupRegionOverlayProps {
  visualSettings: VisualSettings;
}

export const GroupRegionOverlay = ({ visualSettings }: GroupRegionOverlayProps) => {
  if (!visualSettings.groupRegions) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none absolute left-[7%] top-[62%] rounded-full border border-brass/20 bg-obsidian/55 px-4 py-1 text-[10px] uppercase tracking-[0.24em] text-frost/65">
        Americas Cluster
      </div>
      <div className="pointer-events-none absolute left-[43%] top-[18%] rounded-full border border-brass/20 bg-obsidian/55 px-4 py-1 text-[10px] uppercase tracking-[0.24em] text-frost/65">
        EMEA Finance Layer
      </div>
      <div className="pointer-events-none absolute left-[67%] top-[12%] rounded-full border border-brass/20 bg-obsidian/55 px-4 py-1 text-[10px] uppercase tracking-[0.24em] text-frost/65">
        APAC Operations Layer
      </div>
    </>
  );
};
