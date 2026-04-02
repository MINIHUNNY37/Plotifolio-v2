import { Copy } from 'lucide-react';
import { useScenarioStore } from '../../store/useScenarioStore';

export const ScenarioSwitcher = () => {
  const { activeScenarioId, duplicateScenario, scenarios, setActiveScenario } = useScenarioStore();

  return (
    <div className="flex items-center gap-2">
      <select className="ornate-input min-w-[220px]" value={activeScenarioId} onChange={(event) => setActiveScenario(event.target.value)}>
        {scenarios.map((scenario) => (
          <option key={scenario.metadata.id} value={scenario.metadata.id}>
            {scenario.metadata.name}
          </option>
        ))}
      </select>
      <button className="command-pill" onClick={() => duplicateScenario(activeScenarioId)} type="button">
        <Copy size={14} />
        Duplicate current
      </button>
    </div>
  );
};
