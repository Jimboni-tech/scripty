// mindmap.jsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import MindMapCanvas from '../components/mindmapcanvas';
import MindMapToolbar from '../components/mindmaptoolbar';
import MindMapInstructions from '../components/mindmapinstructions';
import LargeTextEditor from '../components/mindmaptexteditor';
import MindMapTitleEditor from '../components/mindmaptitle';
import './mindmap.css';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001/api';

const MindMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([
    { id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }
  ]);
  const [connections, setConnections] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [isLargeEditorOpen, setIsLargeEditorOpen] = useState(false);
  const [largeEditorNodeId, setLargeEditorNodeId] = useState(null);
  const [largeEditorTitle, setLargeEditorTitle] = useState('');
  const [largeEditorText, setLargeEditorText] = useState('');

  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, startTranslateX: 0, startTranslateY: 0 });

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);

  const dragDataRef = useRef({ isDragging: false, offset: { x: 0, y: 0 } });
  const animationFrameRef = useRef(null);

  const colors = useMemo(() => [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899',
  ], []);

  // --- State for Backend Integration ---
  const [session, setSession] = useState(null);
  const [currentMindMapId, setCurrentMindMapId] = useState(null);
  const [currentMapTitle, setCurrentMapTitle] = useState('Untitled Map');
  const [userMindMaps, setUserMindMaps] = useState([]); // Still keeping this, just not used in toolbar
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Welcome! Login or register to start creating.');

  // --- Authentication & Session Management ---
  const handleLogout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('mindmapSession');
    setNodes([{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }]);
    setConnections([]);
    setTranslateX(0);
    setTranslateY(0);
    setCurrentMindMapId(null);
    setCurrentMapTitle('Untitled Map');
    setUserMindMaps([]);
    setMessage('You have been logged out.');
    navigate('/');
  }, [navigate]);

  const fetchUserMindMaps = useCallback(async (token) => {
    setLoading(true);
    // setMessage('Fetching your mind maps...'); // Can keep or remove this
    try {
      const response = await fetch(`${API_BASE_URL}/mindmaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired or unauthorized. Please log in again.');
          handleLogout();
          return;
        }
        throw new Error(`Error fetching mind maps: ${response.statusText}`);
      }

      const data = await response.json();
      setUserMindMaps(data);
      // Removed: setMessage('Your mind maps loaded!'); // <--- REMOVED THIS LINE
    } catch (error) {
      console.error('Fetch mind maps error:', error);
      setMessage(`Failed to fetch mind maps: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  const loadMindMapFromServer = useCallback(async (mapId) => {
    if (!session || !session.token) {
      setMessage('Please log in to load a mind map.');
      return;
    }
    setLoading(true);
    setMessage('Loading mind map...'); // Keeping this for feedback
    try {
      const response = await fetch(`${API_BASE_URL}/mindmaps/${mapId}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired or unauthorized. Please log in again.');
          handleLogout();
          return;
        }
        throw new Error(`Error loading mind map: ${response.statusText}`);
      }

      const data = await response.json();
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
      setTranslateX(data.viewState?.translateX || 0);
      setTranslateY(data.viewState?.translateY || 0);
      setCurrentMindMapId(data._id);
      setCurrentMapTitle(data.title);
      setMessage(`Mind map "${data.title}" loaded!`); // Keeping this, as it's specific to loading *a* map
    } catch (error) {
      console.error('Load mind map error:', error);
      setMessage(`Failed to load mind map: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [session, handleLogout]);

  const saveMindMapToServer = useCallback(async () => {
    if (!session || !session.token) {
      setMessage('Please log in to save your mind map.');
      return;
    }

    setLoading(true);
    setMessage('Saving mind map...');
    try {
      const mindMapData = {
        title: currentMapTitle,
        nodes,
        connections,
        viewState: { translateX, translateY },
      };

      let response;
      if (currentMindMapId) {
        response = await fetch(`${API_BASE_URL}/mindmaps/${currentMindMapId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
          },
          body: JSON.stringify(mindMapData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/mindmaps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
          },
          body: JSON.stringify(mindMapData),
        });
      }

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired or unauthorized. Please log in again to save.');
          handleLogout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save mind map');
      }

      const savedMap = await response.json();
      setCurrentMindMapId(savedMap._id);
      setCurrentMapTitle(savedMap.title);
      setMessage('Mind map saved successfully!');
      fetchUserMindMaps(session.token);
    } catch (error) {
      console.error('Save mind map error:', error);
      setMessage(`Error saving mind map: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [nodes, connections, translateX, translateY, currentMindMapId, currentMapTitle, session, fetchUserMindMaps, handleLogout]);

  const handleNewMap = useCallback(() => {
    setNodes([{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }]);
    setConnections([]);
    setTranslateX(0);
    setTranslateY(0);
    setCurrentMindMapId(null);
    setCurrentMapTitle('Untitled Map');
    // Removed: setMessage('Created a new, empty mind map.'); // <--- REMOVED THIS LINE
    navigate('/mindmap/new', { replace: true });
  }, [navigate]);

  const handleSetMapTitle = useCallback((newTitle) => {
    setCurrentMapTitle(newTitle);
  }, []);

  // On component mount, check session and load data
  useEffect(() => {
    const storedSession = localStorage.getItem('mindmapSession');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession && parsedSession.token && parsedSession.user) {
          setSession(parsedSession);
          fetchUserMindMaps(parsedSession.token);
        } else {
          localStorage.removeItem('mindmapSession');
          navigate('/');
        }
      } catch (e) {
        console.error("Failed to parse session from localStorage", e);
        localStorage.removeItem('mindmapSession');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate, fetchUserMindMaps]);

  // Load map based on ID after session is established
  useEffect(() => {
    if (!session) return;
    if (id && id !== 'new') {
      loadMindMapFromServer(id);
    } else if (id === 'new') {
      handleNewMap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  // --- Mouse Handlers for Node Dragging ---
  const handleMouseMove = useCallback((e) => {
    if (!dragDataRef.current.isDragging || !draggedNode) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newX = (e.clientX - rect.left - dragDataRef.current.offset.x - translateX);
      const newY = (e.clientY - rect.top - dragDataRef.current.offset.y - translateY);
      setNodes(prev => prev.map(node =>
        node.id === draggedNode
          ? { ...node, x: newX, y: newY }
          : node
      ));
    });
  }, [draggedNode, translateX, translateY]);

  const handleMouseDown = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedNode !== nodeId) {
      setSelectedNode(nodeId);
    }
    const currentCanvasWrapper = canvasWrapperRef.current;
    if (currentCanvasWrapper) {
      currentCanvasWrapper.classList.add('no-transition');
    }
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const nodeEl = e.currentTarget;
    if (!nodeEl) return;
    const nodeRect = nodeEl.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    dragDataRef.current = {
      isDragging: true,
      offset: {
        x: e.clientX - nodeRect.left,
        y: e.clientY - nodeRect.top
      }
    };
    setDraggedNode(nodeId);
  }, [nodes, selectedNode]);

  const handleMouseUp = useCallback(() => {
    dragDataRef.current.isDragging = false;
    setDraggedNode(null);
    setIsPanning(false);
    const currentCanvasWrapper = canvasWrapperRef.current;
    if (currentCanvasWrapper) {
      currentCanvasWrapper.classList.remove('no-transition');
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const handlePanMouseDown = useCallback((e) => {
    const isTargetNode = e.target.closest('.mindmap-node');
    const isTargetToolbar = e.target.closest('.mindmap-toolbar');
    const isTargetInstructions = e.target.closest('.mindmap-instructions');
    const isTargetLargeEditor = e.target.closest('.large-text-editor-overlay');
    const isTargetTitleEditor = e.target.closest('.mindmap-title-editor');
    if (isTargetNode || isTargetToolbar || isTargetInstructions || isTargetLargeEditor || isTargetTitleEditor || e.button !== 0) {
        return;
    }
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTranslateX: translateX,
      startTranslateY: translateY
    };
    const currentCanvasWrapper = canvasWrapperRef.current;
    if (currentCanvasWrapper) {
      currentCanvasWrapper.classList.add('no-transition');
    }
    setSelectedNode(null);
    e.preventDefault();
  }, [translateX, translateY]);

  const handlePanMouseMove = useCallback((e) => {
    if (!isPanning) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTranslateX(panStartRef.current.startTranslateX + dx);
      setTranslateY(panStartRef.current.startTranslateY + dy);
    });
  }, [isPanning]);

  useEffect(() => {
    const container = containerRef.current;
    const canvasWrapper = canvasWrapperRef.current; // Capture ref value
    if (!container) return;

    const handleGlobalMove = (e) => {
      if (draggedNode) {
        handleMouseMove(e);
      } else if (isPanning) {
        handlePanMouseMove(e);
      }
    };

    const handleGlobalUp = () => handleMouseUp();

    const handlePanDown = (e) => handlePanMouseDown(e);

    document.addEventListener('mouseup', handleGlobalUp);
    document.addEventListener('mouseleave', handleGlobalUp);
    container.addEventListener('mousemove', handleGlobalMove);
    container.addEventListener('mousedown', handlePanDown);

    return () => {
      document.removeEventListener('mouseup', handleGlobalUp);
      document.removeEventListener('mouseleave', handleGlobalUp);
      container.removeEventListener('mousemove', handleGlobalMove);
      container.removeEventListener('mousedown', handlePanDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (canvasWrapper) { // Use captured ref value here
        canvasWrapper.classList.remove('no-transition');
      }
    };
  }, [handleMouseMove, handleMouseUp, handlePanMouseDown, handlePanMouseMove, draggedNode, isPanning]);

  const closeLargeEditor = useCallback(() => {
    setIsLargeEditorOpen(false);
    setLargeEditorNodeId(null);
    setLargeEditorTitle('');
    setLargeEditorText('');
  }, []);

  const saveLargeEditorText = useCallback((newTitle, newText) => {
    if (!largeEditorNodeId) return;
    setNodes(prev =>
      prev.map(node => (
        node.id === largeEditorNodeId
          ? { ...node, title: newTitle.trim() || 'New Idea', text: newText.trim() || '' }
          : node
      ))
    );
    // If the node edited was the root node, update the map title here
    const editedNode = nodes.find(n => n.id === largeEditorNodeId);
    if (editedNode && editedNode.isRoot) {
        setCurrentMapTitle(newTitle.trim() || 'Untitled Map');
    }
    closeLargeEditor();
  }, [largeEditorNodeId, closeLargeEditor, nodes]);

  const openLargeEditor = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setIsLargeEditorOpen(true);
      setLargeEditorNodeId(nodeId);
      setLargeEditorTitle(node.title || '');
      setLargeEditorText(node.text || '');
    }
  }, [nodes]);

  const addNode = useCallback(() => {
    const parent = selectedNode ? nodes.find(n => n.id === selectedNode) : nodes.find(n => n.isRoot);
    if (!parent) {
      setMessage('Cannot add node: No root node found or selected node does not exist.');
      return;
    }
    const angle = Math.random() * 2 * Math.PI;
    const distance = 150;
    const newNode = {
      id: Date.now().toString(),
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      title: 'New Idea',
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, { from: parent.id, to: newNode.id }]);
    setSelectedNode(newNode.id);
    openLargeEditor(newNode.id);
  }, [nodes, colors, selectedNode, openLargeEditor]);

  const deleteNode = useCallback(() => {
    const nodeToDelete = nodes.find(n => n.id === selectedNode);
    if (!nodeToDelete || nodeToDelete.isRoot) {
      setMessage('Cannot delete root node or no node selected.');
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setConnections(prev => prev.filter(c => c.from !== selectedNode && c.to !== selectedNode));
    setSelectedNode(null);
  }, [nodes, selectedNode]);

  const isRootSelected = selectedNode ? nodes.find(n => n.id === selectedNode)?.isRoot : false;

  // If no session, navigate to login. ProtectedRoute should handle this, but as a fallback.
  if (!session) {
    return null;
  }

  return (
    <div className="mindmap-container" ref={containerRef}>
      <MindMapToolbar
        onAddNode={addNode}
        onEditNode={() => selectedNode && openLargeEditor(selectedNode)}
        onDeleteNode={deleteNode}
        selectedNode={selectedNode}
        isRootSelected={isRootSelected}
        onSave={saveMindMapToServer}
        // Removed onLoadMap and onNewMap props
        // Removed userMindMaps and currentMindMapId props
        loading={loading}
        message={message}
        onLogout={handleLogout}
        userName={session?.user?.email || 'User'}
      />

      {/* New Title Editor Component */}
      <MindMapTitleEditor
        title={currentMapTitle}
        onTitleChange={handleSetMapTitle}
      />

      <MindMapInstructions />

      <MindMapCanvas
        nodes={nodes}
        connections={connections}
        draggedNode={draggedNode}
        selectedNode={selectedNode}
        translateX={translateX}
        translateY={translateY}
        handleMouseDown={handleMouseDown}
        openNodeEditor={openLargeEditor}
        canvasWrapperRef={canvasWrapperRef}
        svgRef={svgRef}
      />

      {isLargeEditorOpen && (
        <LargeTextEditor
          isOpen={isLargeEditorOpen}
          initialTitle={largeEditorTitle}
          initialText={largeEditorText}
          onSave={saveLargeEditorText}
          onCancel={closeLargeEditor}
        />
      )}
    </div>
  );
};

export default MindMap;