import { Filter, Layers3, Pause, Play, ScanSearch, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { TIME_HORIZONS } from '../../utils/factories';
import { MiniMap } from '../canvas/MiniMap';
import { OrnatePanel } from '../ui/OrnatePanel';

export const BottomRightCommandCluster = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { activeScenarioId, scenarios, toggleFilter, updateVisualSetting } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const activeIndex = TIME_HORIZONS.indexOf(scenario.visualSettings.timeHorizon);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const handle = window.setInterval(() => {
      const nextIndex = (TIME_HORIZONS.indexOf(scenario.visualSettings.timeHorizon) + 1) % TIME_HORIZONS.length;
      updateVisualSetting('timeHorizon', TIME_HORIZONS[nextIndex]);
    }, 1800);
    return () => window.clearInterval(handle);
  }, [playing, scenario.visualSettings.timeHorizon, updateVisualSetting]);

  return (
    <div className="absolute bottom-5 right-4 z-20 w-[360px]">
      <OrnatePanel subtitle="Mini-map, layers, filters, zoom, and horizon playback." title="Command Cluster" tone="hero">
        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="feature-card">
              <div className="feature-card__label">Time Horizon</div>
              <div className="feature-card__value text-base">{scenario.visualSettings.timeHorizon}</div>
            </div>
            <div className="feature-card">
              <div className="feature-card__label">Filters</div>
              <div className="feature-card__value text-base">
                {Object.entries(scenario.filters).filter(([, value]) => value).length}
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-card__label">Playback</div>
              <div className="feature-card__value text-base">{playing ? 'Running' : 'Paused'}</div>
            </div>
          </div>

          <MiniMap />
          <div className="grid grid-cols-2 gap-2">
            <button className="command-pill" onClick={() => zoomIn()} type="button">
              <ZoomIn size={14} />
              Zoom in
            </button>
            <button className="command-pill" onClick={() => zoomOut()} type="button">
              <ZoomOut size={14} />
              Zoom out
            </button>
            <button className="command-pill" onClick={() => fitView({ padding: 0.2, duration: 250 })} type="button">
              <ScanSearch size={14} />
              Recenter
            </button>
            <button className="command-pill" onClick={() => setFiltersOpen((value) => !value)} type="button">
              <Filter size={14} />
              Filters
            </button>
            <button className="command-pill" onClick={() => setLayersOpen((value) => !value)} type="button">
              <Layers3 size={14} />
              Layers
            </button>
            <button className="command-pill" onClick={() => setPlaying((value) => !value)} type="button">
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>

          {filtersOpen ? (
            <div className="grid grid-cols-2 gap-2 rounded-[24px] border border-brass/15 bg-black/18 p-3">
              {[
                ['operationsOnly', 'Operations'],
                ['liquidityOnly', 'Liquidity'],
                ['debtOnly', 'Debt'],
                ['geographicExposureOnly', 'Geography'],
                ['riskOnly', 'Risk'],
                ['ownershipOnly', 'Ownership'],
                ['plannedOnly', 'Planned'],
              ].map(([key, label]) => (
                <button key={key} className="palette-button" onClick={() => toggleFilter(key as Parameters<typeof toggleFilter>[0])} type="button">
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {layersOpen ? (
            <div className="grid grid-cols-2 gap-2 rounded-[24px] border border-brass/15 bg-black/18 p-3">
              {[
                ['showBackgroundMap', 'Background map'],
                ['showCountryLabels', 'Country labels'],
                ['showCashLabels', 'Cash labels'],
                ['showKpiChips', 'KPI chips'],
                ['showRiskOverlays', 'Risk overlays'],
                ['showAnalystNotes', 'Analyst notes'],
                ['showEdgeLabels', 'Edge labels'],
                ['groupRegions', 'Group regions'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className="palette-button"
                  onClick={() => updateVisualSetting(key, !(scenario.visualSettings as unknown as Record<string, boolean>)[key])}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-5 gap-1 rounded-2xl border border-brass/15 bg-black/18 p-2">
            {TIME_HORIZONS.map((horizon, index) => (
              <button
                key={horizon}
                className={index === activeIndex ? 'horizon-button horizon-button-active' : 'horizon-button'}
                onClick={() => updateVisualSetting('timeHorizon', horizon)}
                type="button"
              >
                {horizon}
              </button>
            ))}
          </div>
        </div>
      </OrnatePanel>
    </div>
  );
};
