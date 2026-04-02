import { useScenarioStore } from '../../store/useScenarioStore';

export const NodeTemplateManager = () => {
  const { templateLibrary, updateTemplateEnabled } = useScenarioStore();

  return (
    <div className="space-y-3">
      {templateLibrary.map((template) => (
        <label key={template.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brass/15 bg-black/18 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-parchment">{template.label}</div>
            <div className="text-xs text-frost/60">{template.description}</div>
          </div>
          <input checked={template.enabled} onChange={(event) => updateTemplateEnabled(template.id, event.target.checked)} type="checkbox" />
        </label>
      ))}
    </div>
  );
};
