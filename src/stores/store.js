import { defineStore } from "pinia";
import { loadData, saveData } from "../utils/storage";

export const useStore = defineStore("app", {
  state: () => ({
    data: loadData(),
    currentUser: localStorage.getItem("currentUser") || null
  }),

  getters: {
    currentUserName(state) {
      const user = state.data.users.find(u => u.id === state.currentUser);
      return user ? user.name : null;
    },

    myBoards(state) {
      return state.data.boards.filter(b => b.members.includes(state.currentUser));
    },

    unreadNotifications(state) {
      return state.data.notifications.filter(n => n.userId === state.currentUser && !n.read);
    }
  },

  actions: {
    // Save everything
    persist() {
      saveData(this.data);
    },

    // Register
    register(name, password) {      const existingUser = this.data.users.find(u => u.name === name);
      if (existingUser) {
        return null; // Username already exists
      }      const newUser = {
        id: Date.now(),
        name,
        password
      };
      this.data.users.push(newUser);
      this.persist();
      return newUser.id;
    },

    // Login with password check
    login(username, password) {
      const user = this.data.users.find(u => u.name === username && u.password === password);
      if (user) {
        this.currentUser = user.id;
        localStorage.setItem("currentUser", user.id);
        return true;
      }
      return false;
    },

    // Logout System
    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUser");
    },

    // Boards
    addBoard(name) {
      const newBoard = {
        id: Date.now(),
        name,
        owner: this.currentUser,
        members: [this.currentUser]
      };
      this.data.boards.push(newBoard);
      this.persist();
      return newBoard.id;
    },

    deleteBoard(boardId) {
      this.data.boards = this.data.boards.filter(b => b.id !== boardId);
      this.data.columns = this.data.columns.filter(c => c.boardId !== boardId);
      this.data.tasks = this.data.tasks.filter(t => t.boardId !== boardId);
      this.persist();
    },

    renameBoard(boardId, newName) {
      const board = this.data.boards.find(b => b.id === boardId);
      if (board) {
        board.name = newName;
        this.persist();
      }
    },

    inviteMember(boardId, userId) {
      const board = this.data.boards.find(b => b.id === boardId);
      if (board && !board.members.includes(userId)) {
        board.members.push(userId);
        this.persist();
      }
    },

    // Columns
    addColumn(boardId, name) {
      const newColumn = {
        id: Date.now(),
        boardId,
        name,
        order: Date.now()
      };
      this.data.columns.push(newColumn);
      this.persist();
    },

    renameColumn(columnId, newName) {
      const column = this.data.columns.find(c => c.id === columnId);
      if (column) {
        column.name = newName;
        this.persist();
      }
    },

    deleteColumn(columnId) {
      this.data.columns = this.data.columns.filter(c => c.id !== columnId);
      this.data.tasks = this.data.tasks.filter(t => t.columnId !== columnId);
      this.persist();
    },

    // Tasks
    addTask(columnId, title) {
      const column = this.data.columns.find(c => c.id === columnId);
      if (column) {
        const newTask = {
          id: Date.now(),
          columnId,
          boardId: column.boardId,
          title,
          assignedTo: null,
          order: Date.now()
        };
        this.data.tasks.push(newTask);
        this.persist();
      }
    },

    assignTask(taskId, userId) {
      const task = this.data.tasks.find(t => t.id === taskId);
      if (task) {
        if (!Array.isArray(task.assignedTo)) {
          task.assignedTo = [];
        }
        if (!task.assignedTo.includes(userId)) {
          task.assignedTo.push(userId);
          const board = this.data.boards.find(b => b.id === task.boardId);
          const boardName = board ? board.name : "Unknown board";
          const assigner = this.data.users.find(u => u.id === this.currentUser);
          const assignerName = assigner ? assigner.name : "Unknown user";
          this.data.notifications.push({
            id: Date.now(),
            userId,
            message: `You were assigned in ${boardName} by ${assignerName}: ${task.title}`,
            read: false
          });
        }
        this.persist();
      }
    },

    unassignTask(taskId, userId) {
      const task = this.data.tasks.find(t => t.id === taskId);
      if (task && Array.isArray(task.assignedTo)) {
        task.assignedTo = task.assignedTo.filter(id => id !== userId);
        this.persist();
      }
    },

    renameTask(taskId, newTitle) {
      const task = this.data.tasks.find(t => t.id === taskId);
      if (task) {
        task.title = newTitle;
        this.persist();
      }
    },

    deleteTask(taskId) {
      this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
      this.persist();
    },
  }
});