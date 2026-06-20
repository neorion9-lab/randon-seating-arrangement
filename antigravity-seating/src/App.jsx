import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from './hooks/useAudio';
import { generateSeatingLayout } from './utils/seatingAlgorithm';
import { exportSeatingToCSV } from './utils/excelHelper';

// Components
import ControlPanel from './components/ControlPanel';
import ClassroomGrid from './components/ClassroomGrid';
import LayoutEditor from './components/LayoutEditor';
import StudentManager from './components/StudentManager';
import RelationManager from './components/RelationManager';
import AuditLog from './components/AuditLog';

// 24 default mock students for instant demonstration
const MOCK_STUDENTS = [
  { id: 's1', name: '김민준', gender: '남', status: 'normal' },
  { id: 's2', name: '이서연', gender: '여', status: 'normal' },
  { id: 's3', name: '박예준', gender: '남', status: 'normal' },
  { id: 's4', name: '최서윤', gender: '여', status: 'normal' },
  { id: 's5', name: '정지우', gender: '여', status: 'normal' },
  { id: 's6', name: '강서현', gender: '여', status: 'normal' },
  { id: 's7', name: '조하준', gender: '남', status: 'normal' },
  { id: 's8', name: '윤하윤', gender: '여', status: 'normal' },
  { id: 's9', name: '장도윤', gender: '남', status: 'normal' },
  { id: 's10', name: '임민서', gender: '여', status: 'normal' },
  { id: 's11', name: '한현우', gender: '남', status: 'normal' },
  { id: 's12', name: '오지유', gender: '여', status: 'normal' },
  { id: 's13', name: '서건우', gender: '남', status: 'normal' },
  { id: 's14', name: '신지원', gender: '여', status: 'normal' },
  { id: 's15', name: '권우진', gender: '남', status: 'normal' },
  { id: 's16', name: '황수아', gender: '여', status: 'normal' },
  { id: 's17', name: '안선우', gender: '남', status: 'normal' },
  { id: 's18', name: '송지아', gender: '여', status: 'normal' },
  { id: 's19', name: '전준우', gender: '남', status: 'normal' },
  { id: 's20', name: '홍윤아', gender: '여', status: 'normal' },
  { id: 's21', name: '양유준', gender: '남', status: 'normal' },
  { id: 's22', name: '손민서', gender: '여', status: 'normal' },
  { id: 's23', name: '고민재', gender: '남', status: 'normal' },
  { id: 's24', name: '문지민', gender: '여', status: 'normal' }
];

// Initialize default layout (6x6 grid with seats and side aisles)
const createDefaultLayout = (rows, cols) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // Create empty aisles at columns index 2 (between desks)
      const type = c === 2 || c === 5 ? 'aisle' : 'seat';
      row.push({
        row: r,
        col: c,
        type: type,
        lockedStudentId: null
      });
    }
    grid.push(row);
  }
  return grid;
};

export default function App() {
  const audio = useAudio();
  
  // App Views and status
  const [currentView, setCurrentView] = useState('seating');
  const [isShuffling, setIsShuffling] = useState(false);

  // Core App states
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('antigravity_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  const [layoutGrid, setLayoutGrid] = useState(() => {
    const saved = localStorage.getItem('antigravity_layout');
    return saved ? JSON.parse(saved) : createDefaultLayout(5, 6);
  });

  const [chalkboardPos, setChalkboardPos] = useState(() => {
    return localStorage.getItem('antigravity_chalkboard_pos') || 'top';
  });

  const [relationships, setRelationships] = useState(() => {
    const saved = localStorage.getItem('antigravity_relationships');
    return saved ? JSON.parse(saved) : [];
  });

  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem('antigravity_grid');
    // Default empty seat assignment mapping
    return saved ? JSON.parse(saved) : Array(5).fill(null).map(() => Array(6).fill(null));
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('antigravity_history');
    return saved ? JSON.parse(saved) : []; // Array of previous adjacency pairs
  });

  // Algorithm Audit States
  const [auditLogs, setAuditLogs] = useState([]);
  const [violations, setViolations] = useState([]);
  const [timestamp, setTimestamp] = useState('');
  const [options, setOptions] = useState({ balanceGender: true, avoidPrevious: true });

  const canvasRef = useRef(null);

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('antigravity_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('antigravity_layout', JSON.stringify(layoutGrid));
  }, [layoutGrid]);

  useEffect(() => {
    localStorage.setItem('antigravity_chalkboard_pos', chalkboardPos);
  }, [chalkboardPos]);

  useEffect(() => {
    localStorage.setItem('antigravity_relationships', JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    localStorage.setItem('antigravity_grid', JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    localStorage.setItem('antigravity_history', JSON.stringify(history));
  }, [history]);

  // Adjust layout rows
  const handleRowsChange = (newRows) => {
    setRows(newRows);
    const newLayout = createDefaultLayout(newRows, cols);
    setLayoutGrid(newLayout);
    setGrid(Array(newRows).fill(null).map(() => Array(cols).fill(null)));
  };

  // Adjust layout cols
  const handleColsChange = (newCols) => {
    setCols(newCols);
    const newLayout = createDefaultLayout(rows, newCols);
    setLayoutGrid(newLayout);
    setGrid(Array(rows).fill(null).map(() => Array(newCols).fill(null)));
  };

  // Update layout cell grid directly
  const handleLayoutChange = (newLayoutGrid) => {
    setLayoutGrid(newLayoutGrid);
  };

  // Drag and Drop Swapping Logic
  const handleSwapStudents = ({ sourceId, sourceSource, sourceR, sourceC, targetStudentId, targetR, targetC }) => {
    const newGrid = grid.map(row => [...row]);

    // Scenario 1: Dragged from layout grid, dropped on another seat in layout grid
    if (sourceSource === 'grid') {
      if (targetR !== null && targetC !== null) {
        // Swap values in grid cells
        newGrid[sourceR][sourceC] = targetStudentId; // which could be null or another studentId
        newGrid[targetR][targetC] = sourceId;
      } else {
        // Dropped back into waiting room (remove from grid)
        newGrid[sourceR][sourceC] = null;
      }
    }
    // Scenario 2: Dragged from waiting room, dropped on a seat in layout grid
    else if (sourceSource === 'waiting') {
      if (targetR !== null && targetC !== null) {
        // If there was a student already on target seat, we don't need to put them in source cell
        // (waiting room doesn't have grid cells, it just lists unseated).
        newGrid[targetR][targetC] = sourceId;
      }
    }

    setGrid(newGrid);
  };

  // Toggle seat locking
  const handleToggleSeatLock = (r, c) => {
    const studentId = grid[r][c];
    if (!studentId) return; // No student seated to lock

    const cell = layoutGrid[r][c];
    const isLocked = cell.lockedStudentId === studentId;

    const newLayoutGrid = layoutGrid.map((rowArr, ri) =>
      rowArr.map((item, ci) => {
        if (ri === r && ci === c) {
          return {
            ...item,
            lockedStudentId: isLocked ? null : studentId
          };
        }
        return item;
      })
    );

    audio.playLockSound();
    setLayoutGrid(newLayoutGrid);
  };

  // Seating Arrangement Solver Trigger (Shuffle)
  const handleShuffle = () => {
    if (isShuffling) return;

    audio.initAudio();
    setIsShuffling(true);
    setCurrentView('seating'); // Always switch to seating view to observe animation

    let tickCount = 0;
    const maxTicks = 25; // 2.5 seconds total
    
    // Play tick sounds at intervals
    const interval = setInterval(() => {
      tickCount++;
      audio.playShuffleTick(1 + (tickCount / maxTicks) * 0.5); // sliding frequency pitch increases
      
      if (tickCount >= maxTicks) {
        clearInterval(interval);
        
        // Execute the optimized seating algorithm
        const result = generateSeatingLayout({
          students,
          layoutGrid,
          relationships,
          previousPairs: history,
          options
        });

        // Set state results
        setGrid(result.grid);
        setAuditLogs(result.auditLogs);
        setViolations(result.violations);
        setTimestamp(result.timestamp);

        // Store new seating adjacency pairs into previous history
        if (result.grid.length > 0) {
          const newPairs = [];
          const rowsCount = result.grid.length;
          const colsCount = result.grid[0].length;
          
          for (let r = 0; r < rowsCount; r++) {
            for (let c = 0; c < colsCount - 1; c++) {
              const id1 = result.grid[r][c];
              const id2 = result.grid[r][c + 1];
              const c1 = layoutGrid[r][c];
              const c2 = layoutGrid[r][c + 1];
              
              if (id1 && id2 && c1.type === 'seat' && c2.type === 'seat') {
                newPairs.push([id1, id2]);
              }
            }
          }
          setHistory(newPairs);
        }

        setIsShuffling(false);
        audio.playLockSound();
        
        // Play success fanfare after a short delay
        setTimeout(() => {
          audio.playFanfare();
        }, 300);
      }
    }, 100);
  };

  // Export Results
  const handleExportSeating = () => {
    exportSeatingToCSV(grid, students, layoutGrid, auditLogs, '우리반_자리배치결과.csv');
  };

  // Clean previous partners history
  const handleResetHistory = () => {
    setHistory([]);
    alert("지난 배치 이력이 초기화되었습니다.");
  };

  // Calculate unseated students list
  const activeStudents = students.filter(s => s.status !== 'absent');
  const placedStudentIds = new Set();
  
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) placedStudentIds.add(grid[r][c]);
    }
  }
  const unseatedStudents = activeStudents.filter(s => !placedStudentIds.has(s.id));

  // Count available seats in layout
  let seatsCount = 0;
  for (let r = 0; r < layoutGrid.length; r++) {
    for (let c = 0; c < layoutGrid[r].length; c++) {
      if (layoutGrid[r][c].type === 'seat') seatsCount++;
    }
  }

  // Starfield 3D Canvas Warp Effect Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-adjust size on window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 150 stars
    const numStars = 150;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        color: `hsl(${200 + Math.random() * 60}, 100%, ${70 + Math.random() * 30}%)` // nice blue/purple colors
      });
    }

    const animate = () => {
      // Semi-transparent overlay creates trails
      ctx.fillStyle = 'rgba(11, 12, 22, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Speed multiplier zooms stars forward when shuffling
      const speed = isShuffling ? 25 : 1.2;

      stars.forEach(star => {
        star.z -= speed;
        
        // Wrap stars around when close
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        // Project coordinate math
        const px = (star.x / star.z) * width + centerX;
        const py = (star.y / star.z) * height + centerY;
        
        // Star size gets larger as it gets closer
        const size = ((width - star.z) / width) * 2.5 + 0.2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.shadowBlur = isShuffling ? 10 : 0;
          ctx.shadowColor = star.color;
          ctx.fill();
        }
      });

      // Draw faint grid line background for futuristic layout editor look
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isShuffling]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      {/* 3D Starfield Warp Speed Canvas */}
      <canvas ref={canvasRef} className="starfield-canvas" />

      {/* Main App Container */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Upper Dashboard Controls */}
        <ControlPanel
          currentView={currentView}
          onChangeView={setCurrentView}
          onShuffle={handleShuffle}
          onExportExcel={handleExportSeating}
          onResetHistory={handleResetHistory}
          isShuffling={isShuffling}
          ambientPlaying={audio.ambientPlaying}
          onToggleAmbient={audio.toggleAmbientHum}
          studentsCount={students.length}
          seatsCount={seatsCount}
          playClick={audio.playClick}
          playHover={audio.playHover}
        />

        {/* Dynamic Inner Panel Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 3.2fr) minmax(300px, 2fr)',
          gap: '24px',
          alignItems: 'start'
        }} className="responsive-container">
          
          {/* Left Main interactive view */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {currentView === 'seating' && (
              <ClassroomGrid
                grid={grid}
                layoutGrid={layoutGrid}
                students={students}
                chalkboardPos={chalkboardPos}
                isShuffling={isShuffling}
                unseatedStudents={unseatedStudents}
                onSwapStudents={handleSwapStudents}
                onToggleSeatLock={handleToggleSeatLock}
                playClick={audio.playClick}
                playHover={audio.playHover}
              />
            )}

            {currentView === 'layout' && (
              <LayoutEditor
                rows={rows}
                cols={cols}
                layoutGrid={layoutGrid}
                chalkboardPos={chalkboardPos}
                onChangeRows={handleRowsChange}
                onChangeCols={handleColsChange}
                onChangeLayout={handleLayoutChange}
                onChangeChalkboardPos={setChalkboardPos}
                playClick={audio.playClick}
                playHover={audio.playHover}
              />
            )}

            {currentView === 'students' && (
              <StudentManager
                students={students}
                onUpdateStudents={setStudents}
                playClick={audio.playClick}
                playHover={audio.playHover}
              />
            )}

            {currentView === 'relations' && (
              <RelationManager
                students={students}
                relationships={relationships}
                onUpdateRelationships={setRelationships}
                playClick={audio.playClick}
                playHover={audio.playHover}
              />
            )}
          </div>

          {/* Right Static Audit Log Panel */}
          <div>
            <AuditLog
              auditLogs={auditLogs}
              violations={violations}
              timestamp={timestamp}
              options={options}
              onUpdateOptions={setOptions}
              playClick={audio.playClick}
              playHover={audio.playHover}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
