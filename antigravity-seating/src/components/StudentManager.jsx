import React, { useState } from 'react';
import { parsePastedData, parseCSV, exportToCSV } from '../utils/excelHelper';

export default function StudentManager({
  students,
  onUpdateStudents,
  playClick,
  playHover
}) {
  const [pasteText, setPasteText] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('남');
  const [showImportArea, setShowImportArea] = useState(false);

  // Manual Add Student
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    playClick();
    
    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newName.trim(),
      gender: newGender,
      status: 'normal'
    };

    onUpdateStudents([...students, newStudent]);
    setNewName('');
  };

  // Clipboard Paste Import
  const handlePasteImport = () => {
    playClick();
    if (!pasteText.trim()) return;
    const parsed = parsePastedData(pasteText);
    if (parsed.length > 0) {
      onUpdateStudents([...students, ...parsed]);
      setPasteText('');
      setShowImportArea(false);
    } else {
      alert('유효한 학생 명단을 해석하지 못했습니다. 형식을 확인해 주세요.');
    }
  };

  // CSV File Upload
  const handleFileUpload = (e) => {
    playClick();
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        onUpdateStudents([...students, ...parsed]);
      } else {
        alert('CSV 파일에 유효한 학생 데이터가 없습니다.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Export Roster template
  const handleDownloadTemplate = () => {
    playClick();
    const template = [
      { name: '김철수', gender: '남', status: 'normal' },
      { name: '이영희', gender: '여', status: 'normal' },
      { name: '박민수', gender: '남', status: 'normal' },
      { name: '최지우', gender: '여', status: 'normal' }
    ];
    exportToCSV(template, '학생명단_템플릿.csv');
  };

  // Toggle Gender
  const toggleGender = (studentId) => {
    playClick();
    const updated = students.map(s => 
      s.id === studentId ? { ...s, gender: s.gender === '남' ? '여' : '남' } : s
    );
    onUpdateStudents(updated);
  };

  // Toggle Absent Status
  const toggleAbsent = (studentId) => {
    playClick();
    const updated = students.map(s =>
      s.id === studentId ? { ...s, status: s.status === 'absent' ? 'normal' : 'absent' } : s
    );
    onUpdateStudents(updated);
  };

  // Delete Student
  const deleteStudent = (studentId) => {
    playClick();
    const updated = students.filter(s => s.id !== studentId);
    onUpdateStudents(updated);
  };

  // Clear Roster
  const clearRoster = () => {
    if (window.confirm("정말로 명단을 모두 비우시겠습니까?")) {
      playClick();
      onUpdateStudents([]);
    }
  };

  // Count genders and active status
  const totalCount = students.length;
  const boysCount = students.filter(s => s.gender === '남').length;
  const girlsCount = students.filter(s => s.gender === '여').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  return (
    <div className="glass-panel neon-border-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="title-orbitron text-cyan" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          STUDENT MANAGER
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          자리 바꾸기에 참가할 학생 목록을 관리하고 결석(제외) 여부 및 성별을 설정합니다.
        </p>
      </div>

      {/* Summary Counter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'rgba(0, 240, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: '0.85rem'
      }}>
        <div>총원: <strong className="text-cyan">{totalCount}명</strong></div>
        <div>남학생: <strong style={{ color: '#60a5fa' }}>{boysCount}명</strong></div>
        <div>여학생: <strong style={{ color: '#f472b6' }}>{girlsCount}명</strong></div>
        <div>결석/제외: <strong className="text-pink">{absentCount}명</strong></div>
      </div>

      {/* Import / Export Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={() => { playClick(); setShowImportArea(!showImportArea); }}
          className="btn-neon btn-neon-cyan"
          style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}
        >
          📂 엑셀/CSV 불러오기
        </button>
        <button
          onClick={() => { playClick(); exportToCSV(students, '우리반_학생명단.csv'); }}
          disabled={students.length === 0}
          className="btn-neon btn-neon-cyan"
          style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}
        >
          💾 명단 저장 (CSV)
        </button>
        <button
          onClick={clearRoster}
          disabled={students.length === 0}
          className="btn-neon btn-neon-pink"
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          🗑️ 전체 삭제
        </button>
      </div>

      {/* Expandable Import Section */}
      {showImportArea && (
        <div style={{
          padding: '16px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px dashed rgba(0, 240, 255, 0.3)',
          borderRadius: 'var(--border-radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>방법 1: CSV 파일 업로드</span>
            <button
              onClick={handleDownloadTemplate}
              style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              템플릿 CSV 다운로드
            </button>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ fontSize: '0.8rem', color: '#94a3b8' }}
          />

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>방법 2: 엑셀 열(이름, 성별) 복사하여 붙여넣기</span>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="홍길동&#9;남&#10;성춘향&#9;여&#10;이몽룡&#9;남"
            style={{
              height: '80px',
              background: '#0b0c16',
              border: '1px solid var(--glass-border)',
              borderRadius: '4px',
              padding: '8px',
              color: '#fff',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              resize: 'none'
            }}
          />
          <button
            onClick={handlePasteImport}
            disabled={!pasteText.trim()}
            className="btn-neon btn-neon-cyan"
            style={{ alignSelf: 'flex-end', fontSize: '0.8rem', padding: '6px 12px' }}
          >
            📋 해석 및 붙여넣기
          </button>
        </div>
      )}

      {/* Manual Add Form */}
      <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="추가할 학생 이름"
          className="neon-input"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <select
          value={newGender}
          onChange={(e) => setNewGender(e.target.value)}
          className="neon-input"
          style={{ width: '70px', fontSize: '0.85rem', background: '#0b0c16' }}
        >
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
        <button type="submit" className="btn-neon btn-neon-cyan" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          ➕ 추가
        </button>
      </form>

      {/* Students List */}
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius-sm)',
        background: 'rgba(0,0,0,0.15)',
        padding: '8px'
      }}>
        {students.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            등록된 학생이 없습니다. 위에 학생을 추가해 주세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {students.map((student) => (
              <div
                key={student.id}
                onMouseEnter={playHover}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: student.status === 'absent' ? 'rgba(255, 0, 127, 0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${student.status === 'absent' ? 'rgba(255, 0, 127, 0.2)' : 'var(--glass-border)'}`,
                  borderRadius: '6px',
                  opacity: student.status === 'absent' ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontWeight: 600,
                    textDecoration: student.status === 'absent' ? 'line-through' : 'none'
                  }}>
                    {student.name}
                  </span>
                  
                  {/* Gender Badge */}
                  <button
                    onClick={() => toggleGender(student.id)}
                    style={{
                      background: student.gender === '남' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(244, 114, 182, 0.15)',
                      color: student.gender === '남' ? '#60a5fa' : '#f472b6',
                      border: `1px solid ${student.gender === '남' ? '#60a5fa33' : '#f472b633'}`,
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    title="성별 클릭 전환"
                  >
                    {student.gender}
                  </button>
                </div>

                {/* Exclude Toggle & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={student.status === 'absent'}
                      onChange={() => toggleAbsent(student.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: student.status === 'absent' ? 'var(--neon-pink)' : '#94a3b8' }}>
                      결석/제외
                    </span>
                  </label>

                  <button
                    onClick={() => deleteStudent(student.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
