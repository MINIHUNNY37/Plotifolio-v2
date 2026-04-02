import { useState } from 'react';
import { Link2, MapPinned, TriangleAlert } from 'lucide-react';
import { countryAnchors, edgeDefinitions, entityDefinitions, metricDefinitions } from '../../data/catalog';
import { useCanvas } from '../../context/CanvasContext';
import { formatMetric } from '../../utils/model';
import { IconGlyph } from './IconGlyph';

const nodeTabs = ['Overview', 'Financials', 'Geography', 'Scenario', 'Risk'] as const;
const edgeTabs = ['Terms', 'Scenario', 'Risk', 'Routing'] as const;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const RightInspector = () => {
  const {
    activeOverlay,
    edges,
    mode,
    moveNode,
    nodes,
    recenterNode,
    selection,
    snapshot,
    toggleNodeCollapse,
    toggleNodePin,
    updateEdgeMetric,
    updateNodeMetric,
  } = useCanvas();
  const [nodeTab, setNodeTab] = useState<(typeof nodeTabs)[number]>('Overview');
  const [edgeTab, setEdgeTab] = useState<(typeof edgeTabs)[number]>('Terms');

  const effectiveNode =
    selection?.kind === 'node' ? snapshot.effectiveNodes.find((node) => node.id === selection.id) : null;
  const selectedNode = selection?.kind === 'node' ? nodes.find((node) => node.id === selection.id) : null;
  const effectiveEdge =
    selection?.kind === 'edge' ? snapshot.effectiveEdges.find((edge) => edge.id === selection.id) : null;
  const selectedEdge = selection?.kind === 'edge' ? edges.find((edge) => edge.id === selection.id) : null;

  if (!selectedNode && !selectedEdge && selection?.kind !== 'metric') {
    return (
      <aside className="inspector-panel">
        <div className="inspector-panel__header">
          <div>
            <div className="inspector-panel__eyebrow">Inspector</div>
            <h2>Selection details</h2>
          </div>
          <div className="inspector-mode-pill">{mode}</div>
        </div>

        <div className="inspector-empty">
          <div className="inspector-empty__card">
            <h3>Build the company footprint</h3>
            <p>Select a node or edge to inspect baseline metrics, geography, and scenario assumptions.</p>
          </div>
          <div className="inspector-empty__card">
            <h3>Scenario mode</h3>
            <p>Use the right-side drawer to override node or edge assumptions and watch the investor ribbon update.</p>
          </div>
          <div className="inspector-empty__card">
            <h3>Active overlay</h3>
            <p>{activeOverlay ? `Currently focused on ${activeOverlay}.` : 'No macro overlay active.'}</p>
          </div>
        </div>
      </aside>
    );
  }

  if (selection?.kind === 'metric') {
    const metricKey = selection.id as keyof typeof snapshot.companySummary;
    const currentValue = snapshot.companySummary[metricKey];
    const baselineValue = snapshot.baselineSummary[metricKey];
    return (
      <aside className="inspector-panel">
        <div className="inspector-panel__header">
          <div>
            <div className="inspector-panel__eyebrow">Investor metric</div>
            <h2>{metricKey}</h2>
          </div>
          <div className="inspector-mode-pill">{mode}</div>
        </div>

        <div className="metric-focus">
          <div className="metric-focus__hero">
            <span>Current</span>
            <strong>{formatMetric(currentValue, metricKey === 'netDebtToEbitda' ? 'multiple' : metricKey === 'roe' || metricKey === 'roic' || metricKey === 'upsideDownside' ? 'percent' : 'currency')}</strong>
            <small>Baseline {formatMetric(baselineValue, metricKey === 'netDebtToEbitda' ? 'multiple' : metricKey === 'roe' || metricKey === 'roic' || metricKey === 'upsideDownside' ? 'percent' : 'currency')}</small>
          </div>
          <div className="metric-focus__drivers">
            {snapshot.drivers.map((driver) => (
              <div key={driver.id} className="metric-focus__driver">
                <span>{driver.label}</span>
                <span className={driver.delta >= 0 ? 'is-positive' : 'is-negative'}>
                  {driver.delta >= 0 ? '+' : ''}
                  {formatMetric(driver.delta, driver.metric === 'grossMargin' ? 'percent' : 'currency')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (selectedNode && effectiveNode) {
    const definition = entityDefinitions[selectedNode.type];
    const country = countryAnchors.find((item) => item.code === selectedNode.countryCode);
    const visibleMetrics = nodeTab === 'Financials' ? [...definition.defaultMetrics, ...definition.expandedMetrics] : definition.defaultMetrics;
    const scenarioMetrics = definition.scenarioMetrics;
    const derivedMetrics = Object.keys(selectedNode.derivedOutputs);

    return (
      <aside className="inspector-panel">
        <div className="inspector-panel__header">
          <div className="inspector-header__identity">
            <div className={`entity-chip entity-chip--${definition.category}`}>
              <IconGlyph name={definition.icon} size={16} />
            </div>
            <div>
              <div className="inspector-panel__eyebrow">{definition.label}</div>
              <h2>{selectedNode.label}</h2>
            </div>
          </div>
          <div className={`status-pill ${selectedNode.status === 'warning' ? 'is-warning' : ''}`}>
            {selectedNode.status}
          </div>
        </div>

        <div className="inspector-tabs">
          {nodeTabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${tab === nodeTab ? 'is-active' : ''}`}
              onClick={() => setNodeTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="inspector-content">
          {nodeTab === 'Overview' && (
            <div className="inspector-section">
              <div className="detail-list">
                <div className="detail-list__row">
                  <span>Country</span>
                  <strong>{country ? `${country.flag} ${country.name}` : selectedNode.countryCode}</strong>
                </div>
                <div className="detail-list__row">
                  <span>Mobility</span>
                  <strong>{definition.mobility}</strong>
                </div>
                <div className="detail-list__row">
                  <span>Confidence</span>
                  <strong>{Math.round(selectedNode.confidence * 100)}%</strong>
                </div>
              </div>

              <div className="tag-row">
                {selectedNode.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="quick-actions">
                <button className="ghost-button" onClick={() => toggleNodePin(selectedNode.id)} type="button">
                  <MapPinned size={14} />
                  {selectedNode.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="ghost-button" onClick={() => recenterNode(selectedNode.id)} type="button">
                  Re-center
                </button>
                <button className="ghost-button" onClick={() => toggleNodeCollapse(selectedNode.id)} type="button">
                  {selectedNode.collapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
            </div>
          )}

          {nodeTab === 'Financials' && (
            <div className="inspector-section">
              {visibleMetrics.map((metricKey) => {
                const definition = metricDefinitions[metricKey];
                const value = selectedNode.baselineMetrics[metricKey];
                if (!definition) {
                  return null;
                }
                return (
                  <label key={metricKey} className="metric-editor">
                    <span>{definition.label}</span>
                    <div className="metric-editor__controls">
                      <input
                        type="number"
                        value={value ?? 0}
                        onChange={(event) => updateNodeMetric(selectedNode.id, metricKey, toNumber(event.target.value), 'baseline')}
                      />
                      <strong>{formatMetric(value, definition.format, definition.precision)}</strong>
                    </div>
                  </label>
                );
              })}

              {derivedMetrics.length > 0 && (
                <div className="inspector-subsection">
                  <div className="subsection-title">Derived outputs</div>
                  {derivedMetrics.map((metricKey) => (
                    <div key={metricKey} className="detail-list__row">
                      <span>{metricDefinitions[metricKey]?.label ?? metricKey}</span>
                      <strong>{formatMetric(effectiveNode.derivedOutputs[metricKey], metricDefinitions[metricKey]?.format)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {nodeTab === 'Geography' && (
            <div className="inspector-section">
              <label className="metric-editor">
                <span>Assigned country</span>
                <select
                  value={selectedNode.countryCode}
                  onChange={(event) => {
                    const nextCountry = countryAnchors.find((item) => item.code === event.target.value);
                    if (!nextCountry) {
                      return;
                    }
                    moveNode(selectedNode.id, nextCountry.position, nextCountry.code);
                  }}
                >
                  {countryAnchors.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="detail-list">
                <div className="detail-list__row">
                  <span>Region</span>
                  <strong>{selectedNode.regionId}</strong>
                </div>
                <div className="detail-list__row">
                  <span>Manual X offset</span>
                  <strong>{selectedNode.manualOffset.x.toFixed(0)} px</strong>
                </div>
                <div className="detail-list__row">
                  <span>Manual Y offset</span>
                  <strong>{selectedNode.manualOffset.y.toFixed(0)} px</strong>
                </div>
              </div>
            </div>
          )}

          {nodeTab === 'Scenario' && (
            <div className="inspector-section">
              {scenarioMetrics.map((metricKey) => {
                const definition = metricDefinitions[metricKey];
                const baselineValue = selectedNode.baselineMetrics[metricKey] ?? 0;
                const overrideValue = selectedNode.scenarioOverrides[metricKey];
                if (!definition) {
                  return null;
                }
                return (
                  <label key={metricKey} className="metric-editor">
                    <span>{definition.label}</span>
                    <div className="metric-editor__controls">
                      <input
                        type="number"
                        value={overrideValue ?? baselineValue}
                        onChange={(event) => updateNodeMetric(selectedNode.id, metricKey, toNumber(event.target.value), 'scenario')}
                      />
                      <strong className={(overrideValue ?? baselineValue) >= baselineValue ? 'is-positive' : 'is-negative'}>
                        {formatMetric((overrideValue ?? baselineValue) - baselineValue, definition.format, definition.precision)}
                      </strong>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {nodeTab === 'Risk' && (
            <div className="inspector-section">
              <div className="alert-card">
                <TriangleAlert size={16} />
                <div>
                  <strong>{effectiveNode.status === 'warning' ? 'Stress threshold triggered' : 'No active warning threshold'}</strong>
                  <p>Macro overlays and connected edges drive this state. Use compare mode to inspect directional changes.</p>
                </div>
              </div>
              <div className="detail-list">
                <div className="detail-list__row">
                  <span>Overlay focus</span>
                  <strong>{activeOverlay ?? 'None'}</strong>
                </div>
                <div className="detail-list__row">
                  <span>Risk tags</span>
                  <strong>{selectedNode.tags.join(', ')}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  if (!selectedEdge || !effectiveEdge) {
    return null;
  }

  const edgeDefinition = edgeDefinitions[selectedEdge.primaryType];
  const editableMetrics = edgeDefinition.inlineMetrics;

  return (
    <aside className="inspector-panel">
      <div className="inspector-panel__header">
        <div className="inspector-header__identity">
          <div className="entity-chip entity-chip--financial">
            <IconGlyph name={edgeDefinition.icon} size={16} />
          </div>
          <div>
            <div className="inspector-panel__eyebrow">Relationship</div>
            <h2>{edgeDefinition.label}</h2>
          </div>
        </div>
        <div className="status-pill">{selectedEdge.riskFlags.length ? 'stressed' : 'stable'}</div>
      </div>

      <div className="inspector-tabs">
        {edgeTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${tab === edgeTab ? 'is-active' : ''}`}
            onClick={() => setEdgeTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="inspector-content">
        {(edgeTab === 'Terms' || edgeTab === 'Scenario') && (
          <div className="inspector-section">
            {editableMetrics.map((metricKey) => {
              const definition = metricDefinitions[metricKey];
                const baselineValue = selectedEdge.baselineTerms[metricKey] ?? 0;
                const scenarioValue = selectedEdge.scenarioOverrides[metricKey];
              if (!definition) {
                return null;
              }
              return (
                <label key={metricKey} className="metric-editor">
                  <span>{definition.label}</span>
                  <div className="metric-editor__controls">
                    <input
                      type="number"
                      value={edgeTab === 'Scenario' ? scenarioValue ?? baselineValue : baselineValue}
                      onChange={(event) =>
                        updateEdgeMetric(
                          selectedEdge.id,
                          metricKey,
                          toNumber(event.target.value),
                          edgeTab === 'Scenario' ? 'scenario' : 'baseline',
                        )
                      }
                    />
                    <strong>{formatMetric(edgeTab === 'Scenario' ? scenarioValue ?? baselineValue : baselineValue, definition.format, definition.precision)}</strong>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {edgeTab === 'Risk' && (
          <div className="inspector-section">
            <div className="alert-card">
              <TriangleAlert size={16} />
              <div>
                <strong>{selectedEdge.riskFlags.length ? selectedEdge.riskFlags.join(', ') : 'No explicit risk flag'}</strong>
                  <p>Stress score {formatMetric(effectiveEdge.derivedEffects.stress, 'percent')}</p>
                </div>
              </div>
            <div className="detail-list">
              <div className="detail-list__row">
                <span>Confidence</span>
                <strong>{Math.round(selectedEdge.confidence * 100)}%</strong>
              </div>
              <div className="detail-list__row">
                <span>Modifiers</span>
                <strong>{selectedEdge.modifierTags.join(', ') || 'None'}</strong>
              </div>
            </div>
          </div>
        )}

        {edgeTab === 'Routing' && (
          <div className="inspector-section">
            <div className="detail-list">
              <div className="detail-list__row">
                <span>Routing style</span>
                <strong>{selectedEdge.routingStyle}</strong>
              </div>
              <div className="detail-list__row">
                <span>Connection type</span>
                <strong>{selectedEdge.primaryType}</strong>
              </div>
            </div>
            <div className="alert-card">
              <Link2 size={16} />
              <div>
                <strong>Inline editing supported</strong>
                <p>Midpoint chips on the canvas expose the same high-frequency terms shown here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
