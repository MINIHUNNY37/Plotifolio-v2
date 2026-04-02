import type { ScenarioEdge, ScenarioNode, SummaryPanelKey, ViewMode } from '../../types/scenario';

export interface FlowNodeData {
  [key: string]: unknown;
  node: ScenarioNode;
  dimmed: boolean;
  highlighted: boolean;
  viewMode: ViewMode;
  showKpiChips: boolean;
  showCashLabels: boolean;
  activeSummaryPanel: SummaryPanelKey | null;
}

export interface FlowEdgeData {
  [key: string]: unknown;
  edge: ScenarioEdge;
  dimmed: boolean;
  highlighted: boolean;
  showLabels: boolean;
}
