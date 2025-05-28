import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import MindMapCanvas from '../components/mindmapcanvas';
import MindMapToolbar from '../components/mindmaptoolbar';
import MindMapInstructions from '../components/mindmapinstructions';
import LargeTextEditor from '../components/mindmaptexteditor';
import Auth from '../components/Auth';

import './mindmap.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY is missing in frontend .env file.');
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
if (!API_BASE_URL) {
  console.error('REACT_APP_BACKEND_API_URL is not defined in frontend .env file. API calls will fail.');
}

const MindMap = () => {
  const [nodes, setNodes] = useState([
    { id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }
  ]);
  const [connections, setConnections] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [isLargeEditorOpen, setIsLargeEditorOpen] = useState(false);
  const [largeEditorNodeId, setLargeEditorNodeId] = useState(null);
  const [largeEditorTitle, setLargeEditorTitle] = useState('');
  const [largeEditorText, setLargeEditorText] = '';

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
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#3B82F6',
    '#A855F7',
    '#EC4899',
  ], []);

  const [session, setSession] = useState(null);
  const [mindmapId, setMindmapId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  const saveMindMap = useCallback(async () => {
    if (!session || !session.access_token) {
      setMessage('You must be logged in to save your mind map. Please log in.');
      return;
    }
    if (loading) {
        setMessage('Save in progress...');
        return;
    }

    setLoading(true);
    setMessage('Saving mind map...');

    const mindMapData = {
      mindmapId,
      name: 'My Awesome Mind Map',
      nodes_data: nodes,
      connections_data: connections,
      translate_x: translateX,
      translate_y: translateY,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(mindMapData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response during save:', parseError);
          setMessage(`Error saving mind map: Server responded with status ${response.status} but no valid JSON error message.`);
          return;
        }
        const errorMessage = errorData.message || errorData.error || `Unknown error (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setMindmapId(result.data.id);
      setMessage('Mind map saved successfully!');
      console.log('Mind map saved:', result.data);

    } catch (error) {
      setMessage(`Error saving mind map: ${error.message}.`);
      console.error('Error saving mind map:', error);
    } finally {
      setLoading(false);
    }
  }, [session, nodes, connections, translateX, translateY, mindmapId, loading]);

  const loadMindMap = useCallback(async () => {
    if (!session || !session.access_token) {
      setMessage('Please log in to load your mind map.');
      setNodes([{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }]);
      setConnections([]);
      setTranslateX(0);
      setTranslateY(0);
      setMindmapId(null);
      return;
    }
    if (loading) {
        setMessage('Load in progress...');
        return;
    }

    setLoading(true);
    setMessage('Loading mind map...');

    try {
      const response = await fetch(`${API_BASE_URL}/mindmaps`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setMessage('No mind map found for this user. You can start creating one now!');
          setNodes([{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }]);
          setConnections([]);
          setTranslateX(0);
          setTranslateY(0);
          setMindmapId(null);
          return;
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response during load:', parseError);
          setMessage(`Error loading mind map: Server responded with status ${response.status} but no valid JSON error message.`);
          return;
        }
        const errorMessage = errorData.message || errorData.error || `Unknown error (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const loadedMap = result.data;
      setNodes(loadedMap.nodes_data);
      setConnections(loadedMap.connections_data);
      setTranslateX(loadedMap.translate_x);
      setTranslateY(loadedMap.translate_y);
      setMindmapId(loadedMap.id);
      setMessage('Mind map loaded successfully!');
      console.log('Mind map loaded:', loadedMap);

    } catch (error) {
      setMessage(`Error loading mind map: ${error.message}. Please try again or re-authenticate.`);
      console.error('Error loading mind map:', error);
    } finally {
      setLoading(false);
    }
  }, [session, loading]);

  useEffect(() => {
    const handleAuthEvent = async (event, currentSession) => {
      console.log('Auth Event:', event, 'Session:', currentSession);
      setSession(currentSession);

      if (currentSession) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || !initialLoadAttempted) {
          setMessage('Logged in. Loading your mind map...');
          await loadMindMap();
          setInitialLoadAttempted(true);
        } else {
            setMessage('You are logged in.');
        }
      } else {
        setMessage('Logged out. Please log in or sign up.');
        setNodes([{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }]);
        setConnections([]);
        setTranslateX(0);
        setTranslateY(0);
        setMindmapId(null);
        setInitialLoadAttempted(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthEvent('INITIAL_LOAD', initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthEvent);

    return () => subscription.unsubscribe();
  }, [loadMindMap, initialLoadAttempted]);

  const handleAuthSuccess = useCallback(async (newSession) => {
    setMessage('Authentication successful. Loading your mind map...');
    setSession(newSession);
    await loadMindMap();
    setInitialLoadAttempted(true);
  }, [loadMindMap]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setMessage('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage('Logged out successfully.');
    } catch (error) {
      setMessage(`Logout error: ${error.message}`);
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (isTargetNode || isTargetToolbar || isTargetInstructions || isTargetLargeEditor || e.button !== 0) {
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
      const currentCanvasWrapper = canvasWrapperRef.current;
      if (currentCanvasWrapper) {
        currentCanvasWrapper.classList.remove('no-transition');
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
    closeLargeEditor();
  }, [largeEditorNodeId, closeLargeEditor]);

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

  if (!session) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="mindmap-container" ref={containerRef}>
      <MindMapToolbar
        onAddNode={addNode}
        onEditNode={() => selectedNode && openLargeEditor(selectedNode)}
        onDeleteNode={deleteNode}
        selectedNode={selectedNode}
        isRootSelected={isRootSelected}
        onSave={saveMindMap}
        onLoad={loadMindMap}
        loading={loading}
        message={message}
        onLogout={handleLogout}
        userName={session?.user?.email || 'User'}
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