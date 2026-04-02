export type CanvasMode = 'build' | 'scenario' | 'compare' | 'present';

export type EntityCategory = 'operating' | 'financial' | 'external' | 'macro';

export type RegionId = 'Americas' | 'EMEA' | 'APAC';

export type OverlayKey =
  | 'fx'
  | 'tariffs'
  | 'rates'
  | 'political'
  | 'shipping'
  | 'tax'
  | 'commodity';

export type EntityType =
  | 'companyHq'
  | 'factory'
  | 'warehouse'
  | 'office'
  | 'portLogistics'
  | 'bank'
  | 'debtInstrument'
  | 'cashPool'
  | 'revenueStream'
  | 'costCenter'
  | 'supplier'
  | 'customer'
  | 'countryRegion'
  | 'businessSegment'
  | 'productLine'
  | 'subsidiaryJv'
  | 'distributionChannel'
  | 'endMarket'
  | 'commodityInput'
  | 'investmentProject'
  | 'regulatoryBody';

export type EdgeType =
  | 'operationalFlow'
  | 'goodsFlow'
  | 'logisticsFlow'
  | 'cashFlow'
  | 'financingFlow'
  | 'debtServicingFlow'
  | 'ownershipControl'
  | 'dependencyExposure'
  | 'pricingLinkage'
  | 'supplyAgreement'
  | 'revenueConversion'
  | 'regionalMacroInfluence';

export type MetricFormat =
  | 'currency'
  | 'percent'
  | 'integer'
  | 'days'
  | 'multiple'
  | 'ratio'
  | 'bps'
  | 'text';

export interface XY {
  x: number;
  y: number;
}

export interface MetricDefinition {
  key: string;
  label: string;
  format: MetricFormat;
  precision?: number;
}

export type MetricRecord = Record<string, number>;

export interface CountryAnchor {
  code: string;
  name: string;
  regionId: RegionId;
  currency: string;
  flag: string;
  position: XY;
  clusterRadius: number;
  labelOffset?: XY;
  macro: {
    fx: number;
    tariffs: number;
    rates: number;
    political: number;
    shipping: number;
    tax: number;
    commodity: number;
  };
}

export interface RegionOverlay {
  id: RegionId;
  label: string;
  color: string;
  path: string;
}

export interface EntityDefinition {
  type: EntityType;
  label: string;
  category: EntityCategory;
  icon: string;
  defaultMetrics: string[];
  expandedMetrics: string[];
  scenarioMetrics: string[];
  derivedMetrics: string[];
  tags: string[];
  mobility: 'geo-anchored' | 'free' | 'optional';
  showsCountry: boolean;
  showsCurrency: boolean;
}

export interface EdgeDefinition {
  type: EdgeType;
  label: string;
  icon: string;
  color: string;
  dasharray?: string;
  width: number;
  inlineMetrics: string[];
}

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  countryCode: string;
  regionId: RegionId;
  anchorId: string;
  manualOffset: XY;
  pinned: boolean;
  baselineMetrics: MetricRecord;
  scenarioOverrides: MetricRecord;
  derivedOutputs: MetricRecord;
  tags: string[];
  confidence: number;
  status: 'normal' | 'warning';
  collapsed: boolean;
  note?: string;
}

export interface GraphEdge {
  id: string;
  primaryType: EdgeType;
  modifierTags: string[];
  sourceId: string;
  targetId: string;
  baselineTerms: MetricRecord;
  scenarioOverrides: MetricRecord;
  derivedEffects: MetricRecord;
  riskFlags: string[];
  routingStyle: 'arc' | 'bundle' | 'direct';
  confidence: number;
}

export interface Scenario {
  id: string;
  name: string;
  tone: 'baseline' | 'bull' | 'base' | 'bear' | 'custom';
  description: string;
  timeline: string[];
  notes: string;
  overlayBias: Partial<Record<OverlayKey, number>>;
}

export interface CompanySummary {
  revenue: number;
  ebitda: number;
  ebit: number;
  netIncome: number;
  freeCashFlow: number;
  roe: number;
  roic: number;
  netDebtToEbitda: number;
  dividendYield: number;
  buybackYield: number;
  valuationMultiple: number;
  fairValue: number;
  upsideDownside: number;
  keySensitivity: number;
  confidence: number;
  netDebt: number;
  cash: number;
  grossMargin: number;
}

export interface DriverInsight {
  id: string;
  label: string;
  metric: keyof CompanySummary | 'grossMargin';
  delta: number;
  relatedNodeIds: string[];
  relatedEdgeIds: string[];
}

export interface SelectionState {
  kind: 'node' | 'edge' | 'metric';
  id: string;
}

export interface SearchResult {
  kind: 'node' | 'country' | 'edge';
  id: string;
  label: string;
  subtitle: string;
}

export interface GraphSnapshot {
  effectiveNodes: GraphNode[];
  effectiveEdges: GraphEdge[];
  companySummary: CompanySummary;
  baselineSummary: CompanySummary;
  drivers: DriverInsight[];
}
