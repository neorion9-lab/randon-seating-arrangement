import React from 'react';

export default function AuditLog({
  auditLogs,
  violations,
  timestamp,
  options,
  onUpdateOptions,
  playClick,
  playHover
}) {
  const handleToggleOption = (key) => {
    playClick();
    onUpdateOptions({
      ...options,
      [key]: !options[key]
    });
  };

  return (
    <div className="glass-panel neon-border-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
      <div>
        <h2 className="title-orbitron text-cyan" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          ALGORITHM & AUDIT LOG
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          매칭 알고리즘 조건 설정과 배정 공정성 증명을 위한 오디트 로그를 모니터링합니다.
        </p>
      </div>

      {/* Algorithm Option Toggles */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: 'rgba(11, 12, 22, 0.4)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius-sm)'
      }}>
        <h3 style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          옵션 제약 조건
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Gender Balance Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>남-녀 성별 자동 분배</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>짝꿍 매칭 시 남여 학생이 교대로 배치되도록 함</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={options.balanceGender}
                onChange={() => handleToggleOption('balanceGender')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Avoid Previous Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>지난 자리 짝꿍 중복 방지</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>바로 지난달에 같이 앉았던 짝꿍을 자동으로 회피</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={options.avoidPrevious}
                onChange={() => handleToggleOption('avoidPrevious')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Log Console Window */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🖥️ 검증 오디트 터미널
          </h3>
          {timestamp && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              최근 생성: {timestamp}
            </span>
          )}
        </div>

        <div style={{
          flex: 1,
          background: '#04050e',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          boxShadow: 'inset 0 0 10px rgba(0,240,255,0.1)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: '#e2e8f0',
          overflowY: 'auto',
          lineHeight: '1.6',
          maxHeight: '260px'
        }}>
          {auditLogs.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', padding: '24px' }}>
              자리 바꿈을 시작하면 공정성 검증 로그가 이 터미널 창에 출력됩니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>[SYSTEM DEPLOYMENT INITIALIZED]</div>
              
              {/* Output log strings */}
              {auditLogs.map((log, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--neon-cyan)', paddingLeft: '8px' }}>
                  &gt; {log}
                </div>
              ))}

              {/* Warnings and Violations list */}
              {violations.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ color: 'var(--neon-pink)', fontWeight: 'bold' }}>[⚠️ 제약 규칙 조율 통지]</div>
                  {violations.map((vio, i) => (
                    <div key={i} style={{ color: '#fca5a5', paddingLeft: '8px' }}>
                      • {vio}
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ color: 'var(--neon-green)', fontWeight: 'bold', marginTop: '4px' }}>[READY FOR ACTION]</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
