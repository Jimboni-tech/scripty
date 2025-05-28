import React, { useState, useEffect, useRef } from 'react';
import './mindmaptexteditor.css';

const LargeTextEditor = ({ isOpen, initialTitle, initialText, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  const editorRef = useRef(null);


  useEffect(() => {
    setTitle(initialTitle);
    setText(initialText);
  }, [initialTitle, initialText]);

  useEffect(() => {

    if (isOpen && editorRef.current) {
      editorRef.current.querySelector('input[name="nodeTitle"]').focus();
    }
  }, [isOpen]); 

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(title, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="large-text-editor-overlay">
      <div className="large-text-editor-content" ref={editorRef}>
        <div className="editor-header">
          <h3>Edit Node Content</h3>
        </div>
        <div className="editor-body">
          <label htmlFor="nodeTitle">Title:</label>
          <input
            id="nodeTitle"
            name="nodeTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter node title"
            className="editor-title-input"
            onKeyDown={handleKeyDown}
          />
          <label htmlFor="nodeText">Details:</label>
          <textarea
            id="nodeText"
            name="nodeText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add detailed notes here..."
            className="editor-text-area"
            onKeyDown={handleKeyDown}
          ></textarea>
        </div>
        <div className="editor-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={onCancel} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LargeTextEditor;