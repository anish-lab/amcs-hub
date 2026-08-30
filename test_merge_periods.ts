interface Slot {
  id: string;
  period: number;
  time: string;
  code: string;
  name: string;
}

interface MergedSlot {
  id: string;
  startPeriod: number;
  endPeriod: number;
  time: string;
  code: string;
  name: string;
  isBlockPeriod: boolean;
}

function mergeConsecutiveSlots(slots: Slot[]): MergedSlot[] {
  // Sort slots by period ascending
  const sorted = [...slots].sort((a, b) => a.period - b.period);
  const result: MergedSlot[] = [];

  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    let endIdx = i;

    // Check if next slot has same code and is strictly consecutive period (current.period + 1)
    while (
      endIdx + 1 < sorted.length &&
      sorted[endIdx + 1].code === current.code &&
      sorted[endIdx + 1].period === sorted[endIdx].period + 1
    ) {
      endIdx++;
    }

    if (endIdx > i) {
      // We found a block period (e.g., 2 or more consecutive periods)
      const lastSlot = sorted[endIdx];
      
      // Extract start time from first slot and end time from last slot
      // e.g. "1.40 - 2.30" and "2.30 - 3.20" -> "1.40 - 3.20"
      const startTime = current.time.split('-')[0]?.trim() || current.time;
      const endTime = lastSlot.time.includes('-') ? lastSlot.time.split('-')[1]?.trim() : lastSlot.time;
      const mergedTime = `${startTime} - ${endTime}`;

      result.push({
        id: current.id,
        startPeriod: current.period,
        endPeriod: lastSlot.period,
        time: mergedTime,
        code: current.code,
        name: current.name,
        isBlockPeriod: true,
      });

      i = endIdx + 1;
    } else {
      // Single period
      result.push({
        id: current.id,
        startPeriod: current.period,
        endPeriod: current.period,
        time: current.time,
        code: current.code,
        name: current.name,
        isBlockPeriod: false,
      });

      i++;
    }
  }

  return result;
}

// Test case: Wednesday slots
const sampleSlots: Slot[] = [
  { id: '1', period: 5, time: '1.40 - 2.30', code: '23XT53', name: 'MACHINE LEARNING' },
  { id: '2', period: 6, time: '2.30 - 3.20', code: '23XT53', name: 'MACHINE LEARNING' },
  { id: '3', period: 7, time: '3.30 - 4.20', code: '23XT52', name: 'COMPUTATIONAL NUMBER THEORY AND CRYPTOGRAPHY' }
];

console.log('Merged Slots:', mergeConsecutiveSlots(sampleSlots));
