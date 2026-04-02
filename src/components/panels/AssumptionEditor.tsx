import { Pin, PinOff } from 'lucide-react';
import { useScenarioStore } from '../../store/useScenarioStore';

export const AssumptionEditor = () => {
  const { activeScenarioId, scenarios, setHighlights, toggleAssumptionPin } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];

  return (
    <div className="space-y-3">
      {scenario.assumptions.map((assumption) => (
        <div key={assumption.id} className="rounded-2xl border border-brass/15 bg-black/18 p-3">
          <div className="flex items-start justify-between gap-3">
            <button className="text-left" onClick={() => setHighlights(assumption.linkedNodeIds, assumption.linkedEdgeIds)} type="button">
              <div className="text-sm font-semibold text-parchment">{assumption.title}</div>
              <div className="mt-1 text-xs text-frost/65">{assumption.description}</div>
            </button>
            <button className="command-pill" onClick={() => toggleAssumptionPin(assumption.id)} type="button">
              {assumption.pinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-frost/50">
            {assumption.category} | {assumption.impact}
          </div>
        </div>
      ))}
    </div>
  );
};
