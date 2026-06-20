import React from 'react';

export default function LayoutEditor({
  rows,
  cols,
  layoutGrid,
  chalkboardPos,
  onChangeRows,
  onChangeCols,
  onChangeLayout,
  onChangeChalkboardPos,
  playClick,
  playHover
}) {
  const cellTypes = [
    { value: 'seat', label: '🪑 책상', color: 'rgba(0, 240, 255, 0.15)', border: 'var(--neon-cyan)' },
    { value: 'aisle', label: '🚫 통로', color: 'transparent', border: 'rgba(255,255,255,0.05)' },
    { value: 'locker', label: '🗄️ 사물함', color: 'rgba(255, 0, 127, 0.1)', border: 'var(--neon-pink)' },
    { value: 'tv', label: '📺 TV', color: 'rgba(157, 0, 255, 0.1)', border: 'var(--neon-purple)' },
    { value: 'window', label: '🪟 창문', color: 'rgba(255, 215, 0, 0.1)', border: 'var(--neon-gold)' }
  ];

  const handleCellClick = (r, c) => {
    playClick();
    const currentCell = layoutGrid[r][c];
    const currentTypeIdx = cellTypes.findIndex(t => t.value === currentCell.type);
    const nextTypeIdx = (currentTypeIdx + 1) % cellTypes.length;
    const nextType = cellTypes[nextTypeIdx].value;

    const newGrid = layoutGrid.map((rowArr, ri) =>
      rowArr.map((cell, ci) => {
        if (ri === r && ci === c) {
          return {
            ...cell,
            type: nextType,
            lockedStudentId: null // reset lock if type changes
          };
        }
        return cell;
      })
    );
    onChangeLayout(newGrid);
  };

  const getCellStyles = (type) => {
    const info = cellTypes.find(t => t.value === type);
    return {
      backgroundColor: info?.color || 'transparent',
      borderColor: info?.border || 'rgba(255,255,255,0.1)',
      borderWidth: type === 'aisle' ? '1px' : '2px'
    };
  };

  const getCellIcon = (type) => {
    if (type === 'seat') return '🪑';
    if (type === 'locker') return '🗄️';
    if (type === 'tv') return '📺';
    if (type === 'window') return '🪟';
    return '';
  };

  return (
    <div className="glass-panel neon-border-purple" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="title-orbitron text-purple" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          LAYOUT EDITOR
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          교실 칸을 클릭하여 책상, 통로, 장애물(사물함, TV, 창문) 종류를 변경해 보세요.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: '#cbd5e1' }}>
            가로 칸 수 (열: {cols})
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={cols}
            onChange={(e) => { playHover(); onChangeCols(parseInt(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--neon-purple)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: '#cbd5e1' }}>
            세로 칸 수 (행: {rows})
          </label>
          <input
            type="range"
            min="3"
            max="8"
            value={rows}
            onChange={(e) => { playHover(); onChangeRows(parseInt(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--neon-purple)' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#cbd5e1' }}>
          칠판(Chalkboard) 위치
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['top', 'bottom', 'left', 'right'].map((pos) => (
            <button
              key={pos}
              onClick={() => { playClick(); onChangeChalkboardPos(pos); }}
              className="btn-neon btn-neon-purple"
              style={{
                flex: 1,
                padding: '6px 12px',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: chalkboardPos === pos ? 'var(--neon-purple)' : 'transparent',
                color: chalkboardPos === pos ? '#fff' : ''
              }}
            >
              {pos === 'top' && '⬆️ 상'}
              {pos === 'bottom' && '⬇️ 하'}
              {pos === 'left' && '⬅️ 좌'}
              {pos === 'right' && '➡️ 우'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
        {cellTypes.map((type) => (
          <div key={type.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: `1.5px solid ${type.border}`,
              backgroundColor: type.color,
              borderRadius: '3px'
            }}></span>
            <span>{type.label}</span>
          </div>
        ))}
      </div>

      {/* Visual Editor Grid */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 50px)`,
          gridTemplateColumns: `repeat(${cols}, 50px)`,
          gap: '8px',
          background: 'rgba(11, 12, 22, 0.4)',
          padding: '16px',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
        }}>
          {layoutGrid.map((rowArr, ri) =>
            rowArr.map((cell, ci) => (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                onMouseEnter={playHover}
                style={{
                  ...getCellStyles(cell.type),
                  borderStyle: 'solid',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.15s ease'
                }}
                className="layout-cell-btn"
                title={`Row ${ri+1}, Col ${ci+1}: Click to cycle type`}
              >
                {getCellIcon(cell.type)}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
