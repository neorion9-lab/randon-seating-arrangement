/**
 * Excel / CSV Import and Export Helper
 * Designed to support Excel copy-paste (TSV) and standard CSV files.
 * Handles UTF-8 BOM to prevent Korean character distortion in Excel.
 */

// Parse pasted spreadsheet data (Tab separated columns, newline separated rows)
export function parsePastedData(text) {
  if (!text || !text.trim()) return [];
  
  const lines = text.trim().split(/\r?\n/);
  const students = [];
  
  lines.forEach((line, index) => {
    const cols = line.split(/\t/); // Excel columns are separated by tabs
    const name = cols[0] ? cols[0].trim() : '';
    
    if (name) {
      // Determine gender if present (e.g. '남', '여', 'M', 'F', 'boy', 'girl')
      let gender = '남'; // default
      if (cols[1]) {
        const genText = cols[1].trim();
        if (['여', 'f', 'female', 'girl', '여자'].includes(genText.toLowerCase())) {
          gender = '여';
        }
      }
      
      students.push({
        id: `student_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        gender: gender,
        status: 'normal'
      });
    }
  });
  
  return students;
}

// Parse standard CSV file contents
export function parseCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];
  
  const lines = csvText.trim().split(/\r?\n/);
  const students = [];
  
  lines.forEach((line, index) => {
    // Basic comma separation, ignoring quotes for simplicity
    const cols = line.split(',');
    const name = cols[0] ? cols[0].replace(/^["']|["']$/g, '').trim() : '';
    
    if (name && name !== '이름' && name !== 'name') { // skip header
      let gender = '남';
      if (cols[1]) {
        const genText = cols[1].replace(/^["']|["']$/g, '').trim();
        if (['여', 'f', 'female', 'girl', '여자'].includes(genText.toLowerCase())) {
          gender = '여';
        }
      }
      
      students.push({
        id: `student_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        gender: gender,
        status: 'normal'
      });
    }
  });
  
  return students;
}

// Export student list to CSV
export function exportToCSV(students, filename = '학생명단.csv') {
  let csvContent = '이름,성별\n';
  
  students.forEach(s => {
    csvContent += `"${s.name}","${s.gender}"\n`;
  });
  
  // Add UTF-8 BOM to prevent Korean distortion in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export layout results with timestamp and positions
export function exportSeatingToCSV(grid, students, layoutGrid, auditLogs, filename = '자리배치결과.csv') {
  let csvContent = '자리 배치 결과\n';
  csvContent += `생성 일시,${new Date().toLocaleString()}\n\n`;
  
  // 1. Draw classroom layout in CSV
  csvContent += '교실 자리 배치도\n';
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  
  for (let r = 0; r < rows; r++) {
    const rowCells = [];
    for (let c = 0; c < cols; c++) {
      const studentId = grid[r][c];
      const cellType = layoutGrid[r][c].type;
      
      if (studentId) {
        const student = students.find(s => s.id === studentId);
        rowCells.push(`"${student?.name || '알수없음'}(${student?.gender || ''})"`);
      } else {
        if (cellType === 'aisle') rowCells.push('"통로"');
        else if (cellType === 'locker') rowCells.push('"사물함"');
        else if (cellType === 'tv') rowCells.push('"TV"');
        else if (cellType === 'window') rowCells.push('"창문"');
        else rowCells.push('"빈자리"');
      }
    }
    csvContent += rowCells.join(',') + '\n';
  }
  
  csvContent += '\n배치 세부 통계 및 검증 로그\n';
  auditLogs.forEach(log => {
    csvContent += `"${log}"\n`;
  });

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
