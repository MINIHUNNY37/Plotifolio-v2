import { useEffect } from 'react';
import '@xyflow/react/dist/style.css';
import { useScenarioStore } from './store/useScenarioStore';
import { ScenarioBuilderView } from './components/views/ScenarioBuilderView';
import { ScenarioComparisonView } from './components/views/ScenarioComparisonView';
import { ScenarioLibraryView } from './components/views/ScenarioLibraryView';
import { TemplatesSettingsView } from './components/views/TemplatesSettingsView';

const ToastHost = () => {
  const { dismissToast, toast } = useScenarioStore();

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const handle = window.setTimeout(() => dismissToast(), 2400);
    return () => window.clearTimeout(handle);
  }, [dismissToast, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-brass/30 bg-obsidian/94 px-5 py-3 text-sm text-parchment shadow-panel">
      {toast.message}
    </div>
  );
};

function App() {
  const { activeView } = useScenarioStore();

  return (
    <>
      {activeView === 'library' ? <ScenarioLibraryView /> : null}
      {activeView === 'builder' ? <ScenarioBuilderView /> : null}
      {activeView === 'compare' ? <ScenarioComparisonView /> : null}
      {activeView === 'settings' ? <TemplatesSettingsView /> : null}
      <ToastHost />
    </>
  );
}

export default App;
