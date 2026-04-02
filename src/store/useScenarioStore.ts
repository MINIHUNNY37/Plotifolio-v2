import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { demoScenarios } from '../data/demoScenarios';
import { defaultNodeTemplates } from '../data/templates';
import type {
  BuilderSelection,
  CustomIconAsset,
  EdgeKind,
  FilterKey,
  HistorySnapshot,
  NodeKind,
  NodeTemplate,
  Scenario,
  ScenarioAssumption,
  ScenarioEdge,
  ScenarioNode,
  ScenarioView,
  SummaryPanelKey,
} from '../types/scenario';
import { buildScenarioDelta } from '../utils/scenarioDiff';

interface ScenarioStore {
  activeView: ScenarioView;
  activeScenarioId: string;
  compareScenarioIds: [string, string];
  scenarios: Scenario[];
  templateLibrary: NodeTemplate[];
  customIcons: CustomIconAsset[];
  selection: BuilderSelection;
  highlightedNodeIds: string[];
  highlightedEdgeIds: string[];
  activeSummaryPanel: SummaryPanelKey | null;
  placementNodeType: NodeKind | null;
  recentNodeTypes: NodeKind[];
  toast: { id: string; message: string } | null;
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
  };
  setActiveView: (view: ScenarioView) => void;
  setActiveScenario: (scenarioId: string) => void;
  setCompareScenario: (slot: 0 | 1, scenarioId: string) => void;
  setSelection: (selection: BuilderSelection) => void;
  clearSelection: () => void;
  setHighlights: (nodeIds: string[], edgeIds?: string[]) => void;
  clearHighlights: () => void;
  openSummaryPanel: (panel: SummaryPanelKey | null) => void;
  setPlacementNodeType: (nodeType: NodeKind | null) => void;
  createScenario: (name: string, scenarioType?: Scenario['metadata']['scenarioType']) => void;
  duplicateScenario: (scenarioId?: string) => void;
  saveActiveScenario: () => void;
  updateScenarioNotes: (notes: string) => void;
  updateScenarioMetadata: (path: string, value: string) => void;
  updateVisualSetting: (path: string, value: boolean | string) => void;
  toggleFilter: (filter: FilterKey) => void;
  addNode: (node: ScenarioNode) => void;
  updateNode: (nodeId: string, updater: (node: ScenarioNode) => ScenarioNode) => void;
  updateNodeField: (nodeId: string, path: string, value: string | number | boolean | string[]) => void;
  resetNodeFieldToParent: (nodeId: string, path: string) => void;
  moveNodes: (positions: { id: string; position: ScenarioNode['position'] }[]) => void;
  duplicateNode: (nodeId: string) => void;
  duplicateSelectedNodes: () => void;
  alignSelectedNodes: (axis: 'x' | 'y') => void;
  groupSelectedNodes: () => void;
  deleteSelectedNodes: () => void;
  addEdge: (edge: ScenarioEdge) => void;
  updateEdge: (edgeId: string, updater: (edge: ScenarioEdge) => ScenarioEdge) => void;
  updateEdgeField: (edgeId: string, path: string, value: string | number | boolean | null) => void;
  resetEdgeFieldToParent: (edgeId: string, path: string) => void;
  reverseEdge: (edgeId: string) => void;
  convertEdgeType: (edgeId: string, nextType: EdgeKind) => void;
  deleteEdge: (edgeId: string) => void;
  updateAssumption: (assumptionId: string, updater: (assumption: ScenarioAssumption) => ScenarioAssumption) => void;
  toggleAssumptionPin: (assumptionId: string) => void;
  addCustomIcon: (asset: CustomIconAsset) => void;
  updateTemplateEnabled: (templateId: string, enabled: boolean) => void;
  pushToast: (message: string) => void;
  dismissToast: () => void;
  undo: () => void;
  redo: () => void;
}

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const cloneScenarios = (scenarios: Scenario[]) => structuredClone(scenarios);

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const getPathValue = (source: Record<string, unknown>, path: string) =>
  path.split('.').reduce<unknown>((current, key) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), source);

const setPathValue = (source: Record<string, unknown>, path: string, value: unknown) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) {
    return;
  }

  const target = keys.reduce<Record<string, unknown>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key] as Record<string, unknown>;
  }, source);

  target[lastKey] = value;
};

const snapshot = (scenarios: Scenario[], activeScenarioId: string, compareScenarioIds: [string, string]): HistorySnapshot => ({
  scenarios: cloneScenarios(scenarios),
  activeScenarioId,
  compareScenarioIds: [...compareScenarioIds] as [string, string],
});

const syncScenario = (scenario: Scenario, scenarios: Scenario[], dirty = true) => {
  scenario.metadata.updatedAt = new Date().toISOString();
  scenario.metadata.countries = Array.from(
    new Set(
      scenario.nodes
        .map((node) => {
          if (node.type === 'company') {
            return node.metadata.headquartersCountry;
          }
          if (node.type === 'country') {
            return node.metadata.countryName;
          }
          return 'country' in node.metadata ? String(node.metadata.country) : '';
        })
        .filter((value) => value.length > 0),
    ),
  );
  scenario.metadata.assumptionsSummary = scenario.assumptions.slice(0, 2).map((assumption) => assumption.title).join(' | ');
  if (dirty) {
    scenario.metadata.saveState = 'dirty';
  }
  scenarios.forEach((candidate) => {
    candidate.delta = buildScenarioDelta(
      candidate.metadata.parentScenarioId ? scenarios.find((parent) => parent.metadata.id === candidate.metadata.parentScenarioId) : undefined,
      candidate,
    );
  });
};

const getParentFieldValue = (scenarios: Scenario[], activeScenario: Scenario, entityKind: 'node' | 'edge', entityId: string, path: string) => {
  if (!activeScenario.metadata.parentScenarioId) {
    return undefined;
  }
  const parentScenario = scenarios.find((scenario) => scenario.metadata.id === activeScenario.metadata.parentScenarioId);
  const entity =
    entityKind === 'node'
      ? parentScenario?.nodes.find((node) => node.id === entityId)
      : parentScenario?.edges.find((edge) => edge.id === entityId);

  if (!entity) {
    return undefined;
  }
  return getPathValue(entity as unknown as Record<string, unknown>, path);
};

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => {
      const mutateActiveScenario = (label: string, recipe: (scenarios: Scenario[], activeScenario: Scenario) => void) => {
        const current = get();
        const previous = snapshot(current.scenarios, current.activeScenarioId, current.compareScenarioIds);

        set((state) => {
          const scenarios = cloneScenarios(state.scenarios);
          const activeScenario = scenarios.find((scenario) => scenario.metadata.id === state.activeScenarioId);
          if (!activeScenario) {
            return state;
          }

          recipe(scenarios, activeScenario);
          activeScenario.changeLog = [
            { id: createId('log'), timestamp: new Date().toISOString(), message: label },
            ...activeScenario.changeLog,
          ].slice(0, 24);
          syncScenario(activeScenario, scenarios);

          return {
            scenarios,
            history: {
              past: [...state.history.past, previous].slice(-40),
              future: [],
            },
            toast: { id: createId('toast'), message: label },
          };
        });
      };

      return {
        activeView: 'library',
        activeScenarioId: demoScenarios[0].metadata.id,
        compareScenarioIds: [demoScenarios[0].metadata.id, demoScenarios[1].metadata.id],
        scenarios: demoScenarios,
        templateLibrary: defaultNodeTemplates,
        customIcons: [],
        selection: { nodeId: null, edgeId: null, nodeIds: [] },
        highlightedNodeIds: [],
        highlightedEdgeIds: [],
        activeSummaryPanel: null,
        placementNodeType: null,
        recentNodeTypes: ['company', 'factory', 'bank'],
        toast: null,
        history: { past: [], future: [] },
        setActiveView: (view) => set({ activeView: view }),
        setActiveScenario: (scenarioId) =>
          set({
            activeScenarioId: scenarioId,
            activeView: 'builder',
            selection: { nodeId: null, edgeId: null, nodeIds: [] },
            activeSummaryPanel: null,
            highlightedNodeIds: [],
            highlightedEdgeIds: [],
          }),
        setCompareScenario: (slot, scenarioId) =>
          set((state) => {
            const next = [...state.compareScenarioIds] as [string, string];
            next[slot] = scenarioId;
            return { compareScenarioIds: next };
          }),
        setSelection: (selection) =>
          set((state) => {
            if (
              state.selection.nodeId === selection.nodeId &&
              state.selection.edgeId === selection.edgeId &&
              arraysEqual(state.selection.nodeIds, selection.nodeIds)
            ) {
              return state;
            }
            return { selection };
          }),
        clearSelection: () =>
          set((state) => {
            if (state.selection.nodeId === null && state.selection.edgeId === null && state.selection.nodeIds.length === 0) {
              return state;
            }
            return { selection: { nodeId: null, edgeId: null, nodeIds: [] } };
          }),
        setHighlights: (nodeIds, edgeIds = []) =>
          set((state) => {
            if (arraysEqual(state.highlightedNodeIds, nodeIds) && arraysEqual(state.highlightedEdgeIds, edgeIds)) {
              return state;
            }
            return { highlightedNodeIds: nodeIds, highlightedEdgeIds: edgeIds };
          }),
        clearHighlights: () =>
          set((state) => {
            if (state.highlightedNodeIds.length === 0 && state.highlightedEdgeIds.length === 0) {
              return state;
            }
            return { highlightedNodeIds: [], highlightedEdgeIds: [] };
          }),
        openSummaryPanel: (panel) => set({ activeSummaryPanel: panel }),
        setPlacementNodeType: (nodeType) => set({ placementNodeType: nodeType }),
        createScenario: (name, scenarioType = 'Base') => {
          const store = get();
          const sourceScenario = store.scenarios.find((scenario) => scenario.metadata.id === store.activeScenarioId) ?? store.scenarios[0];
          const nextScenario = structuredClone(sourceScenario);
          const timestamp = new Date().toISOString();
          nextScenario.metadata = {
            ...nextScenario.metadata,
            id: createId('scenario'),
            name,
            scenarioType,
            parentScenarioId: sourceScenario.metadata.id,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastSavedAt: timestamp,
            saveState: 'dirty',
            status: 'Draft',
          };
          nextScenario.changeLog = [{ id: createId('log'), timestamp, message: `Created scenario ${name}.` }];
          nextScenario.delta = buildScenarioDelta(sourceScenario, nextScenario);

          set((state) => ({
            scenarios: [...state.scenarios, nextScenario],
            activeScenarioId: nextScenario.metadata.id,
            activeView: 'builder',
            toast: { id: createId('toast'), message: `Created scenario ${name}.` },
          }));
        },
        duplicateScenario: (scenarioId) => {
          const store = get();
          const sourceScenario = store.scenarios.find((scenario) => scenario.metadata.id === (scenarioId ?? store.activeScenarioId));
          if (!sourceScenario) {
            return;
          }

          const timestamp = new Date().toISOString();
          const nextScenario = structuredClone(sourceScenario);
          nextScenario.metadata = {
            ...nextScenario.metadata,
            id: createId('scenario'),
            name: `${sourceScenario.metadata.name} Copy`,
            parentScenarioId: sourceScenario.metadata.id,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastSavedAt: timestamp,
            saveState: 'dirty',
            status: 'Draft',
          };
          nextScenario.changeLog = [{ id: createId('log'), timestamp, message: 'Duplicated from active scenario.' }];
          nextScenario.delta = buildScenarioDelta(sourceScenario, nextScenario);

          set((state) => ({
            scenarios: [...state.scenarios, nextScenario],
            activeScenarioId: nextScenario.metadata.id,
            activeView: 'builder',
            toast: { id: createId('toast'), message: `Duplicated ${sourceScenario.metadata.name}.` },
          }));
        },
        saveActiveScenario: () =>
          set((state) => {
            const scenarios = cloneScenarios(state.scenarios);
            const activeScenario = scenarios.find((scenario) => scenario.metadata.id === state.activeScenarioId);
            if (!activeScenario) {
              return state;
            }
            const timestamp = new Date().toISOString();
            activeScenario.metadata.lastSavedAt = timestamp;
            activeScenario.metadata.updatedAt = timestamp;
            activeScenario.metadata.saveState = 'saved';
            return { scenarios, toast: { id: createId('toast'), message: 'Scenario saved locally.' } };
          }),
        updateScenarioNotes: (notes) => mutateActiveScenario('Updated scenario narrative.', (_scenarios, activeScenario) => { activeScenario.notes = notes; }),
        updateScenarioMetadata: (path, value) =>
          mutateActiveScenario('Updated scenario metadata.', (_scenarios, activeScenario) => {
            setPathValue(activeScenario.metadata as unknown as Record<string, unknown>, path, value);
          }),
        updateVisualSetting: (path, value) =>
          mutateActiveScenario('Updated scenario visual settings.', (_scenarios, activeScenario) => {
            setPathValue(activeScenario.visualSettings as unknown as Record<string, unknown>, path, value);
          }),
        toggleFilter: (filter) =>
          mutateActiveScenario(`Toggled ${filter}.`, (_scenarios, activeScenario) => {
            activeScenario.filters[filter] = !activeScenario.filters[filter];
          }),
        addNode: (node) =>
          mutateActiveScenario(`Placed ${node.title}.`, (_scenarios, activeScenario) => {
            activeScenario.nodes.push(node);
          }),
        updateNode: (nodeId, updater) =>
          mutateActiveScenario('Updated node details.', (_scenarios, activeScenario) => {
            activeScenario.nodes = activeScenario.nodes.map((node) => (node.id === nodeId ? updater(node) : node));
          }),
        updateNodeField: (nodeId, path, value) =>
          mutateActiveScenario('Updated node field.', (_scenarios, activeScenario) => {
            const node = activeScenario.nodes.find((candidate) => candidate.id === nodeId);
            if (!node) {
              return;
            }
            setPathValue(node as unknown as Record<string, unknown>, path, value);
            if (activeScenario.metadata.parentScenarioId) {
              node.scenarioFlags.isChanged = true;
              if (node.scenarioFlags.tone === 'unchanged') {
                node.scenarioFlags.tone = 'improved';
              }
            }
          }),
        resetNodeFieldToParent: (nodeId, path) =>
          mutateActiveScenario('Reset node field to parent scenario.', (scenarios, activeScenario) => {
            const node = activeScenario.nodes.find((candidate) => candidate.id === nodeId);
            const parentValue = node ? getParentFieldValue(scenarios, activeScenario, 'node', nodeId, path) : undefined;
            if (node && parentValue !== undefined) {
              setPathValue(node as unknown as Record<string, unknown>, path, parentValue);
            }
          }),
        moveNodes: (positions) =>
          mutateActiveScenario('Repositioned nodes on the map.', (_scenarios, activeScenario) => {
            activeScenario.nodes = activeScenario.nodes.map((node) => {
              const match = positions.find((position) => position.id === node.id);
              return match ? { ...node, position: match.position } : node;
            });
          }),
        duplicateNode: (nodeId) =>
          mutateActiveScenario('Duplicated selected node.', (_scenarios, activeScenario) => {
            const source = activeScenario.nodes.find((node) => node.id === nodeId);
            if (!source) {
              return;
            }
            activeScenario.nodes.push({
              ...structuredClone(source),
              id: createId(source.type),
              title: `${source.title} Copy`,
              position: { x: source.position.x + 40, y: source.position.y + 40 },
              scenarioFlags: { ...source.scenarioFlags, isChanged: true, tone: 'added' },
            });
          }),
        duplicateSelectedNodes: () => {
          get().selection.nodeIds.forEach((nodeId) => get().duplicateNode(nodeId));
        },
        alignSelectedNodes: (axis) =>
          mutateActiveScenario(`Aligned selected nodes on ${axis.toUpperCase()}.`, (_scenarios, activeScenario) => {
            const selectedNodes = activeScenario.nodes.filter((node) => get().selection.nodeIds.includes(node.id));
            if (selectedNodes.length < 2) {
              return;
            }
            const targetValue = Math.round(selectedNodes.reduce((total, node) => total + node.position[axis], 0) / selectedNodes.length);
            activeScenario.nodes = activeScenario.nodes.map((node) =>
              get().selection.nodeIds.includes(node.id)
                ? { ...node, position: { ...node.position, [axis]: targetValue } }
                : node,
            );
          }),
        groupSelectedNodes: () =>
          mutateActiveScenario('Tagged selected nodes into a working group.', (_scenarios, activeScenario) => {
            const groupTag = `Group ${activeScenario.changeLog.length + 1}`;
            activeScenario.nodes = activeScenario.nodes.map((node) =>
              get().selection.nodeIds.includes(node.id) && !node.tags.includes(groupTag)
                ? { ...node, tags: [...node.tags, groupTag] }
                : node,
            );
          }),
        deleteSelectedNodes: () =>
          mutateActiveScenario('Removed selected nodes from the scenario.', (_scenarios, activeScenario) => {
            const selectedIds = new Set(get().selection.nodeIds);
            activeScenario.nodes = activeScenario.nodes.filter((node) => !selectedIds.has(node.id));
            activeScenario.edges = activeScenario.edges.filter((edge) => !selectedIds.has(edge.source) && !selectedIds.has(edge.target));
          }),
        addEdge: (edge) =>
          mutateActiveScenario(`Created ${edge.label}.`, (_scenarios, activeScenario) => {
            activeScenario.edges.push(edge);
          }),
        updateEdge: (edgeId, updater) =>
          mutateActiveScenario('Updated connection details.', (_scenarios, activeScenario) => {
            activeScenario.edges = activeScenario.edges.map((edge) => (edge.id === edgeId ? updater(edge) : edge));
          }),
        updateEdgeField: (edgeId, path, value) =>
          mutateActiveScenario('Updated connection field.', (_scenarios, activeScenario) => {
            const edge = activeScenario.edges.find((candidate) => candidate.id === edgeId);
            if (!edge) {
              return;
            }
            setPathValue(edge as unknown as Record<string, unknown>, path, value);
            if (activeScenario.metadata.parentScenarioId) {
              edge.scenarioFlags.isChanged = true;
              if (edge.scenarioFlags.tone === 'unchanged') {
                edge.scenarioFlags.tone = 'improved';
              }
            }
          }),
        resetEdgeFieldToParent: (edgeId, path) =>
          mutateActiveScenario('Reset connection field to parent scenario.', (scenarios, activeScenario) => {
            const edge = activeScenario.edges.find((candidate) => candidate.id === edgeId);
            const parentValue = edge ? getParentFieldValue(scenarios, activeScenario, 'edge', edgeId, path) : undefined;
            if (edge && parentValue !== undefined) {
              setPathValue(edge as unknown as Record<string, unknown>, path, parentValue);
            }
          }),
        reverseEdge: (edgeId) =>
          mutateActiveScenario('Reversed connection direction.', (_scenarios, activeScenario) => {
            const edge = activeScenario.edges.find((candidate) => candidate.id === edgeId);
            if (edge) {
              [edge.source, edge.target] = [edge.target, edge.source];
            }
          }),
        convertEdgeType: (edgeId, nextType) =>
          mutateActiveScenario(`Converted connection to ${nextType}.`, (_scenarios, activeScenario) => {
            const edge = activeScenario.edges.find((candidate) => candidate.id === edgeId);
            if (edge) {
              edge.type = nextType;
              edge.styleConfig.preset = nextType;
            }
          }),
        deleteEdge: (edgeId) =>
          mutateActiveScenario('Deleted connection.', (_scenarios, activeScenario) => {
            activeScenario.edges = activeScenario.edges.filter((edge) => edge.id !== edgeId);
          }),
        updateAssumption: (assumptionId, updater) =>
          mutateActiveScenario('Updated scenario assumption.', (_scenarios, activeScenario) => {
            activeScenario.assumptions = activeScenario.assumptions.map((assumption) =>
              assumption.id === assumptionId ? updater(assumption) : assumption,
            );
          }),
        toggleAssumptionPin: (assumptionId) =>
          mutateActiveScenario('Updated assumption pin state.', (_scenarios, activeScenario) => {
            activeScenario.assumptions = activeScenario.assumptions.map((assumption) =>
              assumption.id === assumptionId ? { ...assumption, pinned: !assumption.pinned } : assumption,
            );
          }),
        addCustomIcon: (asset) => set((state) => ({ customIcons: [...state.customIcons, asset] })),
        updateTemplateEnabled: (templateId, enabled) =>
          set((state) => ({
            templateLibrary: state.templateLibrary.map((template) => (template.id === templateId ? { ...template, enabled } : template)),
          })),
        pushToast: (message) => set({ toast: { id: createId('toast'), message } }),
        dismissToast: () => set({ toast: null }),
        undo: () =>
          set((state) => {
            const previous = state.history.past[state.history.past.length - 1];
            if (!previous) {
              return state;
            }
            const current = snapshot(state.scenarios, state.activeScenarioId, state.compareScenarioIds);
            return {
              scenarios: previous.scenarios,
              activeScenarioId: previous.activeScenarioId,
              compareScenarioIds: previous.compareScenarioIds,
              history: {
                past: state.history.past.slice(0, -1),
                future: [current, ...state.history.future].slice(0, 40),
              },
              toast: { id: createId('toast'), message: 'Undid last change.' },
            };
          }),
        redo: () =>
          set((state) => {
            const next = state.history.future[0];
            if (!next) {
              return state;
            }
            const current = snapshot(state.scenarios, state.activeScenarioId, state.compareScenarioIds);
            return {
              scenarios: next.scenarios,
              activeScenarioId: next.activeScenarioId,
              compareScenarioIds: next.compareScenarioIds,
              history: {
                past: [...state.history.past, current].slice(-40),
                future: state.history.future.slice(1),
              },
              toast: { id: createId('toast'), message: 'Reapplied change.' },
            };
          }),
      };
    },
    {
      name: 'investor-world-map-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeView: state.activeView,
        activeScenarioId: state.activeScenarioId,
        compareScenarioIds: state.compareScenarioIds,
        scenarios: state.scenarios,
        templateLibrary: state.templateLibrary,
        customIcons: state.customIcons,
        recentNodeTypes: state.recentNodeTypes,
      }),
    },
  ),
);
