import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type EdgeMouseHandler,
  type NodeChange,
  type NodeMouseHandler,
  type OnSelectionChangeFunc,
  type XYPosition,
} from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';
import { buildFlowEdges, buildFlowNodes, investorEdgeTypes, investorNodeTypes } from './flowConfig';
import { useScenarioStore } from '../../store/useScenarioStore';
import { createScenarioEdge, createScenarioNode, TIME_HORIZONS } from '../../utils/factories';
import { EdgeQuickCreateModal, type EdgeQuickCreateState } from '../panels/EdgeQuickCreateModal';

interface ContextMenuState {
  kind: 'node' | 'edge' | 'pane';
  targetId?: string;
  position: { x: number; y: number };
}

const defaultEdgeDraft: EdgeQuickCreateState = {
  type: 'cashFlow',
  label: 'New connection',
  amount: '',
  currency: 'USD',
  recurring: 'recurring',
  timeHorizon: TIME_HORIZONS[0],
};

export const GraphCanvas = () => {
  const {
    activeScenarioId,
    activeSummaryPanel,
    addEdge,
    addNode,
    clearSelection,
    convertEdgeType,
    deleteEdge,
    deleteSelectedNodes,
    duplicateNode,
    highlightedEdgeIds,
    highlightedNodeIds,
    moveNodes,
    openSummaryPanel,
    placementNodeType,
    reverseEdge,
    scenarios,
    setPlacementNodeType,
    setSelection,
    updateNodeField,
  } = useScenarioStore();
  const scenario = scenarios.find((candidate) => candidate.metadata.id === activeScenarioId) ?? scenarios[0];
  const flowNodes = useMemo(
    () => buildFlowNodes(scenario, highlightedNodeIds, activeSummaryPanel),
    [activeSummaryPanel, highlightedNodeIds, scenario],
  );
  const flowEdges = useMemo(
    () => buildFlowEdges(scenario, flowNodes, highlightedEdgeIds),
    [flowNodes, highlightedEdgeIds, scenario],
  );
  const [nodes, setNodes] = useNodesState(flowNodes);
  const [edges, setEdges] = useEdgesState(flowEdges);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [edgeDraft, setEdgeDraft] = useState<EdgeQuickCreateState>(defaultEdgeDraft);
  const { fitView, screenToFlowPosition, setCenter } = useReactFlow();

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowEdges, flowNodes, setEdges, setNodes]);

  useEffect(() => {
    fitView({ padding: 0.2, duration: 250 });
  }, [activeScenarioId, fitView]);

  const handleNodesChange = (changes: NodeChange[]) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
    const completedMoves = changes.reduce<Array<{ id: string; position: XYPosition }>>((positions, change) => {
      if (change.type === 'position' && 'position' in change && change.position && !change.dragging) {
        positions.push({ id: change.id, position: change.position });
      }
      return positions;
    }, []);
    if (completedMoves.length > 0) {
      moveNodes(completedMoves);
    }
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  };

  const handleSelectionChange: OnSelectionChangeFunc = ({ nodes: selectedNodes, edges: selectedEdges }) => {
    setSelection({
      nodeId: selectedNodes.length === 1 ? selectedNodes[0].id : null,
      edgeId: selectedEdges.length === 1 ? selectedEdges[0].id : null,
      nodeIds: selectedNodes.map((node) => node.id),
    });
  };

  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }
    setPendingConnection(connection);
    setEdgeDraft({
      ...defaultEdgeDraft,
      type: connection.source.includes('risk') ? 'riskLink' : 'cashFlow',
      label: 'New connection',
    });
  };

  const handlePaneClick = (event: React.MouseEvent) => {
    setContextMenu(null);
    if (placementNodeType) {
      addNode(createScenarioNode(placementNodeType, screenToFlowPosition({ x: event.clientX, y: event.clientY })));
      setPlacementNodeType(null);
      return;
    }
    clearSelection();
    openSummaryPanel(null);
  };

  const handleNodeContextMenu: NodeMouseHandler = (event, node) => {
    event.preventDefault();
    setContextMenu({ kind: 'node', targetId: node.id, position: { x: event.clientX, y: event.clientY } });
  };

  const handleEdgeContextMenu: EdgeMouseHandler = (event, edge) => {
    event.preventDefault();
    setContextMenu({ kind: 'edge', targetId: edge.id, position: { x: event.clientX, y: event.clientY } });
  };

  const handleNodeDoubleClick: NodeMouseHandler = (_event, node) => {
    setSelection({ nodeId: node.id, edgeId: null, nodeIds: [node.id] });
    setCenter(node.position.x, node.position.y, { zoom: 1.05, duration: 250 });
  };

  const createEdgeFromDraft = () => {
    if (!pendingConnection?.source || !pendingConnection.target) {
      return;
    }
    addEdge(
      createScenarioEdge(
        edgeDraft.type,
        pendingConnection.source,
        pendingConnection.target,
        edgeDraft.amount ? Number(edgeDraft.amount) : null,
        edgeDraft.currency,
        edgeDraft.label,
        edgeDraft.timeHorizon,
        edgeDraft.recurring,
      ),
    );
    setPendingConnection(null);
    setEdgeDraft(defaultEdgeDraft);
  };

  return (
    <div
      className="absolute inset-0 z-10"
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.react-flow__pane')) {
          addNode(createScenarioNode('analystNote', screenToFlowPosition({ x: event.clientX, y: event.clientY })));
        }
      }}
    >
      <ReactFlow
        className="react-flow-ornate"
        defaultViewport={{ x: 80, y: 20, zoom: 0.86 }}
        deleteKeyCode={['Backspace', 'Delete']}
        edgeTypes={investorEdgeTypes}
        edges={edges}
        fitView
        multiSelectionKeyCode={['Shift']}
        nodeTypes={investorNodeTypes}
        nodes={nodes}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodesChange={handleNodesChange}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          setContextMenu({ kind: 'pane', position: { x: event.clientX, y: event.clientY } });
        }}
        onSelectionChange={handleSelectionChange}
        panActivationKeyCode={['Space']}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag
        snapGrid={scenario.visualSettings.snappingMode === 'geographic' ? [24, 24] : [1, 1]}
        snapToGrid={scenario.visualSettings.snappingMode === 'geographic'}
      >
        <Background color="rgba(199,168,106,0.08)" gap={64} />
      </ReactFlow>

      {contextMenu ? (
        <div className="absolute z-30 w-52 rounded-2xl border border-brass/25 bg-obsidian/95 p-2 shadow-panel" style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
          {contextMenu.kind === 'node' ? (
            <>
              <button className="context-menu-item" onClick={() => contextMenu.targetId && duplicateNode(contextMenu.targetId)} type="button">
                Duplicate node
              </button>
              <button
                className="context-menu-item"
                onClick={() => {
                  if (contextMenu.targetId) {
                    updateNodeField(contextMenu.targetId, 'scenarioFlags.isPlanned', true);
                  }
                }}
                type="button"
              >
                Mark planned
              </button>
              <button className="context-menu-item" onClick={() => deleteSelectedNodes()} type="button">
                Delete selected
              </button>
            </>
          ) : null}
          {contextMenu.kind === 'edge' ? (
            <>
              <button className="context-menu-item" onClick={() => contextMenu.targetId && reverseEdge(contextMenu.targetId)} type="button">
                Reverse direction
              </button>
              <button className="context-menu-item" onClick={() => contextMenu.targetId && convertEdgeType(contextMenu.targetId, 'cashFlow')} type="button">
                Convert to cash flow
              </button>
              <button className="context-menu-item" onClick={() => contextMenu.targetId && convertEdgeType(contextMenu.targetId, 'debtRelationship')} type="button">
                Convert to debt
              </button>
              <button className="context-menu-item" onClick={() => contextMenu.targetId && deleteEdge(contextMenu.targetId)} type="button">
                Delete edge
              </button>
            </>
          ) : null}
          {contextMenu.kind === 'pane' ? (
            <>
              <button className="context-menu-item" onClick={() => setPlacementNodeType('analystNote')} type="button">
                Place analyst note
              </button>
              <button className="context-menu-item" onClick={() => fitView({ padding: 0.2, duration: 250 })} type="button">
                Recenter world map
              </button>
            </>
          ) : null}
          <button className="context-menu-item" onClick={() => setContextMenu(null)} type="button">
            Close
          </button>
        </div>
      ) : null}

      <EdgeQuickCreateModal
        onChange={setEdgeDraft}
        onClose={() => {
          setPendingConnection(null);
          setEdgeDraft(defaultEdgeDraft);
        }}
        onCreate={createEdgeFromDraft}
        open={Boolean(pendingConnection)}
        value={edgeDraft}
      />
    </div>
  );
};
