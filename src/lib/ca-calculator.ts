export interface PSGTechInternalInput {
  ca1: number; // out of 40
  ca2: number; // out of 40
  tutorial1: number; // out of 6
  tutorial2: number; // out of 6
  assignment: number; // out of 8
  targetGrade: 'O' | 'A' | 'B+' | 'B' | 'C';
}

export interface PSGTechInternalResult {
  caAvg40: number;
  caConverted30: number;
  totalInternal50: number;
  finalInternal40: number; // Final Internal out of 40
  targetMinTotal: number; // e.g. 90 for O, 80 for A
  neededEndSemScaled60: number; // needed out of 60
  requiredEndSem100: number; // required score out of 100 in End Sem
  status: 'EASY' | 'ACHIEVABLE' | 'CHALLENGING' | 'IMPOSSIBLE';
  statusMessage: string;
}

const gradeMinMap: Record<string, number> = {
  'O': 90,
  'A': 80,
  'B+': 70,
  'B': 60,
  'C': 50,
};

export function calculatePSGTechGradePrediction(input: PSGTechInternalInput): PSGTechInternalResult {
  const { ca1, ca2, tutorial1, tutorial2, assignment, targetGrade } = input;

  // 1. CA1 & CA2 average out of 40, converted to 30
  const caAvg40 = (ca1 + ca2) / 2;
  const caConverted30 = Number(((caAvg40 / 40) * 30).toFixed(2));

  // 2. Tutorial 1 (out of 6) + Tutorial 2 (out of 6) + Assignment (out of 8) -> Total 50
  const totalInternal50 = Number((caConverted30 + tutorial1 + tutorial2 + assignment).toFixed(2));

  // 3. Convert Total Internal (out of 50) to Final Internal (out of 40)
  const finalInternal40 = Number(((totalInternal50 / 50) * 40).toFixed(2));

  // 4. Target End Sem Exam Calculation (out of 100 scaled to 60)
  const targetMinTotal = gradeMinMap[targetGrade] || 90;
  const neededEndSemScaled60 = Number((targetMinTotal - finalInternal40).toFixed(2));

  // Convert needed 60 marks to required raw exam score out of 100
  let requiredEndSem100 = Math.ceil((neededEndSemScaled60 / 60) * 100);

  let status: 'EASY' | 'ACHIEVABLE' | 'CHALLENGING' | 'IMPOSSIBLE' = 'ACHIEVABLE';
  let statusMessage = '';

  if (requiredEndSem100 > 100) {
    status = 'IMPOSSIBLE';
    const maxAchievable = Math.floor(finalInternal40 + 60);
    statusMessage = `Grade ${targetGrade} is not achievable with current internals. Maximum total score you can reach is ${maxAchievable}/100.`;
  } else if (requiredEndSem100 <= 0) {
    status = 'EASY';
    requiredEndSem100 = 0;
    statusMessage = `You have already secured enough internal marks (${finalInternal40}/40) to guarantee Grade ${targetGrade}!`;
  } else if (requiredEndSem100 <= 50) {
    status = 'EASY';
    statusMessage = `Grade ${targetGrade} is easily achievable! You only need ${requiredEndSem100}/100 in the End Sem Exam.`;
  } else if (requiredEndSem100 <= 80) {
    status = 'ACHIEVABLE';
    statusMessage = `Grade ${targetGrade} is achievable. You need ${requiredEndSem100}/100 in the End Sem Exam.`;
  } else {
    status = 'CHALLENGING';
    statusMessage = `Grade ${targetGrade} requires a high End Sem exam score of ${requiredEndSem100}/100.`;
  }

  return {
    caAvg40,
    caConverted30,
    totalInternal50,
    finalInternal40,
    targetMinTotal,
    neededEndSemScaled60: Math.max(0, neededEndSemScaled60),
    requiredEndSem100,
    status,
    statusMessage
  };
}
