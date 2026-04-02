import { BottomLeftAssumptionPanel } from '../layout/BottomLeftAssumptionPanel';
import { LeftBuildSidebar } from '../layout/LeftBuildSidebar';
import { RightInspectorPanel } from '../layout/RightInspectorPanel';
import { TopStatusBar } from '../layout/TopStatusBar';
import { WorldCanvas } from '../layout/WorldCanvas';

export const ScenarioBuilderView = () => (
  <div className="relative h-screen overflow-hidden bg-obsidian">
    <TopStatusBar />
    <div className="absolute inset-0 px-4 pb-4 pt-24">
      <WorldCanvas />
      <LeftBuildSidebar />
      <RightInspectorPanel />
      <BottomLeftAssumptionPanel />
    </div>
  </div>
);
