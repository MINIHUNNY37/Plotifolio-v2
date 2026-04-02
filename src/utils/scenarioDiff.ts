import type { DeltaEntry, Scenario, ScenarioDelta, ScenarioEdge, ScenarioNode } from '../types/scenario';

const emptyDelta = (): ScenarioDelta => ({
  nodeChanges: {},
  edgeChanges: {},
  summary: {
    debtDelta: 0,
    cashDelta: 0,
    factoryStatusChanges: 0,
    newRisks: 0,
    removedRisks: 0,
  },
});

const diffFields = (previous: Record<string, unknown>, next: Record<string, unknown>, prefix = '') => {
  const changedFields: string[] = [];

  Object.keys({ ...previous, ...next }).forEach((key) => {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    const previousValue = previous[key];
    const nextValue = next[key];

    if (
      previousValue &&
      nextValue &&
      typeof previousValue === 'object' &&
      typeof nextValue === 'object' &&
      !Array.isArray(previousValue) &&
      !Array.isArray(nextValue)
    ) {
      changedFields.push(...diffFields(previousValue as Record<string, unknown>, nextValue as Record<string, unknown>, fieldPath));
      return;
    }

    if (JSON.stringify(previousValue) !== JSON.stringify(nextValue)) {
      changedFields.push(fieldPath);
    }
  });

  return changedFields;
};

const inferTone = (previous: ScenarioNode | ScenarioEdge | undefined, next: ScenarioNode | ScenarioEdge | undefined, fields: string[]) => {
  if (!previous && next) {
    return next.scenarioFlags.isPlanned ? 'planned' : 'added';
  }

  if (previous && !next) {
    return 'removed';
  }

  if (!previous || !next || fields.length === 0) {
    return 'unchanged';
  }

  if (fields.some((field) => field.includes('severity') || field.includes('risk') || field.includes('debt') || field.includes('amount'))) {
    return 'worsened';
  }

  if (fields.some((field) => field.includes('cash') || field.includes('utilization') || field.includes('confidence'))) {
    return 'improved';
  }

  return next.scenarioFlags.isPlanned ? 'planned' : 'improved';
};

const compareCollections = <T extends ScenarioNode | ScenarioEdge>(previousItems: T[], nextItems: T[]) => {
  const previousMap = new Map(previousItems.map((item) => [item.id, item]));
  const nextMap = new Map(nextItems.map((item) => [item.id, item]));
  const ids = new Set([...previousMap.keys(), ...nextMap.keys()]);
  const changes: Record<string, DeltaEntry> = {};

  ids.forEach((id) => {
    const previous = previousMap.get(id);
    const next = nextMap.get(id);

    if (!previous || !next) {
      changes[id] = {
        tone: inferTone(previous, next, []),
        fields: ['lifecycle'],
      };
      return;
    }

    const fields = diffFields(previous as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    if (fields.length > 0) {
      changes[id] = {
        tone: inferTone(previous, next, fields),
        fields,
      };
    }
  });

  return changes;
};

export const buildScenarioDelta = (previousScenario: Scenario | undefined, nextScenario: Scenario): ScenarioDelta => {
  if (!previousScenario) {
    return emptyDelta();
  }

  const nodeChanges = compareCollections(previousScenario.nodes, nextScenario.nodes);
  const edgeChanges = compareCollections(previousScenario.edges, nextScenario.edges);
  const previousDebt = previousScenario.nodes
    .filter((node) => node.type === 'debt')
    .reduce((total, node) => total + (node.metadata.amount as number), 0);
  const nextDebt = nextScenario.nodes
    .filter((node) => node.type === 'debt')
    .reduce((total, node) => total + (node.metadata.amount as number), 0);
  const previousCash = previousScenario.nodes
    .filter((node) => node.type === 'cashPool')
    .reduce((total, node) => total + (node.metadata.cashAmount as number), 0);
  const nextCash = nextScenario.nodes
    .filter((node) => node.type === 'cashPool')
    .reduce((total, node) => total + (node.metadata.cashAmount as number), 0);

  return {
    nodeChanges,
    edgeChanges,
    summary: {
      debtDelta: nextDebt - previousDebt,
      cashDelta: nextCash - previousCash,
      factoryStatusChanges: Object.values(nodeChanges).filter((change) => change.fields.some((field) => field.includes('productionStatus'))).length,
      newRisks: nextScenario.nodes.filter((node) => node.type === 'risk' && !previousScenario.nodes.some((previousNode) => previousNode.id === node.id))
        .length,
      removedRisks: previousScenario.nodes.filter((node) => node.type === 'risk' && !nextScenario.nodes.some((nextNode) => nextNode.id === node.id))
        .length,
    },
  };
};
