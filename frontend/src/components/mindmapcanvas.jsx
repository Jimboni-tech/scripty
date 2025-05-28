import React, { useMemo } from 'react';
import MindMapConnection from './mindmapconnections';
import MindMapNode from './mindmapnode';

const TYPICAL_NODE_WIDTH = 140;
const TYPICAL_NODE_HEIGHT = 50;

const MindMapCanvas = ({
  nodes,
  connections,
  draggedNode,
  selectedNode,
  translateX,
  translateY,
  handleMouseDown,
  openNodeEditor,
  canvasWrapperRef, 
  svgRef            
}) => {
  const connectionPaths = useMemo(() => {
    return connections.map(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);

      if (!fromNode || !toNode) return { ...connection, path: '' };

      const fromX = fromNode.x + TYPICAL_NODE_WIDTH / 2;
      const fromY = fromNode.y + TYPICAL_NODE_HEIGHT / 2;

      const toX = toNode.x + TYPICAL_NODE_WIDTH / 2;
      const toY = toNode.y + TYPICAL_NODE_HEIGHT / 2;

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;

      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const offsetFactor = dist / 4;
      const controlX = midX + offsetFactor * Math.sin(angle);
      const controlY = midY - offsetFactor * Math.cos(angle);

      const path = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

      return { ...connection, path };
    });
  }, [nodes, connections]);

  return (
    <div
      className="mindmap-canvas-wrapper"
      ref={canvasWrapperRef} 
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
        transformOrigin: '0 0',
      }}
    >
      <svg ref={svgRef} className="mindmap-connections"> 
        {connectionPaths.map((connection) => (
          <MindMapConnection
            key={`${connection.from}-${connection.to}`}
            path={connection.path}
          />
        ))}
      </svg>

      {nodes.map((node) => (
        <MindMapNode
          key={node.id}
          node={node}
          isBeingDragged={draggedNode === node.id}
          isSelected={selectedNode === node.id}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          openNodeEditor={openNodeEditor}
        />
      ))}
    </div>
  );
};

export default MindMapCanvas;