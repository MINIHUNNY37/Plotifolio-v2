import type { EdgeKind, ScenarioEdge, ScenarioNode, TimeHorizon } from '../types/scenario';

export const TIME_HORIZONS: TimeHorizon[] = ['Now', '1Y', '3Y', '5Y', 'Event Horizon'];

export const EDGE_STYLE_PRESETS: Record<
  EdgeKind,
  {
    stroke: string;
    glow: string;
    width: number;
    dashPattern?: string;
    arrowDirection: 'forward' | 'reverse' | 'both';
  }
> = {
  supplyFlow: { stroke: '#5f8f87', glow: 'rgba(95,143,135,0.28)', width: 2.4, arrowDirection: 'forward' },
  productMovement: { stroke: '#4f9d96', glow: 'rgba(79,157,150,0.32)', width: 2.6, arrowDirection: 'forward' },
  ownershipControl: { stroke: '#7f97b4', glow: 'rgba(127,151,180,0.28)', width: 2.4, dashPattern: '8 4', arrowDirection: 'forward' },
  cashFlow: { stroke: '#7e9784', glow: 'rgba(126,151,132,0.36)', width: 3, arrowDirection: 'forward' },
  debtRelationship: { stroke: '#c7a86a', glow: 'rgba(199,168,106,0.42)', width: 3, arrowDirection: 'forward' },
  dependency: { stroke: '#78bfd0', glow: 'rgba(120,191,208,0.28)', width: 2.2, dashPattern: '10 6', arrowDirection: 'forward' },
  riskLink: { stroke: '#cb6f5b', glow: 'rgba(203,111,91,0.4)', width: 2.4, dashPattern: '6 6', arrowDirection: 'forward' },
  plannedFuture: { stroke: '#d7dde4', glow: 'rgba(215,221,228,0.22)', width: 2.2, dashPattern: '3 7', arrowDirection: 'forward' },
};

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const createScenarioNode = (type: ScenarioNode['type'], position: ScenarioNode['position']): ScenarioNode => {
  const base = {
    id: createId(type),
    type,
    position,
    tags: ['New'],
    notes: '',
    scenarioFlags: { isChanged: true, tone: 'added' as const, isInactive: false, isPlanned: false },
    display: {
      accentColor: '#c7a86a',
      showFields: [],
      showOnNodeCard: [],
      labelPinned: false,
      compact: false,
    },
  };

  switch (type) {
    case 'company':
      return {
        ...base,
        type,
        title: 'New Company',
        subtitle: 'Country | Headquarters',
        icon: 'building-2',
        status: 'Command node',
        metadata: {
          companyName: 'New Company',
          ticker: 'TICK',
          headquartersCountry: 'United States',
          sector: 'Sector',
          marketCap: 0,
          thesisSummary: '',
          primaryCurrency: 'USD',
          managementNotes: '',
          revenue: 0,
          ebitda: 0,
          cash: 0,
          debt: 0,
          logo: '',
        },
      };
    case 'factory':
      return {
        ...base,
        type,
        title: 'New Factory',
        subtitle: 'Country | City',
        icon: 'factory',
        status: 'Active',
        metadata: {
          factoryName: 'New Factory',
          country: 'Vietnam',
          regionCity: 'City',
          productionStatus: 'active',
          productionCapacity: 1000,
          utilizationRate: 0.5,
          productsMade: [],
          costProfile: '',
          keyDependencies: [],
          inputSuppliers: [],
          outputDestinations: [],
          operationalRisks: [],
          laborRisk: 'Moderate',
          energyRisk: 'Moderate',
        },
      };
    case 'bank':
      return {
        ...base,
        type,
        title: 'New Bank',
        subtitle: 'Country | Lender',
        icon: 'landmark',
        status: 'Monitoring',
        metadata: {
          bankName: 'New Bank',
          country: 'Japan',
          exposureAmount: 0,
          loanType: 'Facility',
          interestRate: 0.05,
          maturityDate: '2028-12-31',
          covenantNotes: '',
          refinancingRisk: 'moderate',
          creditNotes: '',
          associatedDebtInstruments: [],
          currency: 'USD',
        },
      };
    case 'cashPool':
      return {
        ...base,
        type,
        title: 'New Cash Pool',
        subtitle: 'Country | Treasury',
        icon: 'wallet',
        status: 'Liquid',
        metadata: {
          cashAmount: 0,
          country: 'Singapore',
          legalEntity: '',
          sourceType: '',
          restrictionsOnMovement: '',
          intendedUse: '',
          currency: 'USD',
        },
      };
    case 'debt':
      return {
        ...base,
        type,
        title: 'New Debt Instrument',
        subtitle: 'Country | Facility',
        icon: 'badge-dollar-sign',
        status: 'Outstanding',
        metadata: {
          instrumentName: 'New Debt Instrument',
          lender: '',
          amount: 0,
          currency: 'USD',
          fixedOrFloating: 'fixed',
          rate: 0.05,
          maturity: '2029-12-31',
          secured: 'unsecured',
          tiedEntity: '',
          country: 'United States',
        },
      };
    case 'country':
      return {
        ...base,
        type,
        title: 'New Country',
        subtitle: 'Exposure anchor',
        icon: 'globe-2',
        status: 'Tracked',
        metadata: {
          countryName: 'Country',
          riskScore: 30,
          fxExposure: 0.25,
          regulatoryExposure: 0.2,
          taxExposure: 0.2,
          politicalRisk: 0.2,
        },
      };
    case 'risk':
      return {
        ...base,
        type,
        title: 'New Risk',
        subtitle: 'Category | Scenario',
        icon: 'triangle-alert',
        status: 'Open',
        metadata: {
          riskName: 'New Risk',
          category: 'Operations',
          probability: 0.3,
          severity: 50,
          affectedNodeIds: [],
          timeHorizon: '1Y',
          mitigationNotes: '',
          expectedImpact: '',
        },
      };
    case 'analystNote':
      return {
        ...base,
        type,
        title: 'Analyst Note',
        subtitle: 'Scenario annotation',
        icon: 'scroll-text',
        status: 'Reference',
        metadata: {
          noteTitle: 'Analyst Note',
          text: '',
          priority: 'medium',
          linkedAssumptionIds: [],
          linkedNodeIds: [],
          confidence: 0.5,
        },
      };
  }
};

export const createScenarioEdge = (
  type: EdgeKind,
  source: string,
  target: string,
  amount: number | null,
  currency: string,
  label: string,
  timeHorizon: TimeHorizon,
  recurring: 'recurring' | 'one-time',
): ScenarioEdge => {
  const base = {
    id: createId('edge'),
    type,
    source,
    target,
    label,
    amount,
    currency,
    timeHorizon,
    notes: '',
    confidence: 0.7,
    styleConfig: {
      preset: type,
      ...EDGE_STYLE_PRESETS[type],
    },
    scenarioFlags: { isChanged: true, tone: 'added' as const, isInactive: false, isPlanned: type === 'plannedFuture' },
  };

  if (type === 'riskLink') {
    return {
      ...base,
      metadata: {
        probability: 0.3,
        severity: 50,
        mitigation: '',
        scenarioImpact: '',
      },
    };
  }

  return {
    ...base,
    metadata: {
      recurring,
      scenarioImpact: '',
    },
  };
};
