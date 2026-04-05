import { useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { NodeTemplateManager } from '../panels/NodeTemplateManager';
import { IconUploadModal } from '../panels/IconUploadModal';
import { OrnatePanel } from '../ui/OrnatePanel';

export const TemplatesSettingsView = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { addCustomIcon, customIcons, setActiveView } = useScenarioStore();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0d1724,#070b11)] px-6 py-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-brass/80">Templates & Settings</div>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.18em] text-parchment">Scenario Design System</h1>
          </div>
          <button className="command-pill command-pill-primary" onClick={() => setActiveView('library')} type="button">
            Back to library
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <OrnatePanel subtitle="Manage which templates appear in the build palette and which fields they prioritize." title="Node Template Manager">
            <div className="px-4 py-4">
              <NodeTemplateManager />
            </div>
          </OrnatePanel>

          <OrnatePanel
            actions={
              <button className="command-pill command-pill-primary" onClick={() => setUploadOpen(true)} type="button">
                Upload icon
              </button>
            }
            subtitle="Store local logos and icon variants for company-specific maps."
            title="Icon Library"
          >
            <div className="space-y-3 px-4 py-4">
              {customIcons.length === 0 ? <div className="rounded-2xl border border-brass/15 bg-black/18 p-4 text-sm text-frost/65">No custom icons uploaded yet.</div> : null}
              {customIcons.map((icon) => (
                <div key={icon.id} className="flex items-center gap-3 rounded-2xl border border-brass/15 bg-black/18 p-3">
                  <img alt={icon.name} className="h-10 w-10 rounded-xl object-cover" src={icon.dataUrl} />
                  <div>
                    <div className="text-sm font-semibold text-parchment">{icon.name}</div>
                    <div className="text-xs text-frost/60">Stored in local scenario settings</div>
                  </div>
                </div>
              ))}
            </div>
          </OrnatePanel>
        </div>
      </div>

      <IconUploadModal
        onClose={() => setUploadOpen(false)}
        onUpload={(name, dataUrl) => addCustomIcon({ id: `icon-${Date.now()}`, name, dataUrl })}
        open={uploadOpen}
      />
    </div>
  );
};
