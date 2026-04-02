import type { Edge, EdgeTypes, Node, NodeTypes } from '@xyflow/react';
import { AnalystNoteNode } from '../nodes/AnalystNoteNode';
import { BankNode } from '../nodes/BankNode';
import { CashPoolNode } from '../nodes/CashPoolNode';
import { CompanyNode } from '../nodes/CompanyNode';
import { CountryNode } from '../nodes/CountryNode';
import { DebtNode } from '../nodes/DebtNode';
import { FactoryNode } from '../nodes/FactoryNode';
import { RiskNode } from '../nodes/RiskNode';
import type { Scenario, ScenarioEdge, ScenarioNode } from '../../types/scenario';
import { InvestorEdge } from './InvestorEdge';
import type { FlowNodeData } from './flowTypes';

const matchesNodeFilters = (node: ScenarioNode, scenario: Scenario) => {
  const activeFilters = Object.entries(scenario.filters)
    .filter(([key, value]) => key !== 'hideDimmed' && value)
    .map(([key]) => key);

  if (activeFilters.length === 0) {
    return true;
  }

  return activeFilters.every((filter) => {
    switch (filter) {
      case 'operationsOnly':
        return node.type === 'company' || node.type === 'factory';
      case 'liquidityOnly':
        return node.type === 'company' || node.type === 'cashPool';
      case 'debtOnly':
        return node.type === 'bank' || node.type === 'debt';
      case 'geographicExposureOnly':
        return node.type === 'country' || node.type === 'factory' || node.type === 'company';
      case 'riskOnly':
        return node.type === 'risk';
      case 'ownershipOnly':
        return node.type === 'company' || node.type === 'factory';
      case 'plannedOnly':
        return node.scenarioFlags.isPlanned;
      default:
        return true;
    }
  });
};

const matchesEdgeFilters = (edge: ScenarioEdge, sourceMatch: boolean, targetMatch: boolean, scenario: Scenario) => {
  const activeFilters = Object.entries(scenario.filters)
    .filter(([key, value]) => key !== 'hideDimmed' && value)
    .map(([key]) => key);

  if (activeFilters.length === 0) {
    return true;
  }

  return activeFilters.every((filter) => {
    switch (filter) {
      case 'liquidityOnly':
        return edge.type === 'cashFlow';
      case 'debtOnly':
        return edge.type === 'debtRelationship';
      case 'riskOnly':
        return edge.type === 'riskLink';
      case 'ownershipOnly':
        return edge.type === 'ownershipControl';
      case 'plannedOnly':
        return edge.scenarioFlags.isPlanned;
      default:
        return sourceMatch || targetMatch;
    }
  });
};

export const buildFlowNodes = (
  scenario: Scenario,
  highlightedNodeIds: string[],
  activeSummaryPanel: FlowNodeData['activeSummaryPanel'],
): Node[] =>
  scenario.nodes
    .filter((node) => (scenario.filters.hideDimmed ? matchesNodeFilters(node, scenario) : true))
    .map((node) => {
      const dimmed = !matchesNodeFilters(node, scenario);
      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          node,
          dimmed,
          highlighted: highlightedNodeIds.includes(node.id),
          viewMode: scenario.visualSettings.viewMode,
          showKpiChips: scenario.visualSettings.showKpiChips,
          showCashLabels: scenario.visualSettings.showCashLabels,
          activeSummaryPanel,
        },
      };
    });

export const buildFlowEdges = (
  scenario: Scenario,
  flowNodes: Node[],
  highlightedEdgeIds: string[],
): Edge[] => {
  const nodeIdSet = new Set(flowNodes.map((node) => node.id));

  return scenario.edges
    .filter((edge) => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target))
    .filter((edge) => {
      const sourceMatch = matchesNodeFilters(scenario.nodes.find((node) => node.id === edge.source) ?? scenario.nodes[0], scenario);
      const targetMatch = matchesNodeFilters(scenario.nodes.find((node) => node.id === edge.target) ?? scenario.nodes[0], scenario);
      return scenario.filters.hideDimmed ? matchesEdgeFilters(edge, sourceMatch, targetMatch, scenario) : true;
    })
    .map((edge) => {
      const sourceMatch = matchesNodeFilters(scenario.nodes.find((node) => node.id === edge.source) ?? scenario.nodes[0], scenario);
      const targetMatch = matchesNodeFilters(scenario.nodes.find((node) => node.id === edge.target) ?? scenario.nodes[0], scenario);
      return {
        id: edge.id,
        type: 'investorEdge',
        source: edge.source,
        target: edge.target,
        data: {
          edge,
          dimmed: !matchesEdgeFilters(edge, sourceMatch, targetMatch, scenario),
          highlighted: highlightedEdgeIds.includes(edge.id),
          showLabels: scenario.visualSettings.showEdgeLabels,
        },
      };
    });
};

export const investorNodeTypes: NodeTypes = {
  analystNote: AnalystNoteNode,
  bank: BankNode,
  cashPool: CashPoolNode,
  company: CompanyNode,
  country: CountryNode,
  debt: DebtNode,
  factory: FactoryNode,
  risk: RiskNode,
};

export const investorEdgeTypes: EdgeTypes = {
  investorEdge: InvestorEdge,
};
