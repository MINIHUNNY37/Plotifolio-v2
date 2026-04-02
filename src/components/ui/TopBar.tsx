import {
  Command,
  FileOutput,
  GitCompareArrows,
  LayoutGrid,
  Presentation,
  Save,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import { overlayLabels } from '../../data/catalog';
import { useCanvas } from '../../context/CanvasContext';

const modes = [
  { id: 'build', label: 'Build', icon: LayoutGrid },
  { id: 'scenario', label: 'Scenario', icon: Sparkles },
  { id: 'compare', label: 'Compare', icon: GitCompareArrows },
  { id: 'present', label: 'Present', icon: Presentation },
] as const;

export const TopBar = () => {
  const {
    activeOverlay,
    activeScenario,
    mode,
    searchQuery,
    searchResults,
    setActiveScenarioId,
    setMode,
    setOverlay,
    setSearchQuery,
    focusCountry,
    focusNode,
    setSelection,
  } = useCanvas();

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__badge">Atlas Lab</div>
        <div>
          <div className="topbar__eyebrow">Investor graph canvas</div>
          <div className="topbar__title">Atlas Precision Systems</div>
        </div>
      </div>

      <div className="topbar__search">
        <ScanSearch size={16} />
        <input
          aria-label="Search nodes or countries"
          className="topbar__search-input"
          placeholder="Search nodes, countries, or relationship types"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Command size={14} />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                className="search-results__item"
                onClick={() => {
                  if (result.kind === 'node') {
                    focusNode(result.id);
                  } else if (result.kind === 'country') {
                    focusCountry(result.id);
                    setSelection(null);
                  } else {
                    setSelection({ kind: 'edge', id: result.id });
                  }
                  setSearchQuery('');
                }}
                type="button"
              >
                <span>{result.label}</span>
                <span>{result.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__segmented">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          return (
            <button
              key={modeOption.id}
              className={`segmented-button ${mode === modeOption.id ? 'is-active' : ''}`}
              onClick={() => setMode(modeOption.id)}
              type="button"
            >
              <Icon size={14} />
              {modeOption.label}
            </button>
          );
        })}
      </div>

      <div className="topbar__controls">
        <label className="topbar__select">
          <span>Scenario</span>
          <select value={activeScenario.id} onChange={(event) => setActiveScenarioId(event.target.value)}>
            <option value="baseline">Baseline</option>
            <option value="bull">Bull</option>
            <option value="base">Base</option>
            <option value="bear">Bear</option>
            <option value="tariff-shock">Tariff Shock</option>
          </select>
        </label>

        <label className="topbar__select">
          <span>Overlay</span>
          <select value={activeOverlay ?? ''} onChange={(event) => setOverlay((event.target.value as keyof typeof overlayLabels) || null)}>
            <option value="">None</option>
            {Object.entries(overlayLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button className="ghost-button" type="button">
          <Save size={14} />
          Save
        </button>
        <button className="ghost-button" type="button">
          <FileOutput size={14} />
          Export
        </button>
      </div>
    </header>
  );
};
