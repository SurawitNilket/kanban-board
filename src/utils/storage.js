const STORAGE_KEY = "kanban_board_data";

// All data
const defaultData = {
  users: [
    { id: "1", name: "User1", password: "pass1" },
    { id: "2", name: "User2", password: "pass2" },
    { id: "3", name: "User3", password: "pass3" }
  ],
  boards: [],
  columns: [],
  tasks: [],
  notifications: []
};

// Load data
export function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultData;
}

// Save data
export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Reset (for testing)
export function resetData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
}