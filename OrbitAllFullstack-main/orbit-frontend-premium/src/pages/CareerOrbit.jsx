import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Target, Zap, ChevronRight, Info, AlertCircle, X } from 'lucide-react';
import Layout from '../components/Layout';
import API_CONFIG from '../utils/api';

// --- Starfield Background Component ---
const Starfield = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        initial={{ 
          x: Math.random() * 2000, 
          y: Math.random() * 1000, 
          opacity: Math.random() 
        }}
        animate={{ 
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1]
        }}
        transition={{ 
          duration: 3 + Math.random() * 5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    ))}
  </div>
);

// --- Custom Celestial Node Component ---
const CelestialNode = ({ data, selected }) => {
  const isRoot = data.type === 'root';
  const isNeighbor = data.type === 'neighbor';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`
        px-6 py-5 rounded-2xl border transition-all duration-500 min-w-[200px] group
        ${selected ? 'border-secondary ring-4 ring-secondary/20 shadow-glow-intense' : 'border-outline-variant hover:border-primary/50 hover:shadow-glow-intense'}
        ${isRoot ? 'bg-primary-container/80' : 'bg-surface-container/60'}
        backdrop-blur-2xl
      `}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-secondary border-2 border-background" />
      
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-transform group-hover:rotate-12 ${isRoot ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'bg-secondary/10 text-secondary'}`}>
          {isRoot ? <Rocket size={20} /> : <Target size={20} />}
        </div>
        <div>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant/60 mb-1">
            {isRoot ? 'Origin' : isNeighbor ? 'Next Orbit' : 'Aspiration'}
          </p>
          <h3 className="text-base font-headline font-bold text-on-surface leading-tight">
            {data.label}
          </h3>
        </div>
      </div>
      
      {data.gapSkills?.length > 0 && (
        <div className="mt-4 flex gap-1.5 flex-wrap">
          {data.gapSkills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-secondary-container/10 text-secondary rounded-full border border-secondary/20">
              {skill}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-primary border-2 border-background" />
    </motion.div>
  );
};

const nodeTypes = { celestial: CelestialNode };

const CareerOrbit = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.RESUME_CAREER_TREE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('RESUME_MISSING');
          return;
        }
        throw new Error(data.message || 'Failed to fetch career orbit');
      }
      
      const { treeData } = data;

      // Transform treeData into React Flow format if not already
      // Backend should return { nodes: [...], edges: [...] }
      const formattedNodes = treeData.nodes.map((node, i) => {
        let x = 0;
        let y = i * 150;
        
        if (node.type === 'root') { x = 0; y = 300; }
        else if (node.type === 'neighbor') { x = 400; y = (i - 1) * 200; }
        else { x = 800; y = (i - 4) * 250; }

        return {
          ...node,
          type: 'celestial',
          position: node.position || { x, y },
          data: { ...node }
        };
      });

      setNodes(formattedNodes);
      setEdges(treeData.edges.map(e => ({ 
        ...e, 
        markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' },
        style: { strokeWidth: 2, stroke: 'rgba(124, 58, 237, 0.4)' }
      })));

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const onNodeClick = (_, node) => setSelectedNode(node.data);

  const handleTargetOrbit = async () => {
    if (!selectedNode) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.RESUME_SET_TARGET_ROLE, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetRole: selectedNode.label })
      });
      
      if (!response.ok) throw new Error('Failed to update trajectory');
      
      // Success: Redirect to roadmap to see the new path
      window.location.href = '/roadmap';
    } catch (err) {
      console.error(err);
      setError('Failed to adjust your orbit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#050814] relative overflow-hidden flex flex-col min-h-[calc(100vh-100px)]">
      <Starfield />
      
      {/* Header Overlay */}
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="bg-[#5ffbd6]/20 p-2 rounded-lg text-[#5ffbd6]">
            <Sparkles size={22} />
          </div>
          <span className="text-[#5ffbd6] font-bold tracking-[0.4em] text-[10px] uppercase">Orbit.AI Neural Network</span>
        </motion.div>
        <h1 className="text-5xl font-headline font-black text-white leading-tight tracking-tighter">
          Career <span className="text-[#5ffbd6] italic">Orbit</span>
        </h1>
        <p className="text-[#8a96c0] max-w-sm text-sm mt-3 leading-relaxed opacity-80">
          Interactive multi-versal path mapping. Explore potential trajectories and bridge skill gaps.
        </p>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="font-headline font-bold text-on-surface">Calculating Trajectories...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {error === 'RESUME_MISSING' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container border border-outline p-12 rounded-3xl text-center max-w-lg shadow-soft"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="text-primary" size={40} />
              </div>
              <h2 className="text-3xl font-headline font-black text-on-surface mb-4">Zero Gravity Detected</h2>
              <p className="text-on-surface-variant mb-10 leading-relaxed text-lg">
                We need your resume coordinates to map your career orbit. Upload your resume first to see your future trajectories.
              </p>
              <button 
                onClick={() => window.location.href = '/resume-analyzer'} 
                className="px-10 py-4 bg-primary text-white rounded-xl2 font-bold shadow-glow hover:scale-105 transition-all flex items-center gap-3 mx-auto"
              >
                <Rocket size={20} /> Launch Resume Analyzer
              </button>
            </motion.div>
          ) : (
            <div className="bg-error-container/20 border border-error/50 p-8 rounded-xl2 text-center max-w-md backdrop-blur-md">
              <AlertCircle className="mx-auto mb-4 text-error" size={48} />
              <h2 className="text-xl font-bold text-on-surface mb-2">Navigation Error</h2>
              <p className="text-on-surface-variant mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-lg font-bold">
                Retry Jump
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Graph View */}
      <div className="absolute inset-0 z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-transparent"
          minZoom={0.1}
        >
          <Background color="rgba(255,255,255,0.03)" gap={25} />
          <Controls className="!bg-surface-container !border-outline !fill-primary" />
        </ReactFlow>
      </div>

      {/* Side Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 h-full w-[380px] z-30 bg-surface-container/60 backdrop-blur-2xl border-l border-outline p-10 flex flex-col shadow-soft"
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`p-3 rounded-xl2 ${selectedNode.type === 'root' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                {selectedNode.type === 'root' ? <Rocket size={28} /> : <Target size={28} />}
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Close
              </button>
            </div>

            <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">
              {selectedNode.label}
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              {selectedNode.description || 'Analyze your path to this role. Our AI has identified strategic skill gaps to bridge.'}
            </p>

            {selectedNode.gapSkills?.length > 0 && (
              <div className="mb-10">
                <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                  <Zap size={14} /> Critical Skill Gaps
                </h4>
                <div className="space-y-3">
                  {selectedNode.gapSkills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface/40 rounded-lg border border-outline-variant">
                      <span className="text-on-surface font-medium">{skill}</span>
                      <ChevronRight size={14} className="text-on-surface-variant" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-4">
              <button className="w-full py-4 bg-primary text-white rounded-xl2 font-bold shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                <Info size={18} /> Deep Logic Analysis
              </button>
              {selectedNode.type !== 'root' && (
                <button 
                  onClick={handleTargetOrbit}
                  className="w-full py-4 border border-secondary text-secondary rounded-xl2 font-bold hover:bg-secondary/10 transition-colors"
                >
                  Target This Orbit
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerOrbit;
