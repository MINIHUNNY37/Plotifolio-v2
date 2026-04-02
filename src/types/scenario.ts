export type ScenarioView = 'library' | 'builder' | 'compare' | 'settings';

export type ScenarioKind = 'Base' | 'Bull' | 'Bear' | 'Recession' | 'Expansion' | 'Debt Refi';

export type ScenarioStatus = 'Draft' | 'Review' | 'Ready';

export type SaveState = 'saved' | 'dirty' | 'saving';

export type NodeKind = 'company' | 'factory' | 'bank' | 'cashPool' | 'debt' | 'country' | 'risk' | 'analystNote';

export type EdgeKind =
  | 'supplyFlow'
  | 'productMovement'
  | 'ownershipControl'
  | 'cashFlow'
  | 'debtRelationship'
  | 'dependency'
  | 'riskLink'
  | 'plannedFuture';

export type TimeHorizon = 'Now' | '1Y' | '3Y' | '5Y' | 'Event Horizon';

export type ViewMode = 'geographic' | 'strategic' | 'financial' | 'risk';

export type SummaryPanelKey =
  | 'debtByCountry'
  | 'debtByBank'
  | 'cashSources'
  | 'factoryDistribution'
  | 'revenueExposure'
  | 'bottlenecks'
  | 'riskConcentration'
  | 'assumptions'
  | 'thesisNotes';

export type ScenarioChangeTone = 'unchanged' | 'added' | 'improved' | 'worsened' | 'removed' | 'planned';

export type FilterKey =
  | 'operationsOnly'
  | 'liquidityOnly'
  | 'debtOnly'
  | 'geographicExposureOnly'
  | 'riskOnly'
  | 'ownershipOnly'
  | 'plannedOnly';

export interface Position2D {
  x: number;
  y: number;
}

export interface ScenarioFlags {
  isChanged: boolean;
  tone: ScenarioChangeTone;
  isInactive: boolean;
  isPlanned: boolean;
}

export interface DisplayPreferences {
  accentColor: string;
  showFields: string[];
  showOnNodeCard: string[];
  labelPinned: boolean;
  compact: boolean;
  customIconUrl?: string;
}

export interface NodeBase<TMetadata> {
  id: string;
  type: NodeKind;
  position: Position2D;
  title: string;
  subtitle: string;
  icon: string;
  status: string;
  tags: string[];
  notes: string;
  scenarioFlags: ScenarioFlags;
  metadata: TMetadata;
  display: DisplayPreferences;
}

export interface CompanyNodeMetadata {
  companyName: string;
  ticker: string;
  logo?: string;
  headquartersCountry: string;
  sector: string;
  marketCap: number;
  thesisSummary: string;
  primaryCurrency: string;
  managementNotes: string;
  revenue: number;
  ebitda: number;
  cash: number;
  debt: number;
}

export interface CompanyNodeData extends NodeBase<CompanyNodeMetadata> {
  type: 'company';
}

export interface FactoryNodeMetadata {
  factoryName: string;
  country: string;
  regionCity: string;
  productionStatus: 'active' | 'under construction' | 'delayed' | 'closed' | 'at risk' | 'expansion planned';
  productionCapacity: number;
  utilizationRate: number;
  productsMade: string[];
  costProfile: string;
  keyDependencies: string[];
  inputSuppliers: string[];
  outputDestinations: string[];
  operationalRisks: string[];
  laborRisk: string;
  energyRisk: string;
}

export interface FactoryNodeData extends NodeBase<FactoryNodeMetadata> {
  type: 'factory';
}

export interface BankNodeMetadata {
  bankName: string;
  country: string;
  exposureAmount: number;
  loanType: string;
  interestRate: number;
  maturityDate: string;
  covenantNotes: string;
  refinancingRisk: 'low' | 'moderate' | 'high';
  creditNotes: string;
  associatedDebtInstruments: string[];
  currency: string;
}

export interface BankNodeData extends NodeBase<BankNodeMetadata> {
  type: 'bank';
}

export interface CashPoolNodeMetadata {
  cashAmount: number;
  country: string;
  legalEntity: string;
  sourceType: string;
  restrictionsOnMovement: string;
  intendedUse: string;
  currency: string;
}

export interface CashPoolNodeData extends NodeBase<CashPoolNodeMetadata> {
  type: 'cashPool';
}

export interface DebtNodeMetadata {
  instrumentName: string;
  lender: string;
  amount: number;
  currency: string;
  fixedOrFloating: 'fixed' | 'floating';
  rate: number;
  maturity: string;
  secured: 'secured' | 'unsecured';
  tiedEntity: string;
  country: string;
}

export interface DebtNodeData extends NodeBase<DebtNodeMetadata> {
  type: 'debt';
}

export interface CountryNodeMetadata {
  countryName: string;
  riskScore: number;
  fxExposure: number;
  regulatoryExposure: number;
  taxExposure: number;
  politicalRisk: number;
}

export interface CountryNodeData extends NodeBase<CountryNodeMetadata> {
  type: 'country';
}

export interface RiskNodeMetadata {
  riskName: string;
  category: string;
  probability: number;
  severity: number;
  affectedNodeIds: string[];
  timeHorizon: TimeHorizon;
  mitigationNotes: string;
  expectedImpact: string;
}

export interface RiskNodeData extends NodeBase<RiskNodeMetadata> {
  type: 'risk';
}

export interface AnalystNoteNodeMetadata {
  noteTitle: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  linkedAssumptionIds: string[];
  linkedNodeIds: string[];
  confidence: number;
}

export interface AnalystNoteNodeData extends NodeBase<AnalystNoteNodeMetadata> {
  type: 'analystNote';
}

export type ScenarioNode =
  | CompanyNodeData
  | FactoryNodeData
  | BankNodeData
  | CashPoolNodeData
  | DebtNodeData
  | CountryNodeData
  | RiskNodeData
  | AnalystNoteNodeData;

export interface EdgeStyleConfig {
  preset: EdgeKind;
  stroke: string;
  glow: string;
  width: number;
  dashPattern?: string;
  arrowDirection: 'forward' | 'reverse' | 'both';
}

export interface EdgeBase<TMetadata> {
  id: string;
  type: EdgeKind;
  source: string;
  target: string;
  label: string;
  amount: number | null;
  currency: string;
  timeHorizon: TimeHorizon;
  notes: string;
  confidence: number;
  styleConfig: EdgeStyleConfig;
  scenarioFlags: ScenarioFlags;
  metadata: TMetadata;
}

export interface EdgeFinancialMetadata {
  recurring: 'recurring' | 'one-time';
  scenarioImpact: string;
  interestRate?: number;
  maturityDate?: string;
  secured?: boolean;
  lenderCountry?: string;
  ownerNotes?: string;
}

export interface EdgeRiskMetadata {
  probability?: number;
  severity?: number;
  mitigation?: string;
  scenarioImpact: string;
}

export interface EdgeFinancialData extends EdgeBase<EdgeFinancialMetadata> {}

export interface EdgeRiskData extends EdgeBase<EdgeRiskMetadata> {}

export type ScenarioEdge = EdgeFinancialData | EdgeRiskData;

export interface ScenarioMetadata {
  id: string;
  name: string;
  companyName: string;
  companyTicker: string;
  companyLogo?: string;
  sector: string;
  scenarioType: ScenarioKind;
  parentScenarioId?: string;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  saveState: SaveState;
  status: ScenarioStatus;
  tags: string[];
  countries: string[];
  assumptionsSummary: string;
}

export interface ScenarioAssumption {
  id: string;
  title: string;
  description: string;
  category: 'macro' | 'operations' | 'finance' | 'risk' | 'strategy';
  impact: 'positive' | 'negative' | 'neutral';
  linkedNodeIds: string[];
  linkedEdgeIds: string[];
  pinned: boolean;
}

export interface FilterState {
  operationsOnly: boolean;
  liquidityOnly: boolean;
  debtOnly: boolean;
  geographicExposureOnly: boolean;
  riskOnly: boolean;
  ownershipOnly: boolean;
  plannedOnly: boolean;
  hideDimmed: boolean;
}

export interface VisualSettings {
  showBackgroundMap: boolean;
  showCountryLabels: boolean;
  showCashLabels: boolean;
  showKpiChips: boolean;
  showRiskOverlays: boolean;
  showAnalystNotes: boolean;
  showEdgeLabels: boolean;
  groupRegions: boolean;
  snappingMode: 'geographic' | 'freeform';
  viewMode: ViewMode;
  timeHorizon: TimeHorizon;
}

export interface DeltaEntry {
  tone: ScenarioChangeTone;
  fields: string[];
}

export interface ScenarioDelta {
  nodeChanges: Record<string, DeltaEntry>;
  edgeChanges: Record<string, DeltaEntry>;
  summary: {
    debtDelta: number;
    cashDelta: number;
    factoryStatusChanges: number;
    newRisks: number;
    removedRisks: number;
  };
}

export interface ScenarioChangeLogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface Scenario {
  metadata: ScenarioMetadata;
  assumptions: ScenarioAssumption[];
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  visualSettings: VisualSettings;
  filters: FilterState;
  delta: ScenarioDelta;
  notes: string;
  changeLog: ScenarioChangeLogEntry[];
}

export interface ScenarioSummaryMetrics {
  totalDebt: number;
  totalCash: number;
  netLiquidity: number;
  factoryCount: number;
  riskCount: number;
  countriesExposed: string[];
  debtByBank: { label: string; value: number; nodeIds: string[] }[];
  debtByCountry: { label: string; value: number; nodeIds: string[] }[];
  cashSources: { label: string; value: number; edgeIds: string[] }[];
  factoryDistribution: { label: string; value: number; nodeIds: string[] }[];
  riskConcentration: { label: string; value: number; nodeIds: string[] }[];
  warnings: { id: string; title: string; description: string; nodeId?: string; edgeId?: string }[];
}

export interface NodeTemplate {
  id: string;
  type: NodeKind;
  section: 'Company' | 'Operations' | 'Finance' | 'Geography' | 'Risk' | 'Custom';
  label: string;
  description: string;
  icon: string;
  defaultStatus: string;
  defaultFields: string[];
  accentColor: string;
  enabled: boolean;
}

export interface CustomIconAsset {
  id: string;
  name: string;
  dataUrl: string;
}

export interface BuilderSelection {
  nodeId: string | null;
  edgeId: string | null;
  nodeIds: string[];
}

export interface HistorySnapshot {
  scenarios: Scenario[];
  activeScenarioId: string;
  compareScenarioIds: [string, string];
}
