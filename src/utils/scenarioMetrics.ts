import type {
  BankNodeData,
  CompanyNodeData,
  CountryNodeData,
  DebtNodeData,
  FactoryNodeData,
  Scenario,
  ScenarioEdge,
  ScenarioNode,
  ScenarioSummaryMetrics,
} from '../types/scenario';

const getCountryName = (node: ScenarioNode) => {
  if (node.type === 'company') {
    return node.metadata.headquartersCountry;
  }
  if (node.type === 'country') {
    return node.metadata.countryName;
  }
  if ('country' in node.metadata) {
    return String(node.metadata.country);
  }
  return '';
};

const sumEdgeValues = (edges: ScenarioEdge[], type: ScenarioEdge['type']) =>
  edges.filter((edge) => edge.type === type && typeof edge.amount === 'number').reduce((total, edge) => total + (edge.amount ?? 0), 0);

export const getScenarioSummaryMetrics = (scenario: Scenario): ScenarioSummaryMetrics => {
  const companyNode = scenario.nodes.find((node): node is CompanyNodeData => node.type === 'company');
  const factories = scenario.nodes.filter((node): node is FactoryNodeData => node.type === 'factory' && !node.scenarioFlags.isInactive);
  const banks = scenario.nodes.filter((node): node is BankNodeData => node.type === 'bank');
  const countryNodes = scenario.nodes.filter((node): node is CountryNodeData => node.type === 'country');
  const debtNodes = scenario.nodes.filter((node): node is DebtNodeData => node.type === 'debt');
  const totalDebt =
    debtNodes.reduce((total, node) => total + node.metadata.amount, 0) +
    sumEdgeValues(scenario.edges, 'debtRelationship');
  const totalCash =
    scenario.nodes.filter((node) => node.type === 'cashPool').reduce((total, node) => total + node.metadata.cashAmount, 0) +
    (companyNode?.metadata.cash ?? 0);
  const countriesExposed = Array.from(
    new Set(
      scenario.nodes
        .map(getCountryName)
        .filter((value) => value.length > 0),
    ),
  );

  const debtByBank = banks
    .map((bank) => ({
      label: bank.metadata.bankName,
      value: scenario.edges
        .filter((edge) => edge.type === 'debtRelationship' && (edge.source === bank.id || edge.target === bank.id))
        .reduce((total, edge) => total + (edge.amount ?? 0), bank.metadata.exposureAmount),
      nodeIds: [bank.id],
    }))
    .sort((left, right) => right.value - left.value);

  const debtByCountry = countryNodes
    .map((country) => ({
      label: country.metadata.countryName,
      value: debtNodes
        .filter((node) => node.metadata.country === country.metadata.countryName)
        .reduce((total, node) => total + node.metadata.amount, 0),
      nodeIds: debtNodes.filter((node) => node.metadata.country === country.metadata.countryName).map((node) => node.id),
    }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value);

  const cashSources = scenario.edges
    .filter((edge) => edge.type === 'cashFlow' || edge.type === 'plannedFuture')
    .map((edge) => ({
      label: edge.label,
      value: edge.amount ?? 0,
      edgeIds: [edge.id],
    }))
    .sort((left, right) => right.value - left.value);

  const factoryDistribution = Array.from(
    factories.reduce((distribution, factory) => {
      const key = factory.metadata.country;
      const existing = distribution.get(key);
      distribution.set(key, {
        label: key,
        value: (existing?.value ?? 0) + 1,
        nodeIds: [...(existing?.nodeIds ?? []), factory.id],
      });
      return distribution;
    }, new Map<string, { label: string; value: number; nodeIds: string[] }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.value - left.value);

  const riskConcentration = scenario.nodes
    .filter((node) => node.type === 'risk')
    .map((node) => ({
      label: node.metadata.riskName,
      value: Math.round(node.metadata.probability * node.metadata.severity),
      nodeIds: [node.id, ...node.metadata.affectedNodeIds],
    }))
    .sort((left, right) => right.value - left.value);

  const warnings = [
    ...debtNodes
      .filter((node) => !scenario.edges.some((edge) => edge.type === 'debtRelationship' && (edge.source === node.id || edge.target === node.id)))
      .map((node) => ({
        id: `debt-${node.id}`,
        title: `${node.title} has no lender edge`,
        description: 'Link this instrument to a bank or operating entity so debt roll-up metrics remain accurate.',
        nodeId: node.id,
      })),
    ...scenario.nodes
      .filter((node) => node.type === 'risk')
      .filter((node) => node.metadata.affectedNodeIds.length === 0)
      .map((node) => ({
        id: `risk-${node.id}`,
        title: `${node.title} affects nothing yet`,
        description: 'Attach the risk to a factory, country, or debt instrument to see propagation on the map.',
        nodeId: node.id,
      })),
  ];

  return {
    totalDebt,
    totalCash,
    netLiquidity: totalCash - totalDebt,
    factoryCount: factories.length,
    riskCount: scenario.nodes.filter((node) => node.type === 'risk' && !node.scenarioFlags.isInactive).length,
    countriesExposed,
    debtByBank,
    debtByCountry,
    cashSources,
    factoryDistribution,
    riskConcentration,
    warnings,
  };
};
