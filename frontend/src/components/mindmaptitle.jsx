// src/components/MindMapTitleEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import './mindmaptitle.css'; // We'll create this CSS next

const MindMapTitleEditor = ({ title, onTitleChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const inputRef = useRef(null);

  // Update editableTitle when the 'title' prop changes (e.g., map load)
  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleChange = (e) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    const trimmedTitle = editableTitle.trim();
    // If title is empty or default, revert to original prop or a generic title
    if (trimmedTitle === '' || trimmedTitle === 'Untitled Map') {
      onTitleChange(title || 'Untitled Map'); // Revert to original or default if empty
    } else {
      onTitleChange(trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditableTitle(title); // Revert to original title on escape
      setIsEditing(false);
      e.preventDefault();
    }
  };

  return (
    <div className="mindmap-title-editor">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editableTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="title-input"
          aria-label="Edit map title"
        />
      ) : (
        <h1 className="title-display" onClick={() => setIsEditing(true)} title="Click to edit map title">
          {title || "Untitled Map"}
        </h1>
      )}
    </div>
  );
};

export default MindMapTitleEditor;