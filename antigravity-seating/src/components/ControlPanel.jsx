import React from 'react';

export default function ControlPanel({
  currentView,
  onChangeView,
  onShuffle,
  onExportExcel,
  onResetHistory,
  isShuffling,
  ambientPlaying,
  onToggleAmbient,
  studentsCount,
  seatsCount,
  playClick,
  playHover
}) {
  const views = [
    { id: 'seating', label: '🛸 자리 배치도', color: 'var(--neon-cyan)', activeClass: 'btn-neon-cyan' },
    { id: 'layout', label: '📐 좌석 편집기', color: 'var(--neon-purple)', activeClass: 'btn-neon-purple' },
    { id: 'students', label: '👥 학생 명단', color: 'var(--neon-cyan)', activeClass: 'btn-neon-cyan' },
    { id: 'relations', label: '🤝 짝꿍 설정', color: 'var(--neon-pink)', activeClass: 'btn-neon-pink' }
  ];

  return (
    <div className="glass-panel neon-border-cyan" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px 24px'
    }}>
      {/* Title / Brand header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem', animation: 'antigravity-drift 4s ease-in-out infinite' }}>🛸</span>
          <div>
            <h1 className="title-orbitron text-cyan" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
              ANTIGRAVITY SEATING
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.5px' }}>
              무중력 교실 랜덤 자리바꾸기 v1.0
            </span>
          </div>
        </div>

        {/* Info stats pill */}
        <div style={{
          display: 'flex',
          gap: '12px',
          background: 'rgba(11, 12, 22, 0.6)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          fontSize: '0.8rem'
        }}>
          <div>학생: <strong className="text-cyan">{studentsCount}명</strong></div>
          <div style={{ color: 'rgba(255,255,255,0.2)' }}>|</div>
          <div>배치 좌석: <strong className="text-purple">{seatsCount}석</strong></div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

      {/* Navigation tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {views.map((v) => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => { playClick(); onChangeView(v.id); }}
              onMouseEnter={playHover}
              className={`btn-neon ${isActive ? v.activeClass : ''}`}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 16px',
                fontSize: '0.85rem',
                backgroundColor: isActive ? '' : 'rgba(255,255,255,0.02)',
                borderColor: isActive ? '' : 'rgba(255,255,255,0.1)',
                color: isActive ? '' : '#94a3b8'
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Action triggers */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '4px'
      }}>
        {/* Main Shuffle Button */}
        <button
          onClick={onShuffle}
          disabled={isShuffling || studentsCount === 0 || seatsCount === 0}
          onMouseEnter={playHover}
          className="btn-neon"
          style={{
            flex: 2,
            padding: '12px 24px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-purple) 100%)',
            border: 'none',
            color: '#0b0c16',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
            minWidth: '200px'
          }}
        >
          {isShuffling ? '🛸 중력 해제 중...' : '🌌 무중력 자리 배치 (Shuffle)'}
        </button>

        {/* Download CSV */}
        <button
          onClick={onExportExcel}
          disabled={isShuffling}
          onMouseEnter={playHover}
          className="btn-neon btn-neon-purple"
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '0.85rem',
            minWidth: '120px'
          }}
        >
          💾 배치 결과 저장
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => { playClick(); onToggleAmbient(); }}
          onMouseEnter={playHover}
          className={`btn-neon ${ambientPlaying ? 'btn-neon-pink' : ''}`}
          style={{
            padding: '12px 16px',
            fontSize: '0.85rem',
            background: ambientPlaying ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
            borderColor: ambientPlaying ? 'var(--neon-pink)' : 'rgba(255,255,255,0.1)',
            color: ambientPlaying ? 'var(--neon-pink)' : '#94a3b8'
          }}
          title="우주 엠비언트 배경 사운드 토글"
        >
          {ambientPlaying ? '🔊 사운드 ON' : '🔇 사운드 OFF'}
        </button>

        {/* Reset history */}
        <button
          onClick={() => {
            if (window.confirm("이전 배치 데이터 기록을 초기화하시겠습니까? (지난 짝꿍 방지용 기록 해제)")) {
              playClick();
              onResetHistory();
            }
          }}
          disabled={isShuffling}
          onMouseEnter={playHover}
          className="btn-neon btn-neon-pink"
          style={{
            padding: '12px 16px',
            fontSize: '0.85rem'
          }}
          title="지난달 짝꿍 방지 기록 초기화"
        >
          🔄 이력 리셋
        </button>
      </div>
    </div>
  );
}
