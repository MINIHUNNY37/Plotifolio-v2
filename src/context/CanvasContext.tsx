/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  startTransition,
  useContext,
  useDeferredValue,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { countryAnchors, entityDefinitions, overlayLabels } from '../data/catalog';
import { demoEdges, demoNodes, scenarios } from '../data/demoGraph';
import {
  buildSnapshot,
  findNearestCountry,
  getClusterOffset,
  getNeighborIds,
  getNodeWorldPosition,
  getSearchResults,
  updateMetricValue,
} from '../utils/model';
import type {
  CanvasMode,
  EdgeType,
  EntityType,
  GraphEdge,
  GraphNode,
  OverlayKey,
  RegionId,
  Scenario,
  SearchResult,
  SelectionState,
  XY,
} from '../types';

interface CanvasApi {
  focusWorldPoint: (point: XY, nextScale?: number) => void;
  fitToWorldPoints: (points: XY[]) => void;
}

interface ConnectionDraft {
  sourceId: string;
  pointer: XY;
}

interface ConnectionTarget {
  sourceId: string;
  targetId: string;
  point: XY;
}

interface ContextMenuState {
  kind: 'node' | 'edge';
  id: string;
  x: number;
  y: number;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

interface CanvasContextType {
  mode: CanvasMode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeScenario: Scenario;
  scenarios: Scenario[];
  activeOverlay: OverlayKey | null;
  selection: SelectionState | null;
  hoveredId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];
  timelineIndex: number;
  timelineProgress: number;
  regionFilter: RegionId | 'All';
  showRiskOnly: boolean;
  showMapLabels: boolean;
  showRegionHalos: boolean;
  investorRibbonExpanded: boolean;
  viewport: ViewportState;
  connectionDraft: ConnectionDraft | null;
  connectionTarget: ConnectionTarget | null;
  contextMenu: ContextMenuState | null;
  snapshot: ReturnType<typeof buildSnapshot>;
  highlightedNodeIds: string[];
  highlightedEdgeIds: string[];
  setMode: (nextMode: CanvasMode) => void;
  setSelection: (selection: SelectionState | null) => void;
  setHoveredId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveScenarioId: (scenarioId: string) => void;
  setTimelineIndex: Dispatch<SetStateAction<number>>;
  setOverlay: (overlay: OverlayKey | null) => void;
  setRegionFilter: (region: RegionId | 'All') => void;
  setRiskOnly: (value: boolean) => void;
  setShowMapLabels: (value: boolean) => void;
  setShowRegionHalos: (value: boolean) => void;
  setInvestorRibbonExpanded: (value: boolean) => void;
  registerCanvasApi: (api: CanvasApi | null) => void;
  setViewport: (viewport: ViewportState) => void;
  fitToFootprint: () => void;
  focusNode: (nodeId: string) => void;
  focusCountry: (countryCode: string) => void;
  addNode: (type: EntityType, worldPosition?: XY) => void;
  moveNode: (nodeId: string, worldPosition: XY, forceCountryCode?: string | null) => void;
  recenterNode: (nodeId: string) => void;
  toggleNodePin: (nodeId: string) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  updateNodeMetric: (nodeId: string, metric: string, value: number, scope?: 'baseline' | 'scenario') => void;
  updateEdgeMetric: (edgeId: string, metric: string, value: number, scope?: 'baseline' | 'scenario') => void;
  beginConnection: (sourceId: string, pointer: XY) => void;
  updateConnectionPointer: (pointer: XY) => void;
  queueConnectionTarget: (targetId: string, point: XY) => void;
  completeConnection: (edgeType: EdgeType) => void;
  cancelConnection: () => void;
  openContextMenu: (kind: 'node' | 'edge', id: string, x: number, y: number) => void;
  closeContextMenu: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const defaultMetricsByType: Record<EntityType, Record<string, number>> = {
  companyHq: { revenue: 1200, ebitdaMargin: 24, fcf: 180, capex: 70, fairValue: 3200, upsideDownside: 12 },
  factory: { capacity: 800, utilization: 65, unitCost: 32, output: 520, capex: 48, reliability: 78 },
  warehouse: { inventoryDays: 36, fillRate: 94, storageCost: 12, throughput: 780, reliability: 80, opex: 22 },
  office: { headcount: 60, opex: 14, salesCoverage: 62, productivity: 72 },
  portLogistics: { throughput: 1200, transitTime: 12, reliability: 84, shippingCost: 5.2, leadTime: 18 },
  bank: { facilitySize: 300, interestRate: 5.6, liquidityHeadroom: 110, spread: 1.8, reliability: 90 },
  debtInstrument: { principal: 400, coupon: 5.2, maturityYear: 2030, spread: 2.4 },
  cashPool: { cashBalance: 140, trappedCash: 18, yield: 3.1, liquidityHeadroom: 110 },
  revenueStream: { revenue: 520, volume: 280, asp: 1.44, grossMargin: 31, growth: 4, dso: 42 },
  costCenter: { opex: 32, fxScore: 18, reliability: 90, headcount: 90 },
  supplier: { spendShare: 14, leadTime: 28, reliability: 78, fxScore: 34, tariffScore: 16 },
  customer: { revenueShare: 11, growth: 4, dso: 45, reliability: 84, volume: 210 },
  countryRegion: { fxScore: 36, tariffScore: 18, rateLevel: 3.8, geopoliticalRisk: 30, reliability: 72, tax: 24 },
  businessSegment: { revenue: 420, grossMargin: 28, growth: 5 },
  productLine: { revenue: 220, grossMargin: 33, volume: 180, asp: 1.21 },
  subsidiaryJv: { revenue: 190, cashBalance: 48, principal: 80 },
  distributionChannel: { volume: 180, grossMargin: 26, dso: 39 },
  endMarket: { growth: 3, reliability: 68, revenueShare: 12 },
  commodityInput: { pricePerUnit: 1.2, volume: 280, fxScore: 44, tariffScore: 12 },
  investmentProject: { capex: 120, fairValue: 180, output: 90, roic: 14 },
  regulatoryBody: { rateLevel: 4.1, tariffScore: 12, geopoliticalRisk: 26 },
};

const defaultTermsByEdge: Record<EdgeType, Record<string, number>> = {
  operationalFlow: { volume: 80, reliability: 88, exposureWeight: 34 },
  goodsFlow: { volume: 240, pricePerUnit: 18, leadTime: 21, transferCost: 7.5 },
  logisticsFlow: { shippingCost: 6.2, transitTime: 12, reliability: 82 },
  cashFlow: { paymentDays: 35, cashLag: 12, fxExposure: 18 },
  financingFlow: { spread: 2.1, facilitySize: 220, exposureWeight: 32 },
  debtServicingFlow: { principal: 320, coupon: 5.4, cashLag: 90 },
  ownershipControl: { exposureWeight: 51 },
  dependencyExposure: { exposureWeight: 46, reliability: 70 },
  pricingLinkage: { passThrough: 58, pricePerUnit: 1.2 },
  supplyAgreement: { contractDuration: 2, volume: 180, reliability: 81 },
  revenueConversion: { asp: 1.34, volume: 240, grossMargin: 29, paymentDays: 38 },
  regionalMacroInfluence: { fxExposure: 41, tariffExposure: 23, stress: 38 },
};

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const createNodeLabel = (type: EntityType, existingNodes: GraphNode[]) => {
  const definition = entityDefinitions[type];
  const nextIndex = existingNodes.filter((node) => node.type === type).length + 1;
  return `${definition.label} ${nextIndex}`;
};

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<GraphNode[]>(demoNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(demoEdges);
  const [mode, setModeState] = useState<CanvasMode>('build');
  const [activeScenarioId, setActiveScenarioIdState] = useState('tariff-shock');
  const [activeOverlay, setActiveOverlay] = useState<OverlayKey | null>('tariffs');
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [timelineIndex, setTimelineIndexState] = useState(2);
  const [regionFilter, setRegionFilter] = useState<RegionId | 'All'>('All');
  const [showRiskOnly, setShowRiskOnly] = useState(false);
  const [showMapLabels, setShowMapLabels] = useState(true);
  const [showRegionHalos, setShowRegionHalos] = useState(true);
  const [investorRibbonExpanded, setInvestorRibbonExpanded] = useState(true);
  const [viewport, setViewportState] = useState<ViewportState>({ x: -180, y: -140, scale: 0.84 });
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft | null>(null);
  const [connectionTarget, setConnectionTarget] = useState<ConnectionTarget | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const canvasApiRef = useRef<CanvasApi | null>(null);

  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
  const maxTimelineIndex = Math.max(1, activeScenario.timeline.length - 1);
  const timelineProgress = timelineIndex / maxTimelineIndex;
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const snapshot = buildSnapshot(nodes, edges, activeScenario, timelineProgress, activeOverlay);
  const searchResults = getSearchResults(snapshot.effectiveNodes, snapshot.effectiveEdges, deferredSearchQuery);
  const highlightedNodeIds = getNeighborIds(selection, snapshot.effectiveEdges);
  const highlightedEdgeIds =
    selection?.kind === 'node'
      ? snapshot.effectiveEdges
          .filter((edge) => edge.sourceId === selection.id || edge.targetId === selection.id)
          .map((edge) => edge.id)
      : selection?.kind === 'edge'
        ? [selection.id]
        : [];

  const setMode = (nextMode: CanvasMode) => {
    startTransition(() => {
      setModeState(nextMode);
      if (nextMode === 'present') {
        setContextMenu(null);
      }
    });
  };

  const setActiveScenarioId = (scenarioId: string) => {
    const scenario = scenarios.find((candidate) => candidate.id === scenarioId);
    if (!scenario) {
      return;
    }

    startTransition(() => {
      setActiveScenarioIdState(scenarioId);
      setTimelineIndexState(Math.min(timelineIndex, Math.max(1, scenario.timeline.length - 1)));
      if (scenario.tone === 'baseline') {
        setActiveOverlay(null);
      }
    });
  };

  const setSearchQuery = (query: string) => {
    startTransition(() => {
      setSearchQueryState(query);
    });
  };

  const registerCanvasApi = (api: CanvasApi | null) => {
    canvasApiRef.current = api;
  };

  const fitToFootprint = () => {
    const points = snapshot.effectiveNodes.map((node) => getNodeWorldPosition(node));
    canvasApiRef.current?.fitToWorldPoints(points);
  };

  const focusNode = (nodeId: string) => {
    const node = snapshot.effectiveNodes.find((candidate) => candidate.id === nodeId);
    if (!node) {
      return;
    }

    setSelection({ kind: 'node', id: nodeId });
    canvasApiRef.current?.focusWorldPoint(getNodeWorldPosition(node), 1.04);
  };

  const focusCountry = (countryCode: string) => {
    const country = countryAnchors.find((candidate) => candidate.code === countryCode);
    if (!country) {
      return;
    }
    canvasApiRef.current?.focusWorldPoint(country.position, 1.2);
  };

  const addNode = (type: EntityType, worldPosition?: XY) => {
    const definition = entityDefinitions[type];
    const fallbackCountry = findNearestCountry(worldPosition ?? countryAnchors[0].position, 999) ?? countryAnchors[0];
    const sameCountryNodes = nodes.filter((node) => node.countryCode === fallbackCountry.code).length;
    const clusterOffset = worldPosition
      ? { x: worldPosition.x - fallbackCountry.position.x, y: worldPosition.y - fallbackCountry.position.y }
      : getClusterOffset(sameCountryNodes, sameCountryNodes + 1);

    const node: GraphNode = {
      id: createId(definition.label.toLowerCase().replaceAll(/\s+/g, '-')),
      type,
      label: createNodeLabel(type, nodes),
      countryCode: fallbackCountry.code,
      regionId: fallbackCountry.regionId,
      anchorId: fallbackCountry.code,
      manualOffset: clusterOffset,
      pinned: false,
      baselineMetrics: { ...defaultMetricsByType[type] },
      scenarioOverrides: {},
      derivedOutputs: {},
      tags: definition.tags.slice(0, 2),
      confidence: 0.7,
      status: 'normal',
      collapsed: false,
    };

    setNodes((current) => [...current, node]);
    setSelection({ kind: 'node', id: node.id });
    canvasApiRef.current?.focusWorldPoint(worldPosition ?? fallbackCountry.position, 1);
  };

  const moveNode = (nodeId: string, worldPosition: XY, forceCountryCode?: string | null) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const matchedCountry =
          (forceCountryCode && countryAnchors.find((country) => country.code === forceCountryCode)) ||
          findNearestCountry(worldPosition, 138) ||
          countryAnchors.find((country) => country.code === node.countryCode) ||
          countryAnchors[0];

        return {
          ...node,
          countryCode: matchedCountry.code,
          regionId: matchedCountry.regionId,
          anchorId: matchedCountry.code,
          manualOffset: {
            x: worldPosition.x - matchedCountry.position.x,
            y: worldPosition.y - matchedCountry.position.y,
          },
        };
      }),
    );
  };

  const recenterNode = (nodeId: string) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, manualOffset: { x: 0, y: 0 } } : node)),
    );
  };

  const toggleNodePin = (nodeId: string) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, pinned: !node.pinned } : node)),
    );
  };

  const toggleNodeCollapse = (nodeId: string) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, collapsed: !node.collapsed } : node)),
    );
  };

  const updateNodeMetric = (
    nodeId: string,
    metric: string,
    value: number,
    scope: 'baseline' | 'scenario' = mode === 'scenario' ? 'scenario' : 'baseline',
  ) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }
        return scope === 'scenario'
          ? { ...node, scenarioOverrides: updateMetricValue(node.scenarioOverrides, metric, value) }
          : { ...node, baselineMetrics: updateMetricValue(node.baselineMetrics, metric, value) };
      }),
    );
  };

  const updateEdgeMetric = (
    edgeId: string,
    metric: string,
    value: number,
    scope: 'baseline' | 'scenario' = mode === 'scenario' ? 'scenario' : 'baseline',
  ) => {
    setEdges((current) =>
      current.map((edge) => {
        if (edge.id !== edgeId) {
          return edge;
        }
        return scope === 'scenario'
          ? { ...edge, scenarioOverrides: updateMetricValue(edge.scenarioOverrides, metric, value) }
          : { ...edge, baselineTerms: updateMetricValue(edge.baselineTerms, metric, value) };
      }),
    );
  };

  const beginConnection = (sourceId: string, pointer: XY) => {
    setConnectionDraft({ sourceId, pointer });
    setConnectionTarget(null);
  };

  const updateConnectionPointer = (pointer: XY) => {
    setConnectionDraft((draft) => (draft ? { ...draft, pointer } : draft));
  };

  const queueConnectionTarget = (targetId: string, point: XY) => {
    setConnectionDraft((draft) => {
      if (!draft || draft.sourceId === targetId) {
        return draft;
      }
      setConnectionTarget({
        sourceId: draft.sourceId,
        targetId,
        point,
      });
      return null;
    });
  };

  const completeConnection = (edgeType: EdgeType) => {
    if (!connectionTarget) {
      return;
    }

    const edge: GraphEdge = {
      id: createId(edgeType),
      primaryType: edgeType,
      modifierTags: [overlayLabels[activeOverlay ?? 'fx'] ?? 'Scenario'],
      sourceId: connectionTarget.sourceId,
      targetId: connectionTarget.targetId,
      baselineTerms: { ...defaultTermsByEdge[edgeType] },
      scenarioOverrides: {},
      derivedEffects: {},
      riskFlags: [],
      routingStyle: edgeType === 'goodsFlow' || edgeType === 'cashFlow' ? 'bundle' : 'arc',
      confidence: 0.68,
    };

    setEdges((current) => [...current, edge]);
    setSelection({ kind: 'edge', id: edge.id });
    setConnectionTarget(null);
  };

  const cancelConnection = () => {
    setConnectionDraft(null);
    setConnectionTarget(null);
  };

  const openContextMenu = (kind: 'node' | 'edge', id: string, x: number, y: number) => {
    setContextMenu({ kind, id, x, y });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <CanvasContext.Provider
      value={{
        mode,
        nodes,
        edges,
        activeScenario,
        scenarios,
        activeOverlay,
        selection,
        hoveredId,
        searchQuery,
        searchResults,
        timelineIndex,
        timelineProgress,
        regionFilter,
        showRiskOnly,
        showMapLabels,
        showRegionHalos,
        investorRibbonExpanded,
        viewport,
        connectionDraft,
        connectionTarget,
        contextMenu,
        snapshot,
        highlightedNodeIds,
        highlightedEdgeIds,
        setMode,
        setSelection,
        setHoveredId,
        setSearchQuery,
        setActiveScenarioId,
        setTimelineIndex: setTimelineIndexState,
        setOverlay: setActiveOverlay,
        setRegionFilter,
        setRiskOnly: setShowRiskOnly,
        setShowMapLabels,
        setShowRegionHalos,
        setInvestorRibbonExpanded,
        registerCanvasApi,
        setViewport: setViewportState,
        fitToFootprint,
        focusNode,
        focusCountry,
        addNode,
        moveNode,
        recenterNode,
        toggleNodePin,
        toggleNodeCollapse,
        updateNodeMetric,
        updateEdgeMetric,
        beginConnection,
        updateConnectionPointer,
        queueConnectionTarget,
        completeConnection,
        cancelConnection,
        openContextMenu,
        closeContextMenu,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
};
