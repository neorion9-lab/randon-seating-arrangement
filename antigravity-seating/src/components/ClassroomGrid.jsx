import React, { useState } from 'react';

export default function ClassroomGrid({
  grid,
  layoutGrid,
  students,
  chalkboardPos,
  isShuffling,
  unseatedStudents,
  onSwapStudents,
  onToggleSeatLock,
  playClick,
  playHover
}) {
  const [draggedInfo, setDraggedInfo] = useState(null); // { id, source: 'grid'|'waiting', r, c }

  // Drag and Drop handlers
  const handleDragStart = (e, id, source, r = null, c = null) => {
    if (isShuffling) {
      e.preventDefault();
      return;
    }
    playClick();
    setDraggedInfo({ id, source, r, c });
    
    // Set a ghost image or effect
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStudentId, targetR, targetC) => {
    e.preventDefault();
    if (!draggedInfo || isShuffling) return;

    playClick();
    const sourceId = draggedInfo.id;
    const sourceSource = draggedInfo.source;
    const sourceR = draggedInfo.r;
    const sourceC = draggedInfo.c;

    onSwapStudents({
      sourceId,
      sourceSource,
      sourceR,
      sourceC,
      targetStudentId,
      targetR,
      targetC
    });

    setDraggedInfo(null);
  };

  const handleDragEnd = () => {
    setDraggedInfo(null);
  };

  // Find student info by ID
  const getStudent = (id) => {
    return students.find(s => s.id === id);
  };

  // Toggle seat lock
  const handleLockClick = (e, r, c) => {
    e.stopPropagation();
    if (isShuffling) return;
    onToggleSeatLock(r, c);
  };

  // Grid styling based on chalkboard position
  const getChalkboardStyle = () => {
    switch (chalkboardPos) {
      case 'left':
        return { gridArea: 'chalkboard', minWidth: '40px', minHeight: '100%', flexDirection: 'column' };
      case 'right':
        return { gridArea: 'chalkboard', minWidth: '40px', minHeight: '100%', flexDirection: 'column' };
      case 'bottom':
        return { gridArea: 'chalkboard', minWidth: '100%', minHeight: '40px', flexDirection: 'row' };
      case 'top':
      default:
        return { gridArea: 'chalkboard', minWidth: '100%', minHeight: '40px', flexDirection: 'row' };
    }
  };

  const getContainerLayout = () => {
    switch (chalkboardPos) {
      case 'left':
        return {
          display: 'grid',
          gridTemplateAreas: '"chalkboard classroom"',
          gridTemplateColumns: '80px 1fr',
          gap: '24px'
        };
      case 'right':
        return {
          display: 'grid',
          gridTemplateAreas: '"classroom chalkboard"',
          gridTemplateColumns: '1fr 80px',
          gap: '24px'
        };
      case 'bottom':
        return {
          display: 'grid',
          gridTemplateAreas: '"classroom" "chalkboard"',
          gridTemplateRows: '1fr 60px',
          gap: '24px'
        };
      case 'top':
      default:
        return {
          display: 'grid',
          gridTemplateAreas: '"chalkboard" "classroom"',
          gridTemplateRows: '60px 1fr',
          gap: '24px'
        };
    }
  };

  // Render a cell based on layout type
  const renderCellContent = (r, c) => {
    const cellLayout = layoutGrid[r][c];
    const studentId = grid[r][c];
    const student = studentId ? getStudent(studentId) : null;
    const isLocked = !!cellLayout.lockedStudentId;

    if (cellLayout.type === 'aisle') {
      return <div style={{ width: '100%', height: '100%' }} />;
    }

    if (cellLayout.type === 'locker') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 0, 127, 0.05)',
          border: '1.5px dashed var(--neon-pink)',
          borderRadius: '8px',
          color: 'var(--neon-pink)',
          fontSize: '0.8rem'
        }}>
          <span>🗄️ 사물함</span>
        </div>
      );
    }

    if (cellLayout.type === 'tv') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(157, 0, 255, 0.05)',
          border: '1.5px dashed var(--neon-purple)',
          borderRadius: '8px',
          color: 'var(--neon-purple)',
          fontSize: '0.8rem'
        }}>
          <span>📺 TV</span>
        </div>
      );
    }

    if (cellLayout.type === 'window') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 215, 0, 0.05)',
          border: '1.5px dashed var(--neon-gold)',
          borderRadius: '8px',
          color: 'var(--neon-gold)',
          fontSize: '0.8rem'
        }}>
          <span>🪟 창문</span>
        </div>
      );
    }

    // Seating cell
    // Random offsets for each card during shuffling animation to look floating
    const randomAnimStyles = isShuffling ? {
      '--dx1': `${(Math.random() - 0.5) * 80}px`,
      '--dy1': `${-50 - Math.random() * 150}px`,
      '--dx2': `${(Math.random() - 0.5) * 160}px`,
      '--dy2': `${-100 - Math.random() * 200}px`,
      '--dx3': `${(Math.random() - 0.5) * 240}px`,
      '--dy3': `${-50 - Math.random() * 150}px`,
      '--dx4': `${(Math.random() - 0.5) * 100}px`,
      '--dy4': `${-30 - Math.random() * 80}px`,
      animationDelay: `${Math.random() * 0.4}s`
    } : {};

    return (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, studentId, r, c)}
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        {student ? (
          <div
            draggable={!isLocked && !isShuffling}
            onDragStart={(e) => handleDragStart(e, student.id, 'grid', r, c)}
            onDragEnd={handleDragEnd}
            onMouseEnter={playHover}
            className={`
              ${isShuffling ? 'shuffling-card' : isLocked ? 'heavy-lock-border' : 'float-effect'} 
              student-desk-card
            `}
            style={{
              ...randomAnimStyles,
              width: '100%',
              height: '100%',
              background: isLocked ? 'repeating-linear-gradient(45deg, #181926, #1f2136 10px)' : 'rgba(18, 20, 38, 0.85)',
              border: isLocked 
                ? '2px solid rgba(255, 255, 255, 0.4)' 
                : student.gender === '남' 
                  ? '1.5px solid rgba(96, 165, 250, 0.5)' 
                  : '1.5px solid rgba(244, 114, 182, 0.5)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'grab',
              boxShadow: isLocked 
                ? '0 4px 10px rgba(0,0,0,0.5)' 
                : student.gender === '남'
                  ? '0 0 15px rgba(96, 165, 250, 0.1)'
                  : '0 0 15px rgba(244, 114, 182, 0.1)',
              position: 'absolute',
              top: 0, left: 0,
              zIndex: isShuffling ? 10 : 2,
              userSelect: 'none'
            }}
          >
            {/* Student Name */}
            <span style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: isLocked ? '#94a3b8' : '#fff',
              textShadow: isLocked ? 'none' : '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              {student.name}
            </span>

            {/* Gender indicator text/color */}
            <span style={{
              fontSize: '0.7rem',
              marginTop: '2px',
              fontWeight: 'bold',
              color: student.gender === '남' ? '#60a5fa' : '#f472b6'
            }}>
              {student.gender === '남' ? '♂️ 남' : '♀️ 여'}
            </span>

            {/* Lock Action Icon button */}
            <button
              onClick={(e) => handleLockClick(e, r, c)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: isLocked ? '#fff' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.2s',
                zIndex: 5
              }}
              title={isLocked ? '자물쇠 클릭 시 잠금 해제' : '자물쇠 클릭 시 고정석 설정'}
            >
              {isLocked ? '🔒' : '🔓'}
            </button>
          </div>
        ) : (
          /* Vacant seat */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.15)',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            빈 책상
          </div>
        )}
      </div>
    );
  };

  // Classify waiting room students
  const absentStudents = students.filter(s => s.status === 'absent');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Classroom Seating layout View */}
      <div className="glass-panel neon-border-cyan" style={{
        padding: '30px 24px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={getContainerLayout()}>
          
          {/* 1. Chalkboard Board */}
          <div
            style={{
              ...getChalkboardStyle(),
              background: '#0c1a14',
              border: '4px solid #1f392b',
              boxShadow: '0 0 15px rgba(31, 57, 43, 0.5), inset 0 0 20px rgba(0,0,0,0.8)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}
          >
            <div style={{
              fontFamily: 'Orbitron',
              color: '#38bdf8',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
              textAlign: 'center'
            }}>
              CHALKBOARD (칠판)
            </div>
          </div>

          {/* 2. Grid Area */}
          <div style={{
            gridArea: 'classroom',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflowX: 'auto',
            padding: '10px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${layoutGrid.length}, 70px)`,
              gridTemplateColumns: `repeat(${layoutGrid[0].length}, 85px)`,
              gap: '16px',
              padding: '24px',
              background: 'rgba(4, 5, 14, 0.6)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
            }}>
              {layoutGrid.map((rowArr, ri) =>
                rowArr.map((_, ci) => (
                  <div key={`${ri}-${ci}`} style={{ width: '100%', height: '100%' }}>
                    {renderCellContent(ri, ci)}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Space Waiting Room (Lower Area) */}
      <div className="glass-panel neon-border-pink" style={{
        padding: '20px',
        background: 'rgba(18, 20, 38, 0.4)'
      }}>
        <h3 className="title-orbitron text-pink" style={{ fontSize: '1rem', marginBottom: '12px' }}>
          🪐 우주 대기정거장 (배치 대기 및 제외 학생)
        </h3>
        
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null, null, null)} // dropping back into waiting area
          style={{
            minHeight: '75px',
            background: 'rgba(4, 5, 14, 0.5)',
            border: '1px dashed rgba(255, 0, 127, 0.2)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          {/* Active unseated students */}
          {unseatedStudents.length === 0 && absentStudents.length === 0 ? (
            <div style={{ width: '100%', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
              대기석이 비어 있습니다. 모든 학생이 책상에 배치되었습니다.
            </div>
          ) : (
            <>
              {/* Active unseated cards */}
              {unseatedStudents.map(student => (
                <div
                  key={student.id}
                  draggable={!isShuffling}
                  onDragStart={(e) => handleDragStart(e, student.id, 'waiting')}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={playHover}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(18, 20, 38, 0.8)',
                    border: student.gender === '남' ? '1.5px solid rgba(96, 165, 250, 0.3)' : '1.5px solid rgba(244, 114, 182, 0.3)',
                    borderRadius: '6px',
                    cursor: 'grab',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  className="float-effect"
                >
                  <span>{student.name}</span>
                  <span style={{ fontSize: '0.75rem', color: student.gender === '남' ? '#60a5fa' : '#f472b6' }}>
                    {student.gender === '남' ? '♂️' : '♀️'}
                  </span>
                </div>
              ))}

              {/* Absent/Excluded cards */}
              {absentStudents.map(student => (
                <div
                  key={student.id}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(255, 0, 127, 0.04)',
                    border: '1.5px solid rgba(255, 0, 127, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#f87171',
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'not-allowed'
                  }}
                  title="결석 처리된 학생 (자리 배치에서 제외됨)"
                >
                  <span style={{ textDecoration: 'line-through' }}>{student.name}</span>
                  <span style={{ fontSize: '0.7rem', background: '#ef444433', color: '#f87171', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>
                    결석
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
