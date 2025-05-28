import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, LogOut, RefreshCw } from 'lucide-react'; // Removed FilePlus, UploadCloud, ChevronDown, ChevronUp, XCircle
import './mindmaptoolbar.css';

const MindMapToolbar = ({
  onAddNode,
  onEditNode,
  onDeleteNode,
  selectedNode,
  isRootSelected,
  onSave,
  // Removed onLoadMap, onNewMap, userMindMaps, currentMindMapId
  loading,
  message,
  onLogout,
  userName,
}) => {
  const isNodeSelected = selectedNode !== null;
  // Removed showLoadDropdown state
  // Removed loadDropdownRef ref

  // Removed useEffect for closing dropdown (no dropdown anymore)

  // Removed handleLoadMapClick (no load button)

  return (
    <div className="mindmap-toolbar-wrapper">
      <div className="mindmap-toolbar">
        {/* Map Actions Section (now only Save) */}
        <div className="toolbar-section map-actions">
          {/* Removed New Button */}
          <button onClick={onSave} className="btn btn-primary" disabled={loading} title="Save Current Mind Map">
            {loading ? <RefreshCw className="btn-icon spin" /> : <Save className="btn-icon" />} Save
          </button>
          {/* Removed Load Dropdown */}
        </div>

        {/* Node Actions Section */}
        <div className="toolbar-section node-actions">
          <button
            onClick={onAddNode}
            className="btn btn-add"
            disabled={!isNodeSelected && !isRootSelected}
            title="Add Child Node to Selected Idea"
          >
            <Plus className="btn-icon" /> Add Idea
          </button>
          <button
            onClick={onEditNode}
            className="btn btn-edit"
            disabled={!isNodeSelected}
            title="Edit Selected Idea's Content"
          >
            <Edit className="btn-icon" /> Edit Idea
          </button>
          <button
            onClick={onDeleteNode}
            className="btn btn-delete"
            disabled={!isNodeSelected || isRootSelected}
            title="Delete Selected Idea (Root cannot be deleted)"
          >
            <Trash2 className="btn-icon" /> Delete Idea
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="toolbar-section user-info">
          {userName && <span className="user-name" title={`Logged in as ${userName}`}>{userName}</span>}
          <button onClick={onLogout} className="btn btn-logout" title="Log out of your account">
            <LogOut className="btn-icon" /> Logout
          </button>
        </div>
      </div>
      {/* Message Area - KEEPING THIS FOR OTHER MESSAGES (e.g., save success/failure) 
          but we'll modify MindMap.jsx to prevent "Mind maps loaded!" message. */}
      {message && <div className={`toolbar-message ${loading ? 'loading' : ''}`}>{message}</div>}
    </div>
  );
};

export default MindMapToolbar;