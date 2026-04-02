import { countryAnchors, edgeDefinitions, entityDefinitions } from '../data/catalog';
import { defaultCompanySummary as summaryFallback } from '../data/demoGraph';
import type {
  CompanySummary,
  CountryAnchor,
  DriverInsight,
  GraphEdge,
  GraphNode,
  GraphSnapshot,
  MetricFormat,
  MetricRecord,
  OverlayKey,
  Scenario,
  SearchResult,
  SelectionState,
  XY,
} from '../types';

const summarySeed = { ...summaryFallback };

export const getCountryAnchor = (countryCode: string) =>
  countryAnchors.find((country) => country.code === countryCode) ?? countryAnchors[0];

export const getNodeWorldPosition = (node: GraphNode): XY => {
  const anchor = getCountryAnchor(node.countryCode);
  return {
    x: anchor.position.x + node.manualOffset.x,
    y: anchor.position.y + node.manualOffset.y,
  };
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const distance = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y);

export const findNearestCountry = (point: XY, threshold = 120): CountryAnchor | null => {
  let nearest: CountryAnchor | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const country of countryAnchors) {
    const currentDistance = distance(point, country.position);
    if (currentDistance < nearestDistance) {
      nearestDistance = currentDistance;
      nearest = country;
    }
  }

  if (!nearest || nearestDistance > threshold) {
    return null;
  }

  return nearest;
};

export const getClusterOffset = (index: number, total: number) => {
  if (total <= 1) {
    return { x: 0, y: 0 };
  }

  const radius = total > 6 ? 42 : 34;
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

export const formatMetric = (value: number | undefined, format: MetricFormat = 'integer', precision = 0) => {
  if (value === undefined || Number.isNaN(value)) {
    return '--';
  }

  if (format === 'currency') {
    const absolute = Math.abs(value);
    if (absolute >= 1000) {
      return `$${(value / 1000).toFixed(precision || 1)}B`;
    }
    return `$${value.toFixed(precision || 0)}M`;
  }

  if (format === 'percent') {
    return `${value.toFixed(precision || 0)}%`;
  }

  if (format === 'multiple') {
    return `${value.toFixed(precision || 1)}x`;
  }

  if (format === 'days') {
    return `${value.toFixed(precision || 0)}d`;
  }

  if (format === 'bps') {
    return `${value.toFixed(precision || 0)} bps`;
  }

  if (format === 'ratio') {
    return value.toFixed(precision || 2);
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: precision,
  });
};

const toneMultipliers: Record<Scenario['tone'], Record<string, number>> = {
  baseline: { demand: 1, price: 1, cost: 1, freight: 1, rates: 1, wc: 1, risk: 1 },
  bull: { demand: 1.08, price: 1.03, cost: 0.97, freight: 0.94, rates: 0.96, wc: 0.92, risk: 0.9 },
  base: { demand: 1.02, price: 1.01, cost: 1.01, freight: 1.01, rates: 1.02, wc: 1.02, risk: 1.03 },
  bear: { demand: 0.86, price: 0.97, cost: 1.07, freight: 1.09, rates: 1.15, wc: 1.12, risk: 1.18 },
  custom: { demand: 0.94, price: 0.99, cost: 1.05, freight: 1.06, rates: 1.08, wc: 1.08, risk: 1.12 },
};

const applyScenarioBias = (
  node: GraphNode,
  scenario: Scenario,
  timelineProgress: number,
  overlayKey: OverlayKey | null,
): MetricRecord => {
  const tone = toneMultipliers[scenario.tone];
  const metrics = { ...node.baselineMetrics };
  const overlayWeight = overlayKey ? scenario.overlayBias[overlayKey] ?? 0 : 0;
  const blend = (value: number) => 1 + (value - 1) * timelineProgress;
  const overlayFactor = 1 + overlayWeight / 100;

  if (node.type === 'revenueStream') {
    metrics.revenue = (metrics.revenue ?? 0) * blend(tone.demand * tone.price) / overlayFactor;
    metrics.volume = (metrics.volume ?? 0) * blend(tone.demand);
    metrics.asp = (metrics.asp ?? 0) * blend(tone.price);
    metrics.grossMargin = clamp((metrics.grossMargin ?? 0) / blend(tone.cost * overlayFactor), 10, 70);
    metrics.growth = (metrics.growth ?? 0) * blend(tone.demand);
    metrics.dso = (metrics.dso ?? 0) * blend(tone.wc);
  } else if (node.type === 'factory') {
    metrics.utilization = clamp((metrics.utilization ?? 0) * blend(tone.demand / tone.cost), 35, 100);
    metrics.unitCost = (metrics.unitCost ?? 0) * blend(tone.cost * overlayFactor);
    metrics.output = (metrics.capacity ?? 0) * ((metrics.utilization ?? 0) / 100);
    metrics.reliability = clamp((metrics.reliability ?? 0) / blend(tone.risk), 45, 99);
  } else if (node.type === 'warehouse') {
    metrics.inventoryDays = (metrics.inventoryDays ?? 0) * blend(tone.wc);
    metrics.storageCost = (metrics.storageCost ?? 0) * blend(tone.cost);
    metrics.fillRate = clamp((metrics.fillRate ?? 0) / blend(tone.risk), 70, 99);
    metrics.throughput = (metrics.throughput ?? 0) * blend(tone.demand);
  } else if (node.type === 'office') {
    metrics.opex = (metrics.opex ?? 0) * blend(tone.cost);
    metrics.salesCoverage = clamp((metrics.salesCoverage ?? 0) * blend(tone.demand), 40, 100);
    metrics.productivity = clamp((metrics.productivity ?? 0) / blend(tone.cost), 45, 100);
  } else if (node.type === 'supplier') {
    metrics.leadTime = (metrics.leadTime ?? 0) * blend(tone.freight * overlayFactor);
    metrics.reliability = clamp((metrics.reliability ?? 0) / blend(tone.risk), 40, 99);
    metrics.tariffScore = (metrics.tariffScore ?? 0) * overlayFactor;
  } else if (node.type === 'customer') {
    metrics.growth = (metrics.growth ?? 0) * blend(tone.demand);
    metrics.dso = (metrics.dso ?? 0) * blend(tone.wc);
    metrics.volume = (metrics.volume ?? 0) * blend(tone.demand);
  } else if (node.type === 'bank') {
    metrics.interestRate = (metrics.interestRate ?? 0) * blend(tone.rates * overlayFactor);
    metrics.liquidityHeadroom = (metrics.liquidityHeadroom ?? 0) / blend(tone.rates);
  } else if (node.type === 'debtInstrument') {
    metrics.coupon = (metrics.coupon ?? 0) * blend(tone.rates);
    metrics.spread = (metrics.spread ?? 0) * blend(tone.rates);
  } else if (node.type === 'cashPool') {
    metrics.cashBalance = (metrics.cashBalance ?? 0) / blend(tone.wc);
    metrics.trappedCash = (metrics.trappedCash ?? 0) * blend(tone.risk);
    metrics.yield = (metrics.yield ?? 0) * blend(tone.rates);
  } else if (node.type === 'costCenter') {
    metrics.opex = (metrics.opex ?? 0) * blend(tone.cost);
  } else if (node.type === 'countryRegion') {
    metrics.fxScore = (metrics.fxScore ?? 0) * overlayFactor;
    metrics.tariffScore = (metrics.tariffScore ?? 0) * overlayFactor;
    metrics.rateLevel = (metrics.rateLevel ?? 0) * blend(tone.rates);
    metrics.geopoliticalRisk = clamp((metrics.geopoliticalRisk ?? 0) * blend(tone.risk), 0, 100);
  } else if (node.type === 'companyHq') {
    metrics.revenue = (metrics.revenue ?? 0) * blend(tone.demand * tone.price);
    metrics.ebitdaMargin = clamp((metrics.ebitdaMargin ?? 0) / blend(tone.cost), 8, 50);
    metrics.fcf = (metrics.fcf ?? 0) / blend(tone.cost * tone.rates * tone.wc);
    metrics.fairValue = (metrics.fairValue ?? 0) / blend(tone.risk * tone.rates);
    metrics.upsideDownside = (metrics.upsideDownside ?? 0) / blend(tone.risk);
  }

  return { ...metrics, ...node.scenarioOverrides };
};

const applyEdgeScenario = (
  edge: GraphEdge,
  scenario: Scenario,
  timelineProgress: number,
  overlayKey: OverlayKey | null,
): MetricRecord => {
  const tone = toneMultipliers[scenario.tone];
  const terms = { ...edge.baselineTerms };
  const overlayWeight = overlayKey ? scenario.overlayBias[overlayKey] ?? 0 : 0;
  const overlayFactor = 1 + overlayWeight / 100;
  const blend = (value: number) => 1 + (value - 1) * timelineProgress;

  if (edge.primaryType === 'goodsFlow') {
    terms.volume = (terms.volume ?? 0) * blend(tone.demand);
    terms.pricePerUnit = (terms.pricePerUnit ?? 0) * blend(tone.cost * overlayFactor);
    terms.leadTime = (terms.leadTime ?? 0) * blend(tone.freight);
  } else if (edge.primaryType === 'logisticsFlow') {
    terms.shippingCost = (terms.shippingCost ?? 0) * blend(tone.freight * overlayFactor);
    terms.transitTime = (terms.transitTime ?? 0) * blend(tone.freight);
    terms.reliability = clamp((terms.reliability ?? 0) / blend(tone.risk), 30, 99);
  } else if (edge.primaryType === 'cashFlow') {
    terms.paymentDays = (terms.paymentDays ?? 0) * blend(tone.wc);
    terms.cashLag = (terms.cashLag ?? 0) * blend(tone.wc);
  } else if (edge.primaryType === 'financingFlow' || edge.primaryType === 'debtServicingFlow') {
    terms.spread = (terms.spread ?? 0) * blend(tone.rates);
    terms.coupon = (terms.coupon ?? 0) * blend(tone.rates);
  } else if (edge.primaryType === 'regionalMacroInfluence') {
    terms.stress = clamp((terms.stress ?? 0) * overlayFactor * blend(tone.risk), 0, 100);
    terms.fxExposure = clamp((terms.fxExposure ?? 0) * overlayFactor, 0, 100);
    terms.tariffExposure = clamp((terms.tariffExposure ?? 0) * overlayFactor, 0, 100);
  } else if (edge.primaryType === 'revenueConversion') {
    terms.volume = (terms.volume ?? 0) * blend(tone.demand);
    terms.asp = (terms.asp ?? 0) * blend(tone.price);
    terms.grossMargin = clamp((terms.grossMargin ?? 0) / blend(tone.cost), 10, 80);
  }

  return { ...terms, ...edge.scenarioOverrides };
};

const deriveNodeOutputs = (node: GraphNode, metrics: MetricRecord): MetricRecord => {
  if (node.type === 'factory') {
    return {
      output: (metrics.capacity ?? 0) * ((metrics.utilization ?? 0) / 100),
      stress: clamp(100 - (metrics.reliability ?? 0) + (metrics.unitCost ?? 0) / 2, 0, 100),
    };
  }

  if (node.type === 'warehouse') {
    return {
      throughput: (metrics.throughput ?? 0) * ((metrics.fillRate ?? 0) / 100),
      stress: clamp((metrics.inventoryDays ?? 0) / 1.2 - (metrics.fillRate ?? 0) / 2, 0, 100),
    };
  }

  if (node.type === 'supplier' || node.type === 'countryRegion') {
    return {
      stress: clamp(100 - (metrics.reliability ?? 0) + (metrics.tariffScore ?? 0) / 2 + (metrics.fxScore ?? 0) / 4, 0, 100),
    };
  }

  if (node.type === 'companyHq') {
    return {
      fairValue: metrics.fairValue ?? 0,
      upsideDownside: metrics.upsideDownside ?? 0,
    };
  }

  return {};
};

const deriveEdgeEffects = (terms: MetricRecord): MetricRecord => ({
  stress: clamp(
    (terms.leadTime ?? 0) / 1.2 +
      (terms.shippingCost ?? 0) * 2 +
      (terms.cashLag ?? 0) / 2 +
      (terms.spread ?? 0) * 8 +
      ((100 - (terms.reliability ?? 90)) * 1.1),
    0,
    100,
  ),
});

const calculateSummary = (nodes: GraphNode[], edges: GraphEdge[]): CompanySummary => {
  const summary = { ...summarySeed };

  const revenueStreams = nodes.filter((node) => node.type === 'revenueStream');
  const costNodes = nodes.filter((node) => node.type === 'costCenter' || node.type === 'office');
  const factories = nodes.filter((node) => node.type === 'factory');
  const warehouses = nodes.filter((node) => node.type === 'warehouse');
  const debt = nodes.filter((node) => node.type === 'debtInstrument');
  const cashPools = nodes.filter((node) => node.type === 'cashPool');
  const hq = nodes.find((node) => node.type === 'companyHq');

  summary.revenue = revenueStreams.reduce((total, node) => total + (node.baselineMetrics.revenue ?? 0), 0);
  summary.grossMargin =
    revenueStreams.reduce((total, node) => total + (node.baselineMetrics.grossMargin ?? 0), 0) /
      Math.max(1, revenueStreams.length) || 0;

  const grossProfit = summary.revenue * (summary.grossMargin / 100);
  const opex = costNodes.reduce((total, node) => total + (node.baselineMetrics.opex ?? 0), 0);
  const logisticsDrag = edges
    .filter((edge) => edge.primaryType === 'logisticsFlow')
    .reduce((total, edge) => total + (edge.baselineTerms.shippingCost ?? 0) * 5, 0);
  const factoryPenalty = factories.reduce((total, node) => total + (node.baselineMetrics.unitCost ?? 0) * 1.8, 0);

  summary.ebitda = grossProfit - opex - logisticsDrag - factoryPenalty;
  const depreciation =
    factories.reduce((total, node) => total + (node.baselineMetrics.capex ?? 0) * 0.12, 0) +
    warehouses.reduce((total, node) => total + (node.baselineMetrics.opex ?? 0) * 0.16, 0);

  summary.ebit = summary.ebitda - depreciation;

  const interestExpense = debt.reduce(
    (total, node) => total + (node.baselineMetrics.principal ?? 0) * ((node.baselineMetrics.coupon ?? 0) / 100),
    0,
  );
  const taxRate = hq?.baselineMetrics.taxRate ?? 22;
  const taxableIncome = Math.max(0, summary.ebit - interestExpense);
  const taxes = taxableIncome * (taxRate / 100);
  summary.netIncome = summary.ebit - interestExpense - taxes;

  const capex = factories.reduce((total, node) => total + (node.baselineMetrics.capex ?? 0), 0) + (hq?.baselineMetrics.capex ?? 0);
  const workingCapital = warehouses.reduce((total, node) => total + (node.baselineMetrics.inventoryDays ?? 0), 0) * 2.1;
  summary.freeCashFlow = summary.ebitda - capex * 0.78 - taxes - interestExpense - workingCapital * 0.2;

  summary.cash = cashPools.reduce((total, node) => total + (node.baselineMetrics.cashBalance ?? 0), 0);
  const grossDebt = debt.reduce((total, node) => total + (node.baselineMetrics.principal ?? 0), 0);
  summary.netDebt = grossDebt - summary.cash;
  summary.netDebtToEbitda = summary.ebitda > 0 ? summary.netDebt / summary.ebitda : 0;
  summary.roe = hq?.baselineMetrics.equity ? (summary.netIncome / hq.baselineMetrics.equity) * 100 : 0;
  summary.roic = capex > 0 ? ((summary.ebit * (1 - taxRate / 100)) / (capex + summary.netDebt)) * 100 : 0;
  summary.dividendYield = hq?.baselineMetrics.dividendYield ?? 0;
  summary.buybackYield = hq?.baselineMetrics.buybackYield ?? 0;
  summary.valuationMultiple = hq?.baselineMetrics.valuationMultiple ?? 11.8;
  summary.fairValue = summary.ebitda * summary.valuationMultiple - summary.netDebt;
  const marketCap = hq?.baselineMetrics.marketCap ?? summary.fairValue;
  summary.upsideDownside = marketCap > 0 ? ((summary.fairValue - marketCap) / marketCap) * 100 : 0;
  summary.keySensitivity = edges
    .filter((edge) => edge.primaryType === 'regionalMacroInfluence' || edge.primaryType === 'dependencyExposure')
    .reduce((total, edge) => total + (edge.derivedEffects.stress ?? 0), 0) / 2;

  const totalConfidence =
    nodes.reduce((total, node) => total + node.confidence, 0) + edges.reduce((total, edge) => total + edge.confidence, 0);
  summary.confidence = clamp((totalConfidence / Math.max(1, nodes.length + edges.length)) * 100, 0, 100);

  return summary;
};

const calculateDrivers = (
  effectiveSummary: CompanySummary,
  baselineSummary: CompanySummary,
  nodes: GraphNode[],
  edges: GraphEdge[],
): DriverInsight[] => {
  const revenueNodes = nodes.filter((node) => node.type === 'revenueStream');
  const stressedEdges = edges.filter((edge) => (edge.derivedEffects.stress ?? 0) > 55);
  const debtNode = nodes.find((node) => node.type === 'debtInstrument');
  const supplierNode = nodes.find((node) => node.type === 'supplier');

  return [
    {
      id: 'driver-demand',
      label: 'Revenue mix and demand',
      metric: 'revenue',
      delta: effectiveSummary.revenue - baselineSummary.revenue,
      relatedNodeIds: revenueNodes.map((node) => node.id),
      relatedEdgeIds: edges.filter((edge) => edge.primaryType === 'revenueConversion').map((edge) => edge.id),
    },
    {
      id: 'driver-margin',
      label: 'Input cost and logistics drag',
      metric: 'grossMargin',
      delta: effectiveSummary.grossMargin - baselineSummary.grossMargin,
      relatedNodeIds: [supplierNode?.id ?? '', ...nodes.filter((node) => node.type === 'factory').map((node) => node.id)].filter(Boolean),
      relatedEdgeIds: stressedEdges.map((edge) => edge.id),
    },
    {
      id: 'driver-fcf',
      label: 'Debt service and liquidity',
      metric: 'freeCashFlow',
      delta: effectiveSummary.freeCashFlow - baselineSummary.freeCashFlow,
      relatedNodeIds: [debtNode?.id ?? '', ...nodes.filter((node) => node.type === 'cashPool' || node.type === 'bank').map((node) => node.id)].filter(Boolean),
      relatedEdgeIds: edges.filter((edge) => edge.primaryType === 'cashFlow' || edge.primaryType === 'debtServicingFlow').map((edge) => edge.id),
    },
  ];
};

export const buildSnapshot = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  scenario: Scenario,
  timelineProgress: number,
  overlayKey: OverlayKey | null,
): GraphSnapshot => {
  const effectiveNodes = nodes.map((node) => {
    const metrics = applyScenarioBias(node, scenario, timelineProgress, overlayKey);
    const derivedOutputs = deriveNodeOutputs(node, metrics);
    return {
      ...node,
      baselineMetrics: metrics,
      derivedOutputs,
      status: ((derivedOutputs.stress ?? 0) > 58 ? 'warning' : 'normal') as GraphNode['status'],
    };
  });

  const effectiveEdges = edges.map((edge) => {
    const terms = applyEdgeScenario(edge, scenario, timelineProgress, overlayKey);
    const derivedEffects = deriveEdgeEffects(terms);
    return {
      ...edge,
      baselineTerms: terms,
      derivedEffects,
      riskFlags: (derivedEffects.stress ?? 0) > 60 ? Array.from(new Set([...edge.riskFlags, 'stress'])) : edge.riskFlags,
    };
  });

  const companySummary = calculateSummary(effectiveNodes, effectiveEdges);

  const baselineNodes = nodes.map((node) => ({
    ...node,
    baselineMetrics: { ...node.baselineMetrics },
    derivedOutputs: deriveNodeOutputs(node, node.baselineMetrics),
  }));
  const baselineEdges = edges.map((edge) => ({
    ...edge,
    baselineTerms: { ...edge.baselineTerms },
    derivedEffects: deriveEdgeEffects(edge.baselineTerms),
  }));
  const baselineSummary = calculateSummary(baselineNodes, baselineEdges);

  return {
    effectiveNodes,
    effectiveEdges,
    companySummary,
    baselineSummary,
    drivers: calculateDrivers(companySummary, baselineSummary, effectiveNodes, effectiveEdges),
  };
};

export const getBezierPath = (source: XY, target: XY, lane = 0) => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distanceScale = Math.max(80, Math.hypot(dx, dy));
  const curve = clamp(distanceScale * 0.18 + lane * 18, 50, 180);
  const control1 = { x: source.x + dx * 0.25, y: source.y - curve };
  const control2 = { x: target.x - dx * 0.25, y: target.y - curve };
  const midpoint = {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2 - curve * 0.35,
  };
  return {
    path: `M ${source.x} ${source.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${target.x} ${target.y}`,
    midpoint,
  };
};

export const getSearchResults = (nodes: GraphNode[], edges: GraphEdge[], query: string): SearchResult[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const nodeResults = nodes
    .filter((node) => node.label.toLowerCase().includes(normalized) || node.countryCode.toLowerCase().includes(normalized))
    .slice(0, 6)
    .map((node) => ({
      kind: 'node' as const,
      id: node.id,
      label: node.label,
      subtitle: `${entityDefinitions[node.type].label} · ${node.countryCode}`,
    }));

  const countryResults = countryAnchors
    .filter((country) => country.name.toLowerCase().includes(normalized) || country.code.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((country) => ({
      kind: 'country' as const,
      id: country.code,
      label: country.name,
      subtitle: `${country.regionId} · ${country.currency}`,
    }));

  const edgeResults = edges
    .filter((edge) => edgeDefinitions[edge.primaryType].label.toLowerCase().includes(normalized) || edge.modifierTags.some((tag) => tag.toLowerCase().includes(normalized)))
    .slice(0, 4)
    .map((edge) => ({
      kind: 'edge' as const,
      id: edge.id,
      label: edgeDefinitions[edge.primaryType].label,
      subtitle: edge.modifierTags.join(' · ') || 'Relationship',
    }));

  return [...nodeResults, ...countryResults, ...edgeResults];
};

export const getNeighborIds = (selection: SelectionState | null, edges: GraphEdge[]) => {
  if (!selection || selection.kind !== 'node') {
    return [];
  }

  const neighbors = new Set<string>();
  edges.forEach((edge) => {
    if (edge.sourceId === selection.id) {
      neighbors.add(edge.targetId);
    }
    if (edge.targetId === selection.id) {
      neighbors.add(edge.sourceId);
    }
  });
  return Array.from(neighbors);
};

export const updateMetricValue = (record: MetricRecord, key: string, value: number) => ({
  ...record,
  [key]: Number.isFinite(value) ? value : 0,
});
