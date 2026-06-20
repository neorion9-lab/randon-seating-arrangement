import React, { useState } from 'react';

export default function RelationManager({
  students,
  relationships,
  onUpdateRelationships,
  playClick,
  playHover
}) {
  const [studentId1, setStudentId1] = useState('');
  const [studentId2, setStudentId2] = useState('');
  const [relType, setRelType] = useState('avoid'); // default to 'avoid'

  // Get active students list (excluding absent)
  const activeStudents = students.filter(s => s.status !== 'absent');

  const handleAddRelationship = (e) => {
    e.preventDefault();
    if (!studentId1 || !studentId2) {
      alert("두 학생을 모두 선택해야 합니다.");
      return;
    }
    if (studentId1 === studentId2) {
      alert("동일한 학생을 연결할 수 없습니다.");
      return;
    }
    
    playClick();

    // Check if relationship between these two already exists
    const duplicate = relationships.some(r =>
      (r.studentId1 === studentId1 && r.studentId2 === studentId2) ||
      (r.studentId1 === studentId2 && r.studentId2 === studentId1)
    );

    if (duplicate) {
      alert("이미 관계가 지정되어 있는 학생들입니다. 기존 관계를 먼저 삭제해 주세요.");
      return;
    }

    const newRel = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      studentId1,
      studentId2,
      type: relType
    };

    onUpdateRelationships([...relationships, newRel]);
    setStudentId1('');
    setStudentId2('');
  };

  const deleteRelationship = (relId) => {
    playClick();
    onUpdateRelationships(relationships.filter(r => r.id !== relId));
  };

  const getStudentName = (id) => {
    const s = students.find(student => student.id === id);
    return s ? `${s.name}(${s.gender})` : '알수없음';
  };

  return (
    <div className="glass-panel neon-border-pink" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="title-orbitron text-pink" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          RELATION MANAGER
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          옆자리에 같이 앉고 싶은 짝꿍(강제) 또는 떨어뜨려 놓아야 하는 짝꿍(금지)을 시각적으로 지정합니다.
        </p>
      </div>

      {/* Select inputs Form */}
      <form onSubmit={handleAddRelationship} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--border-radius-sm)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
              학생 1
            </label>
            <select
              value={studentId1}
              onChange={(e) => setStudentId1(e.target.value)}
              className="neon-input"
              style={{ width: '100%', fontSize: '0.85rem', background: '#0b0c16' }}
            >
              <option value="">선택...</option>
              {activeStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.gender})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
              학생 2
            </label>
            <select
              value={studentId2}
              onChange={(e) => setStudentId2(e.target.value)}
              className="neon-input"
              style={{ width: '100%', fontSize: '0.85rem', background: '#0b0c16' }}
            >
              <option value="">선택...</option>
              {activeStudents.map(s => (
                // Exclude studentId1 from choices to prevent choosing the same student
                s.id !== studentId1 && (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.gender})
                  </option>
                )
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="relType"
                value="avoid"
                checked={relType === 'avoid'}
                onChange={() => setRelType('avoid')}
                style={{ cursor: 'pointer' }}
              />
              <span className="text-pink" style={{ fontWeight: 600 }}>짝꿍 금지 🚫</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="relType"
                value="force"
                checked={relType === 'force'}
                onChange={() => setRelType('force')}
                style={{ cursor: 'pointer' }}
              />
              <span className="text-cyan" style={{ fontWeight: 600 }}>짝꿍 필수 🤝</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-neon btn-neon-pink"
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            🔒 연결하기
          </button>
        </div>
      </form>

      {/* Relationships List */}
      <div>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '8px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>지정된 관계 목록</span>
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: '10px',
            color: '#94a3b8'
          }}>
            {relationships.length}개
          </span>
        </h3>

        <div style={{
          maxHeight: '220px',
          overflowY: 'auto',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--border-radius-sm)',
          background: 'rgba(0,0,0,0.15)',
          padding: '8px'
        }}>
          {relationships.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              연결된 관계가 없습니다. 위의 양식에서 강제/금지 짝꿍 관계를 지정해 주세요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  onMouseEnter={playHover}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: rel.type === 'force' ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 0, 127, 0.05)',
                    border: `1px solid ${rel.type === 'force' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 0, 127, 0.2)'}`,
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{getStudentName(rel.studentId1)}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: rel.type === 'force' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                      color: rel.type === 'force' ? '#0b0c16' : '#fff',
                      fontWeight: 'bold'
                    }}>
                      {rel.type === 'force' ? '🤝 필수 짝꿍' : '🚫 금지 짝꿍'}
                    </span>
                    <span style={{ fontWeight: 600 }}>{getStudentName(rel.studentId2)}</span>
                  </div>

                  <button
                    onClick={() => deleteRelationship(rel.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                    title="관계 연결 해제"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
