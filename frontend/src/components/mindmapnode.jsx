import React from 'react';

const MindMapNode = ({
  node,
  isBeingDragged,
  isSelected,
  onMouseDown,
  openNodeEditor 
}) => {
  const nodeClasses = [
    'mindmap-node',
    node.isRoot ? 'node-root' : 'node-child',
    isSelected ? 'node-selected' : '',
    isBeingDragged ? 'node-dragging' : ''
  ].filter(Boolean).join(' ');

  const baseFontSize = node.isRoot ? 16 : 14;
  const basePaddingY = node.isRoot ? 18 : 14;
  const basePaddingX = node.isRoot ? 28 : 20;
  const baseMinWidth = node.isRoot ? 140 : 100;
  const baseBorderRadius = node.isRoot ? 12 : 8;
  const baseBorderWidth = node.isRoot ? 1 : 1;

  return (
    <div
      key={node.id}
      className={nodeClasses}
      style={{
        left: node.x + 'px',
        top: node.y + 'px',
        '--node-color': node.color,
        transform: isSelected && !isBeingDragged ? 'scale(1.04)' : (isBeingDragged ? 'scale(1.06)' : 'none'),
        transformOrigin: 'center center',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={() => openNodeEditor(node.id)} 
    >
      <div
        className="node-content"
        style={{
          fontSize: `${baseFontSize}px`,
          padding: `${basePaddingY}px ${basePaddingX}px`,
          minWidth: `${baseMinWidth}px`,
          borderRadius: `${baseBorderRadius}px`,
          lineHeight: `1.5`,
          borderWidth: `${baseBorderWidth}px`,
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`
        }}
      >

        <div className="node-title">{node.title}</div>
      </div>
    </div>
  );
};

export default MindMapNode;