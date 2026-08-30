const STORAGE_KEY = "teacher_quest_v3_state";
const defaultState = {
  version: 3, index: 0, score: 0, xp: 0, streak: 0, answered: 0,
  mastered: {}, wrong: {}, seen: {}, history: [], mode: "mixed"
};
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(defaultState);
    const s=JSON.parse(raw);
    return {...structuredClone(defaultState), ...s};
  }catch(e){ return structuredClone(defaultState); }
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function resetProgress(){ localStorage.removeItem(STORAGE_KEY); location.reload(); }
