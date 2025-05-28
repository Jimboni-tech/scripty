import React from 'react';
import { Plus, Edit, Trash2, Save, Upload, LogOut } from 'lucide-react'; // Import LogOut icon

const MindMapToolbar = ({
  onAddNode,
  onEditNode,
  onDeleteNode,
  selectedNode,
  isRootSelected,
  onSave,
  onLoad,
  loading,
  message,
  onLogout, 
  userName 
}) => {
  const isNodeSelected = selectedNode !== null;

  return (
    <div className="mindmap-toolbar">
      {/* Existing Node Action Buttons */}
      <button
        onClick={onAddNode}
        className="btn btn-primary"
        disabled={!isNodeSelected && !isRootSelected}
      >
        <Plus className="btn-icon" /> Add Node
      </button>
      <button
        onClick={onEditNode}
        className="btn btn-secondary"
        disabled={!isNodeSelected}
      >
        <Edit className="btn-icon" /> Edit Node
      </button>
      <button
        onClick={onDeleteNode}
        className="btn btn-danger"
        disabled={!isNodeSelected || isRootSelected}
      >
        <Trash2 className="btn-icon" /> Delete Node
      </button>

      {/* Persistence Buttons */}
      <button
        onClick={onSave}
        className="btn btn-primary"
        disabled={loading}
      >
        <Save className="btn-icon" /> {loading ? 'Saving...' : 'Save Mind Map'}
      </button>
      <button
        onClick={onLoad}
        className="btn btn-secondary"
        disabled={loading}
      >
        <Upload className="btn-icon" /> {loading ? 'Loading...' : 'Load Mind Map'}
      </button>

    
    </div>
  );
};

export default MindMapToolbar;