import React from 'react'; // Only React is needed, no hooks
import { Plus, Edit, Trash2, Save, LogOut, RefreshCw } from 'lucide-react';
import './mindmaptoolbar.css';

const MindMapToolbar = ({
  onAddNode,
  onEditNode,
  onDeleteNode,
  selectedNode,
  isRootSelected,
  onSave,
  loading,
  message,
  onLogout,
  userName,
}) => {
  const isNodeSelected = selectedNode !== null;

  return (
    <div className="mindmap-toolbar-wrapper">
      <div className="mindmap-toolbar">
        {/* Map Actions Section (now only Save) */}
        <div className="toolbar-section map-actions">
          <button onClick={onSave} className="btn btn-primary" disabled={loading} title="Save Current Mind Map">
            {loading ? <RefreshCw className="btn-icon spin" /> : <Save className="btn-icon" />} Save
          </button>
        </div>

        {/* Node Actions Section */}
        <div className="toolbar-section node-actions">
          <button
            onClick={onAddNode}
            className="btn btn-add"
            disabled={!isNodeSelected && !isRootSelected}
            title="Add Child Node to Selected Idea"
          >
            <Plus className="btn-icon" /> Add Node
          </button>
          <button
            onClick={onEditNode}
            className="btn btn-edit"
            disabled={!isNodeSelected}
            title="Edit Selected Idea's Content"
          >
            <Edit className="btn-icon" /> Edit Node
          </button>
          <button
            onClick={onDeleteNode}
            className="btn btn-delete"
            disabled={!isNodeSelected || isRootSelected}
            title="Delete Selected Idea (Root cannot be deleted)"
          >
            <Trash2 className="btn-icon" /> Delete Node
          </button>
        </div>

      </div>
      {message && <div className={`toolbar-message ${loading ? 'loading' : ''}`}>{message}</div>}
    </div>
  );
};

export default MindMapToolbar;