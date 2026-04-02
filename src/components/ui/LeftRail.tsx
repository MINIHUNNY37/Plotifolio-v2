import { Filter, MessageSquareMore, Plus, Route, ScanLine } from 'lucide-react';
import { entityDefinitions, overlayLabels } from '../../data/catalog';
import { useCanvas } from '../../context/CanvasContext';
import { IconGlyph } from './IconGlyph';

const groups = [
  { id: 'operating', label: 'Operating' },
  { id: 'financial', label: 'Financial' },
  { id: 'external', label: 'External' },
  { id: 'macro', label: 'Macro' },
] as const;

export const LeftRail = () => {
  const {
    activeOverlay,
    addNode,
    regionFilter,
    setOverlay,
    setRegionFilter,
    setRiskOnly,
    showRiskOnly,
  } = useCanvas();

  return (
    <aside className="left-rail">
      <div className="left-rail__tools">
        <button className="left-rail__tool is-active" type="button">
          <Plus size={15} />
          Add
        </button>
        <button className="left-rail__tool" type="button">
          <Route size={15} />
          Connect
        </button>
        <button className="left-rail__tool" type="button">
          <MessageSquareMore size={15} />
          Notes
        </button>
        <button className="left-rail__tool" type="button">
          <ScanLine size={15} />
          Focus
        </button>
      </div>

      <div className="left-rail__section">
        <div className="section-header">
          <span>Node library</span>
          <span>Drag or click</span>
        </div>
        {groups.map((group) => (
          <div key={group.id} className="library-group">
            <div className="library-group__title">{group.label}</div>
            <div className="library-group__grid">
              {Object.values(entityDefinitions)
                .filter((definition) => definition.category === group.id)
                .map((definition) => (
                  <button
                    key={definition.type}
                    className="library-card"
                    draggable
                    onClick={() => addNode(definition.type)}
                    onDragStart={(event) => event.dataTransfer.setData('application/entity-type', definition.type)}
                    type="button"
                  >
                    <IconGlyph name={definition.icon} size={16} />
                    <span>{definition.label}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="left-rail__section">
        <div className="section-header">
          <span>
            <Filter size={14} />
            Filters
          </span>
          <span>Investor view</span>
        </div>
        <div className="pill-grid">
          {['All', 'Americas', 'EMEA', 'APAC'].map((region) => (
            <button
              key={region}
              className={`pill-button ${regionFilter === region ? 'is-active' : ''}`}
              onClick={() => setRegionFilter(region as typeof regionFilter)}
              type="button"
            >
              {region}
            </button>
          ))}
        </div>
        <div className="pill-grid">
          {Object.entries(overlayLabels).map(([key, label]) => (
            <button
              key={key}
              className={`pill-button ${activeOverlay === key ? 'is-active' : ''}`}
              onClick={() => setOverlay(activeOverlay === key ? null : (key as keyof typeof overlayLabels))}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="toggle-row">
          <input checked={showRiskOnly} onChange={(event) => setRiskOnly(event.target.checked)} type="checkbox" />
          <span>Show only stressed flows</span>
        </label>
      </div>
    </aside>
  );
};
