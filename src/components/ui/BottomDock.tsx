import { useEffect, useState } from 'react';
import { Play, Pause, Radar, SlidersHorizontal, Workflow } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';

export const BottomDock = () => {
  const {
    activeScenario,
    mode,
    scenarios,
    setActiveScenarioId,
    timelineIndex,
    setTimelineIndex,
    timelineProgress,
  } = useCanvas();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimelineIndex((current) => {
        const next = current + 1;
        if (next >= activeScenario.timeline.length) {
          window.clearInterval(timer);
          setIsPlaying(false);
          return activeScenario.timeline.length - 1;
        }
        return next;
      });
    }, 1200);

    return () => window.clearInterval(timer);
  }, [activeScenario.timeline.length, isPlaying, setTimelineIndex]);

  return (
    <footer className="bottom-dock">
      <div className="bottom-dock__panel">
        <div className="bottom-dock__header">
          <div className="bottom-dock__title">
            <Radar size={14} />
            Scenario timeline
          </div>
          <div className="bottom-dock__meta">
            {mode} · {Math.round(timelineProgress * 100)}% progressed
          </div>
        </div>

        <div className="timeline-row">
          <button className="ghost-button" onClick={() => setIsPlaying(!isPlaying)} type="button">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <input
            className="timeline-range"
            max={Math.max(1, activeScenario.timeline.length - 1)}
            min={0}
            onChange={(event) => setTimelineIndex(Number(event.target.value))}
            type="range"
            value={timelineIndex}
          />

          <div className="timeline-chip">{activeScenario.timeline[timelineIndex]}</div>
        </div>

        <div className="timeline-labels">
          {activeScenario.timeline.map((label, index) => (
            <button
              key={label}
              className={`timeline-label ${index === timelineIndex ? 'is-active' : ''}`}
              onClick={() => setTimelineIndex(index)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bottom-dock__panel bottom-dock__panel--compact">
        <div className="bottom-dock__header">
          <div className="bottom-dock__title">
            <Workflow size={14} />
            Bull / base / bear
          </div>
          <div className="bottom-dock__meta">Quick compare presets</div>
        </div>

        <div className="pill-grid">
          {scenarios
            .filter((scenario) => scenario.id === 'bull' || scenario.id === 'base' || scenario.id === 'bear')
            .map((scenario) => (
              <button
                key={scenario.id}
                className={`pill-button ${activeScenario.id === scenario.id ? 'is-active' : ''}`}
                onClick={() => setActiveScenarioId(scenario.id)}
                type="button"
              >
                {scenario.name}
              </button>
            ))}
        </div>

        <button className="ghost-button ghost-button--block" type="button">
          <SlidersHorizontal size={14} />
          Assumption manager
        </button>
      </div>
    </footer>
  );
};
