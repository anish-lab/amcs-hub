export interface AttendanceStats {
  percentage: number;
  classesConducted: number;
  classesAttended: number;
  canBunk: number;
  needToAttend: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface SimulationResult {
  simulatedConducted: number;
  simulatedAttended: number;
  simulatedPercentage: number;
  targetPercentage: number;
  canBunkWithTarget: number;
  needToAttendWithTarget: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  deltaPercentage: number;
}

export function calculateAttendance(conducted: number, attended: number, minPercentage = 75): AttendanceStats {
  if (conducted === 0) {
    return {
      percentage: 100,
      classesConducted: 0,
      classesAttended: 0,
      canBunk: 0,
      needToAttend: 0,
      status: 'SAFE'
    };
  }

  const percentage = (attended / conducted) * 100;
  
  let canBunk = 0;
  let needToAttend = 0;
  let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';

  if (percentage >= minPercentage) {
    canBunk = Math.floor((attended / (minPercentage / 100)) - conducted);
    if (canBunk < 0) canBunk = 0;
    
    if (percentage < 80) status = 'WARNING';
  } else {
    needToAttend = Math.ceil(((minPercentage / 100) * conducted - attended) / (1 - (minPercentage / 100)));
    if (needToAttend < 0) needToAttend = 0;
    status = 'CRITICAL';
  }

  return {
    percentage: Number(percentage.toFixed(2)),
    classesConducted: conducted,
    classesAttended: attended,
    canBunk,
    needToAttend,
    status
  };
}

export function simulateAttendance(
  currentConducted: number,
  currentAttended: number,
  plannedAttend: number,
  plannedBunk: number,
  targetPercentage = 75
): SimulationResult {
  const simulatedConducted = currentConducted + plannedAttend + plannedBunk;
  const simulatedAttended = currentAttended + plannedAttend;

  const currentStats = calculateAttendance(currentConducted, currentAttended, targetPercentage);
  const simStats = calculateAttendance(simulatedConducted, simulatedAttended, targetPercentage);

  const deltaPercentage = Number((simStats.percentage - currentStats.percentage).toFixed(2));

  return {
    simulatedConducted,
    simulatedAttended,
    simulatedPercentage: simStats.percentage,
    targetPercentage,
    canBunkWithTarget: simStats.canBunk,
    needToAttendWithTarget: simStats.needToAttend,
    status: simStats.status,
    deltaPercentage,
  };
}
