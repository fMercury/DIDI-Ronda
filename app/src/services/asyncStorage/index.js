import { saveItem, getItem, deleteItem } from "../../utils/storage";
import { getEndDate } from "../../utils/dates";

const normalizeRound = data => ({
  start: false,
  pending: true,
  name: data.name,
  amount: parseInt(data.amount, 10),
  startDate: data.date,
  turns: data.turns,
  date: data.date,
  pickTurnsManual: data.pickTurnsManual,
  endDate: getEndDate(data.date, data.frequency, data.participants.length),
  recurrence: data.frequency,
  isEditing: data.isEditing,
  roundIndex: parseInt(data.roundIndex, 10),
  participants: data.participants.map(e => ({ ...e, user: {} })),
  shifts: data.participants.map(e => ({
    participant: { ...e },
    user: { _id: null },
  })),
});

export const saveRoundToStorage = async data => {
  const storedRoundIndex = (await getItem("roundIndex")) || 0;
  const { roundIndex } = data;
  const indexToSaveStr = roundIndex || storedRoundIndex;
  const indexToSave = roundIndex || parseInt(indexToSaveStr, 10) + 1;
  const itemToSave = normalizeRound({
    ...data,
    roundIndex: indexToSave,
  });
  await saveItem(`Ronda-${indexToSave}`, itemToSave);
  await saveItem("roundIndex", indexToSave);
  return true;
};

export const getRoundFromStorage = async data => {
  const storedRoundIndex = (await getItem("roundIndex")) || 0;
  const { roundIndex } = data;
  const indexToSave = roundIndex || storedRoundIndex;
  await getItem(`Ronda-${indexToSave}`, data);
  return true;
};

export const getAllRoundsFromStorage = async () => {
  const stringRoundIndex = (await getItem("roundIndex")) || 0;
  const storedRoundIndex = parseInt(stringRoundIndex, 10);
  const rounds = [];

  for (let i = 0; i <= storedRoundIndex; i += 1) {
    const data = getItem(`Ronda-${i}`);
    rounds.push(data);
  }

  const resolvedData = await Promise.all(rounds);

  if (resolvedData && resolvedData.length) {
    return resolvedData.filter(e => {
      if (e !== null) return true;
      return false;
    });
  }

  return [];
};

export const deleteRoundFromStorage = async index => {
  await deleteItem(`Ronda-${index}`);
  return true;
};
