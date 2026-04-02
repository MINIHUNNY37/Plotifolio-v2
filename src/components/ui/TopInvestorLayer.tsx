import { BarChart3, ChevronDown, ChevronUp, Radar } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';
import { formatMetric } from '../../utils/model';

const ribbonMetrics = [
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'ebitda', label: 'EBITDA', format: 'currency' },
  { key: 'freeCashFlow', label: 'FCF', format: 'currency' },
  { key: 'roic', label: 'ROIC', format: 'percent' },
  { key: 'netDebtToEbitda', label: 'Net debt / EBITDA', format: 'multiple' },
  { key: 'fairValue', label: 'Fair value', format: 'currency' },
  { key: 'upsideDownside', label: 'Upside / Downside', format: 'percent' },
] as const;

export const TopInvestorLayer = () => {
  const {
    activeScenario,
    investorRibbonExpanded,
    selection,
    setInvestorRibbonExpanded,
    setSelection,
    snapshot,
  } = useCanvas();

  return (
    <section className={`investor-ribbon ${investorRibbonExpanded ? 'is-expanded' : ''}`}>
      <div className="investor-ribbon__header">
        <div className="investor-ribbon__identity">
          <div className={`scenario-pill tone-${activeScenario.tone}`}>
            <Radar size={13} />
            {activeScenario.name}
          </div>
          <div className="investor-ribbon__summary">
            <span>Company summary</span>
            <span>{activeScenario.description}</span>
          </div>
        </div>

        <button
          className="ghost-button"
          onClick={() => setInvestorRibbonExpanded(!investorRibbonExpanded)}
          type="button"
        >
          {investorRibbonExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {investorRibbonExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="investor-ribbon__metrics">
        {ribbonMetrics.map((metric) => {
          const currentValue = snapshot.companySummary[metric.key];
          const baselineValue = snapshot.baselineSummary[metric.key];
          const delta = currentValue - baselineValue;
          const isActive = selection?.kind === 'metric' && selection.id === metric.key;
          return (
            <button
              key={metric.key}
              className={`metric-card ${isActive ? 'is-active' : ''}`}
              onClick={() => setSelection({ kind: 'metric', id: metric.key })}
              type="button"
            >
              <span className="metric-card__label">{metric.label}</span>
              <span className="metric-card__value">
                {formatMetric(currentValue, metric.format)}
              </span>
              <span className={`metric-card__delta ${delta >= 0 ? 'is-positive' : 'is-negative'}`}>
                {delta >= 0 ? '+' : ''}
                {formatMetric(delta, metric.format)}
              </span>
            </button>
          );
        })}
      </div>

      {investorRibbonExpanded && (
        <div className="investor-ribbon__drivers">
          <div className="driver-panel">
            <div className="driver-panel__header">
              <BarChart3 size={14} />
              Top drivers
            </div>
            <div className="driver-panel__list">
              {snapshot.drivers.map((driver) => (
                <button
                  key={driver.id}
                  className="driver-row"
                  onClick={() => setSelection({ kind: 'metric', id: driver.metric })}
                  type="button"
                >
                  <span>{driver.label}</span>
                  <span className={driver.delta >= 0 ? 'is-positive' : 'is-negative'}>
                    {driver.delta >= 0 ? '+' : ''}
                    {formatMetric(driver.delta, driver.metric === 'grossMargin' ? 'percent' : 'currency')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="driver-panel driver-panel--narrow">
            <div className="driver-panel__header">Confidence</div>
            <div className="confidence-meter">
              <div className="confidence-meter__fill" style={{ width: `${snapshot.companySummary.confidence}%` }} />
            </div>
            <div className="confidence-meter__meta">
              <span>{snapshot.companySummary.confidence.toFixed(0)}% model confidence</span>
              <span>{snapshot.companySummary.keySensitivity.toFixed(0)} stress sensitivity</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
