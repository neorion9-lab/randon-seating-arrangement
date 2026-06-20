/**
 * Seating Arrangement Algorithm
 * Optimizes seating layout based on multiple constraints:
 * 1. Locked seats (Fixed students) - Hard constraint
 * 2. Excluded/Absent students - Hard constraint
 * 3. Forced pairs (Must sit together horizontally) - High weight
 * 4. Avoided pairs (Cannot sit together horizontally) - High penalty
 * 5. Previous partners avoidance - Medium penalty
 * 6. Gender balance (Maximize boy-girl pairs horizontally) - Low penalty
 */

// Helper to check horizontal adjacency in a 2D layout grid
function getHorizontalPartners(grid) {
  const partners = [];
  const rows = grid.length;
  if (rows === 0) return partners;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const cell1 = grid[r][c];
      const cell2 = grid[r][c + 1];
      if (cell1 && cell2 && cell1.type === 'seat' && cell2.type === 'seat') {
        partners.push({
          r1: r, c1: c,
          r2: r, c2: c + 1
        });
      }
    }
  }
  return partners;
}

// Check if two student IDs are adjacent in a placed layout
function areAdjacent(studentId1, studentId2, placementGrid) {
  const rows = placementGrid.length;
  if (rows === 0) return false;
  const cols = placementGrid[0].length;

  let pos1 = null;
  let pos2 = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = placementGrid[r][c];
      if (val === studentId1) pos1 = { r, c };
      if (val === studentId2) pos2 = { r, c };
    }
  }

  if (!pos1 || !pos2) return false;
  // Adjacent horizontally in the same row
  return pos1.r === pos2.r && Math.abs(pos1.c - pos2.c) === 1;
}

export function generateSeatingLayout({
  students,         // Array of { id, name, gender, status }
  layoutGrid,       // 2D Array of { row, col, type, lockedStudentId }
  relationships,    // Array of { studentId1, studentId2, type: 'force'|'avoid' }
  previousPairs,    // Array of [studentIdA, studentIdB] (adjacent pairs in previous layout)
  options = { balanceGender: true, avoidPrevious: true }
}) {
  const startTime = Date.now();
  const rows = layoutGrid.length;
  const cols = rows > 0 ? layoutGrid[0].length : 0;

  if (rows === 0 || cols === 0) {
    return {
      grid: [],
      violations: ["배치할 수 있는 레이아웃이 비어 있습니다."],
      timestamp: new Date().toLocaleString(),
      durationMs: 0
    };
  }

  // 1. Classify students
  const activeStudents = students.filter(s => s.status !== 'absent');
  const absentStudents = students.filter(s => s.status === 'absent');

  // Extract locked seats and map locked students
  const lockedPlacements = {}; // studentId -> { r, c }
  const lockedSeats = []; // Array of { r, c, studentId }
  const seatPositions = []; // All seat coordinates

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = layoutGrid[r][c];
      if (cell.type === 'seat') {
        seatPositions.push({ r, c });
        if (cell.lockedStudentId) {
          // Verify if student is still active (not absent)
          const isStudentActive = activeStudents.some(s => s.id === cell.lockedStudentId);
          if (isStudentActive) {
            lockedPlacements[cell.lockedStudentId] = { r, c };
            lockedSeats.push({ r, c, studentId: cell.lockedStudentId });
          }
        }
      }
    }
  }

  // Pool of students to be randomly assigned
  const lockedStudentIds = Object.keys(lockedPlacements);
  const assignableStudents = activeStudents.filter(s => !lockedStudentIds.includes(s.id));
  
  // Coordinates of seats available for assignment (not locked)
  const assignableSeats = seatPositions.filter(
    pos => !lockedSeats.some(ls => ls.r === pos.r && ls.c === pos.c)
  );

  // If there are more assignable students than available seats, we need to handle overflow.
  // We seat as many as possible, and the remaining go to the waiting area.
  // If there are more seats, some seats will remain empty (null).
  const totalSeatsCount = seatPositions.length;
  
  // Relationships filters
  const forcePairs = relationships.filter(r => r.type === 'force');
  const avoidPairs = relationships.filter(r => r.type === 'avoid');

  // Setup best trial tracking
  let bestGrid = null;
  let bestScore = -Infinity;
  let bestViolations = [];
  let bestForceSatisfiedCount = 0;

  const maxTrials = 2000;
  let trialsCount = 0;

  // Horizontal partner pairings possible in this layout
  const horizontalPairs = getHorizontalPartners(layoutGrid);

  // Run randomized optimization trials
  for (let t = 0; t < maxTrials; t++) {
    trialsCount++;

    // Create a working grid populated with nulls
    const currentGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Place locked students
    lockedSeats.forEach(ls => {
      currentGrid[ls.r][ls.c] = ls.studentId;
    });

    // Shuffle assignable students randomly
    const shuffledStudents = [...assignableStudents].sort(() => Math.random() - 0.5);
    
    // Assign student cards
    const currentSeats = [...assignableSeats];
    
    // Try to satisfy "Must Sit Together" (force) relationships first
    const assignedIds = new Set();
    
    // We try to place force pairs into adjacent horizontal seat positions
    forcePairs.forEach(pair => {
      const s1 = pair.studentId1;
      const s2 = pair.studentId2;

      // Only attempt if both students are in the assignable pool and not yet assigned in this trial
      const s1Index = shuffledStudents.findIndex(s => s.id === s1 && !assignedIds.has(s.id));
      const s2Index = shuffledStudents.findIndex(s => s.id === s2 && !assignedIds.has(s.id));

      if (s1Index !== -1 && s2Index !== -1) {
        // Find a horizontal pair of seats that are both currently empty
        const emptyHorizontalPairIndex = horizontalPairs.findIndex(hp => {
          return currentGrid[hp.r1][hp.c1] === null && currentGrid[hp.r2][hp.c2] === null;
        });

        if (emptyHorizontalPairIndex !== -1) {
          const hp = horizontalPairs[emptyHorizontalPairIndex];
          const student1 = shuffledStudents[s1Index];
          const student2 = shuffledStudents[s2Index];

          // Set seats in grid
          currentGrid[hp.r1][hp.c1] = student1.id;
          currentGrid[hp.r2][hp.c2] = student2.id;
          assignedIds.add(student1.id);
          assignedIds.add(student2.id);

          // Remove these seats from available assignableSeats list
          const s1SeatIdx = currentSeats.findIndex(cs => cs.r === hp.r1 && cs.c === hp.c1);
          if (s1SeatIdx !== -1) currentSeats.splice(s1SeatIdx, 1);
          const s2SeatIdx = currentSeats.findIndex(cs => cs.r === hp.r2 && cs.c === hp.c2);
          if (s2SeatIdx !== -1) currentSeats.splice(s2SeatIdx, 1);
        }
      }
    });

    // For any remaining assignable students, place them in the remaining empty seats
    let seatIndex = 0;
    shuffledStudents.forEach(student => {
      if (assignedIds.has(student.id)) return; // Already placed in a force pair

      if (seatIndex < currentSeats.length) {
        const seat = currentSeats[seatIndex];
        currentGrid[seat.r][seat.c] = student.id;
        seatIndex++;
      }
    });

    // --- SCORE & EVALUATE THIS TRIAL ---
    let score = 0;
    let violations = [];
    let satisfiedForcePairs = 0;

    // 1. Force Pairs (Must Sit Together)
    forcePairs.forEach(pair => {
      const isOk = areAdjacent(pair.studentId1, pair.studentId2, currentGrid);
      if (isOk) {
        score += 1000;
        satisfiedForcePairs++;
      } else {
        const student1 = students.find(s => s.id === pair.studentId1);
        const student2 = students.find(s => s.id === pair.studentId2);
        score -= 1000;
        violations.push(`짝꿍 필수 매칭 실패: ${student1?.name || '알수없음'} ↔ ${student2?.name || '알수없음'}`);
      }
    });

    // 2. Avoid Pairs (Cannot Sit Together)
    avoidPairs.forEach(pair => {
      const isBad = areAdjacent(pair.studentId1, pair.studentId2, currentGrid);
      if (isBad) {
        const student1 = students.find(s => s.id === pair.studentId1);
        const student2 = students.find(s => s.id === pair.studentId2);
        score -= 800;
        violations.push(`짝꿍 금지 위반: ${student1?.name || '알수없음'}와(과) ${student2?.name || '알수없음'}가 옆자리에 배치됨`);
      } else {
        score += 100;
      }
    });

    // 3. Previous Seating Partner Duplication
    if (options.avoidPrevious && previousPairs && previousPairs.length > 0) {
      previousPairs.forEach(pair => {
        // pair is [id1, id2] or [name1, name2]
        const [id1, id2] = pair;
        const isBad = areAdjacent(id1, id2, currentGrid);
        if (isBad) {
          const student1 = students.find(s => s.id === id1);
          const student2 = students.find(s => s.id === id2);
          score -= 400;
          violations.push(`이전 짝꿍 중복: ${student1?.name || '알수없음'}와(과) ${student2?.name || '알수없음'}가 연속으로 이웃함`);
        } else {
          score += 20;
        }
      });
    }

    // 4. Gender Balance (Maximize opposite-gender pairs in horizontal desk groups)
    if (options.balanceGender) {
      horizontalPairs.forEach(hp => {
        const id1 = currentGrid[hp.r1][hp.c1];
        const id2 = currentGrid[hp.r2][hp.c2];
        if (id1 && id2) {
          const student1 = students.find(s => s.id === id1);
          const student2 = students.find(s => s.id === id2);
          
          if (student1 && student2) {
            if (student1.gender === student2.gender) {
              score -= 80; // Penalty for same gender side-by-side
            } else {
              score += 120; // Reward for different gender
            }
          }
        }
      });
    }

    // Update best layout found
    if (score > bestScore) {
      bestScore = score;
      bestGrid = currentGrid;
      bestViolations = violations;
      bestForceSatisfiedCount = satisfiedForcePairs;
      
      // If we find a perfect arrangement (no violations), we can stop early
      if (violations.length === 0) {
        break;
      }
    }
  }

  // Calculate statistics for the audit log
  const durationMs = Date.now() - startTime;
  const auditLogs = [];
  
  auditLogs.push(`총 시도 횟수: ${trialsCount}회`);
  auditLogs.push(`배치 연산 소요 시간: ${durationMs}ms`);
  
  if (bestViolations.length === 0) {
    auditLogs.push("모든 제약조건(짝꿍 강제, 금지, 이전 배치 중복 방지)을 100% 만족하는 완벽한 자리를 찾았습니다.");
  } else {
    auditLogs.push(`완화된 제약조건 적용: ${bestViolations.length}개의 규칙이 미준수되었습니다. (필요 시 수동 드래그로 조정 가능)`);
  }

  // Count gender ratio
  let totalPairs = 0;
  let boyGirlPairs = 0;
  horizontalPairs.forEach(hp => {
    const id1 = bestGrid[hp.r1][hp.c1];
    const id2 = bestGrid[hp.r2][hp.c2];
    if (id1 && id2) {
      const student1 = students.find(s => s.id === id1);
      const student2 = students.find(s => s.id === id2);
      if (student1 && student2) {
        totalPairs++;
        if (student1.gender !== student2.gender) boyGirlPairs++;
      }
    }
  });

  if (options.balanceGender && totalPairs > 0) {
    const ratio = Math.round((boyGirlPairs / totalPairs) * 100);
    auditLogs.push(`남-녀 혼합 짝꿍 비율: ${ratio}% (${totalPairs}쌍 중 ${boyGirlPairs}쌍)`);
  }

  // List students that couldn't be placed (overflow)
  const placedStudentIds = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (bestGrid[r][c]) placedStudentIds.add(bestGrid[r][c]);
    }
  }
  
  const unseatedStudents = activeStudents.filter(s => !placedStudentIds.has(s.id));
  if (unseatedStudents.length > 0) {
    const names = unseatedStudents.map(s => s.name).join(', ');
    auditLogs.push(`좌석 부족으로 대기석에 배치된 학생: [${names}]`);
  }

  // Excluded students
  if (absentStudents.length > 0) {
    const names = absentStudents.map(s => s.name).join(', ');
    auditLogs.push(`결석/제외 처리되어 배치에서 제외된 학생: [${names}]`);
  }

  return {
    grid: bestGrid,
    violations: bestViolations,
    auditLogs: auditLogs,
    timestamp: new Date().toLocaleString(),
    durationMs: durationMs,
    unseatedStudents: unseatedStudents
  };
}
