import { useState } from 'react';
import { useScenarioStore } from '../../store/useScenarioStore';
import { PageLayoutShell } from '../layout/PageLayoutShell';
import { NodeTemplateManager } from '../panels/NodeTemplateManager';
import { IconUploadModal } from '../panels/IconUploadModal';
import { OrnatePanel } from '../ui/OrnatePanel';

export const TemplatesSettingsView = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { addCustomIcon, customIcons, setActiveView, templateLibrary } = useScenarioStore();
  const enabledTemplates = templateLibrary.filter((template) => template.enabled).length;

  return (
    <PageLayoutShell
      actions={
        <button className="command-pill command-pill-primary" onClick={() => setActiveView('library')} type="button">
          Back to library
        </button>
      }
      description="Manage palette availability and local brand assets without changing the editor's behavior or storage model."
      eyebrow="Templates & Settings"
      stats={[
        { label: 'Enabled Templates', value: `${enabledTemplates}` },
        { label: 'Total Templates', value: `${templateLibrary.length}` },
        { label: 'Custom Icons', value: `${customIcons.length}` },
      ]}
      title="Scenario Design System"
      maxWidthClassName="max-w-[1320px]"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <OrnatePanel subtitle="Manage which templates appear in the build palette and which fields they prioritize." title="Node Template Manager" tone="hero">
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
          <div className="space-y-4 px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="feature-card">
                <div className="feature-card__label">Storage Mode</div>
                <div className="feature-card__value text-base">Local only</div>
              </div>
              <div className="feature-card">
                <div className="feature-card__label">Assets Available</div>
                <div className="feature-card__value text-base">{customIcons.length}</div>
              </div>
            </div>
            {customIcons.length === 0 ? (
              <div className="feature-card text-sm text-frost/68">
                No custom icons uploaded yet. Uploaded files are stored locally with the rest of the scenario library.
              </div>
            ) : null}
            {customIcons.map((icon) => (
              <div key={icon.id} className="feature-card flex items-center gap-3">
                <img alt={icon.name} className="h-12 w-12 rounded-2xl object-cover" src={icon.dataUrl} />
                <div>
                  <div className="text-sm font-semibold text-parchment">{icon.name}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-frost/55">Stored in local scenario settings</div>
                </div>
              </div>
            ))}
          </div>
        </OrnatePanel>
      </div>

      <IconUploadModal
        onClose={() => setUploadOpen(false)}
        onUpload={(name, dataUrl) => addCustomIcon({ id: `icon-${Date.now()}`, name, dataUrl })}
        open={uploadOpen}
      />
    </PageLayoutShell>
  );
};
