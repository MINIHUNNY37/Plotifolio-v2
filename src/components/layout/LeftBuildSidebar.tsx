import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { resolveIcon } from '../ui/iconMap';
import { OrnatePanel } from '../ui/OrnatePanel';

const sections: Array<'Company' | 'Operations' | 'Finance' | 'Geography' | 'Risk' | 'Custom'> = [
  'Company',
  'Operations',
  'Finance',
  'Geography',
  'Risk',
  'Custom',
];

export const LeftBuildSidebar = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { recentNodeTypes, setPlacementNodeType, templateLibrary } = useScenarioStore();
  const filteredTemplates = templateLibrary.filter((template) =>
    [template.label, template.description, template.section].join(' ').toLowerCase().includes(deferredQuery.toLowerCase()),
  );

  return (
    <div className="absolute bottom-5 left-4 top-28 z-20 w-[300px]">
      <OrnatePanel className="h-full" subtitle="Drag onto the map or click once to enter place mode." title="Build Palette">
        <div className="flex h-full flex-col gap-4 px-4 py-4">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--st-text-soft)]" size={16} />
            <input className="ornate-input pl-10" onChange={(event) => setQuery(event.target.value)} placeholder="Search node types" value={query} />
          </label>

          <div>
            <div className="panel-section-kicker mb-2">Recently used</div>
            <div className="grid grid-cols-2 gap-2">
              {recentNodeTypes.map((type) => {
                const template = templateLibrary.find((candidate) => candidate.type === type);
                if (!template) {
                  return null;
                }
                const Icon = resolveIcon(template.icon);
                return (
                  <button key={template.id} className="palette-button" onClick={() => setPlacementNodeType(template.type)} type="button">
                    <Icon size={15} />
                    {template.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {filteredTemplates.filter((template) => template.enabled).length === 0 ? (
              <div className="empty-state-card">No matching node templates yet. Try a broader search or clear the filter.</div>
            ) : null}
            {sections.map((section) => (
              <div key={section}>
                <div className="panel-section-kicker mb-2">{section}</div>
                <div className="space-y-2">
                  {filteredTemplates
                    .filter((template) => template.section === section && template.enabled)
                    .map((template) => {
                      const Icon = resolveIcon(template.icon);
                      return (
                        <div
                          key={template.id}
                          className="palette-card"
                          draggable
                          onClick={() => setPlacementNodeType(template.type)}
                          onDragStart={(event) => {
                            event.dataTransfer.setData('application/investor-node', template.type);
                            event.dataTransfer.effectAllowed = 'move';
                          }}
                          title={template.description}
                        >
                          <div className="flex items-center gap-3">
                            <div className="icon-surface rounded-full">
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[var(--st-text)]">{template.label}</div>
                              <div className="text-xs leading-relaxed text-[var(--st-text-muted)]">{template.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </OrnatePanel>
    </div>
  );
};
