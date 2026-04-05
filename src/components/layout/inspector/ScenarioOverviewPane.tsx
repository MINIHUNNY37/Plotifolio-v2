import type { Scenario } from '../../../types/scenario';
import { InspectorFieldRow } from './InspectorFieldRow';
import { InspectorSection } from './InspectorSection';

interface ScenarioOverviewPaneProps {
  scenario: Scenario;
  onScenarioNotesChange: (value: string) => void;
}

export const ScenarioOverviewPane = ({
  scenario,
  onScenarioNotesChange,
}: ScenarioOverviewPaneProps) => (
  <InspectorSection>
    <div className="rounded-2xl border border-brass/15 bg-black/18 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-frost/50">Scenario Overview</div>
      <div className="mt-2 text-sm text-frost/75">{scenario.metadata.assumptionsSummary}</div>
    </div>

    <InspectorFieldRow label="Scenario notes">
      <textarea
        className="ornate-input min-h-36"
        value={scenario.notes}
        onChange={(event) => onScenarioNotesChange(event.target.value)}
      />
    </InspectorFieldRow>

    <div className="rounded-2xl border border-brass/15 bg-black/18 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-frost/50">Recent changes</div>
      <div className="mt-2 space-y-2 text-sm text-frost/70">
        {scenario.changeLog.slice(0, 5).map((entry) => (
          <div key={entry.id}>{entry.message}</div>
        ))}
      </div>
    </div>
  </InspectorSection>
);
