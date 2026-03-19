<script setup>
import { computed, reactive } from 'vue'
import draggable from 'vuedraggable'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store'

const route = useRoute()
const router = useRouter()
const store = useStore()

const boardId = Number(route.params.boardId)
const board = computed(() => store.data.boards.find(b => b.id === boardId))

const goBack = () => router.push({ name: 'board' })

const getUserName = (userId) => {
  const user = store.data.users.find(u => u.id === userId)
  return user ? user.name : 'Unknown'
}


import { ref } from 'vue'

const showMembers = ref(false)
const showInvite = ref(false)
const inviteUsername = ref('')
const inviteError = ref('')

const memberList = computed(() => {
  if (!board.value) return []
  return board.value.members.map(id => {
    const user = store.data.users.find(u => u.id === id)
    return {
      id,
      name: user ? user.name : 'Unknown',
      role: id === board.value.owner ? 'Owner' : 'Member'
    }
  })
})

const toggleMembers = () => {
  showMembers.value = !showMembers.value
  showInvite.value = false
  inviteUsername.value = ''
  inviteError.value = ''
}

const openInvite = () => {
  showInvite.value = true
  inviteUsername.value = ''
  inviteError.value = ''
}

const cancelInvite = () => {
  showInvite.value = false
  inviteUsername.value = ''
  inviteError.value = ''
}

const sendInvite = () => {
  const username = inviteUsername.value.trim()
  if (!username) {
    inviteError.value = 'Enter a username.'
    return
  }
  const user = store.data.users.find(u => u.name === username)
  if (!user) {
    inviteError.value = 'User not found.'
    return
  }
  store.inviteMember(boardId, user.id)
  showInvite.value = false
  inviteUsername.value = ''
  inviteError.value = ''
}


import { nextTick } from 'vue'
const showNewColumn = ref(false)
const newColumnName = ref('')
const newColumnInput = ref(null)
const renamingColumnInput = ref(null)


const columns = computed(() => {
  if (!board.value) return []
  return store.data.columns.filter(c => c.boardId === boardId).sort((a, b) => a.order - b.order)
})

const showAddTask = ref({})
const newTaskTitle = ref({})
const newTaskInput = ref({})

const tasksByColumn = (colId) => {
  return taskLists[colId] || [];
}

// Create a reactive object to hold tasks for each column
const taskLists = reactive({});
// Initialize taskLists for each column
const updateTaskLists = () => {
  columns.value.forEach(col => {
    taskLists[col.id] = store.data.tasks
      .filter(t => t.columnId === col.id)
      .sort((a, b) => a.order - b.order);
  });
};
// Watch columns and tasks to keep taskLists updated
import { watch } from 'vue';
watch(() => store.data.tasks, updateTaskLists, { deep: true });
watch(columns, updateTaskLists, { deep: true });
updateTaskLists();

const onTaskReorder = (colId) => {
  // Update order property for each task in taskLists[colId]
  taskLists[colId].forEach((task, idx) => {
    task.order = idx + 1;
  });
  store.persist();
}

const showAssignDropdown = ref({})
const assignDropdownTask = ref(null)
const assignDropdownCol = ref(null)
const assignDropdownMember = ref({})

const showEditTask = ref({})
const editTaskTitle = ref({})
const editTaskInput = ref({})

const openAssignDropdown = (colId, taskId) => {
  // Toggle dropdown
  showAssignDropdown.value = { ...showAssignDropdown.value, [taskId]: !showAssignDropdown.value[taskId] }
  assignDropdownTask.value = showAssignDropdown.value[taskId] ? taskId : null
  assignDropdownCol.value = showAssignDropdown.value[taskId] ? colId : null
}
const closeAssignDropdown = (taskId) => {
  showAssignDropdown.value = { ...showAssignDropdown.value, [taskId]: false }
  assignDropdownTask.value = null
  assignDropdownCol.value = null
}

// Click outside handler for assign dropdown
import { onMounted, onBeforeUnmount } from 'vue'
const handleClickOutside = (event) => {
  // Only close if dropdown is open
  if (!assignDropdownTask.value) return
  const dropdown = document.querySelector('.assign-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    closeAssignDropdown(assignDropdownTask.value)
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
const toggleAssignMember = (taskId, userId) => {
  const task = store.data.tasks.find(t => t.id === taskId)
  if (!task) return
  if (!Array.isArray(task.assignedTo)) task.assignedTo = []
  if (task.assignedTo.includes(userId)) {
    store.unassignTask(taskId, userId)
  } else {
    store.assignTask(taskId, userId)
  }
}

const openEditTask = (taskId, title) => {
  showEditTask.value = { ...showEditTask.value, [taskId]: true }
  editTaskTitle.value = { ...editTaskTitle.value, [taskId]: title }
  nextTick(() => {
    if (editTaskInput.value[taskId]) editTaskInput.value[taskId].focus()
  })
}
const closeEditTask = (taskId) => {
  showEditTask.value = { ...showEditTask.value, [taskId]: false }
  editTaskTitle.value = { ...editTaskTitle.value, [taskId]: '' }
}
const saveEditTask = (taskId) => {
  const title = (editTaskTitle.value[taskId] || '').trim()
  if (!title) return
  store.renameTask(taskId, title)
  closeEditTask(taskId)
}
const deleteTask = (taskId, title) => {
  if (window.confirm(`Delete the task "${title}"?`)) {
    store.deleteTask(taskId)
  }
}

const startAddTask = (colId) => {
  showAddTask.value = { ...showAddTask.value, [colId]: true }
  newTaskTitle.value = { ...newTaskTitle.value, [colId]: '' }
  nextTick(() => {
    if (newTaskInput.value[colId]) newTaskInput.value[colId].focus()
  })
}

const cancelAddTask = (colId) => {
  showAddTask.value = { ...showAddTask.value, [colId]: false }
  newTaskTitle.value = { ...newTaskTitle.value, [colId]: '' }
}

const createTask = (colId) => {
  const title = (newTaskTitle.value[colId] || '').trim()
  if (!title) return
  store.addTask(colId, title)
  showAddTask.value = { ...showAddTask.value, [colId]: false }
  newTaskTitle.value = { ...newTaskTitle.value, [colId]: '' }
}

const startAddColumn = () => {
  showNewColumn.value = true
  newColumnName.value = ''
  nextTick(() => {
    if (newColumnInput.value) newColumnInput.value.focus()
  })
}

const cancelAddColumn = () => {
  showNewColumn.value = false
  newColumnName.value = ''
}

const createColumn = () => {
  const name = newColumnName.value.trim()
  if (!name) return
  store.addColumn(boardId, name)
  showNewColumn.value = false
  newColumnName.value = ''
}

const renamingColumnId = ref(null)
const renamingColumnName = ref('')

const startRenameColumn = (col) => {
  renamingColumnId.value = col.id
  renamingColumnName.value = col.name
  nextTick(() => {
    if (renamingColumnInput.value) renamingColumnInput.value.focus()
  })
}

const cancelRenameColumn = () => {
  renamingColumnId.value = null
  renamingColumnName.value = ''
}

const saveRenameColumn = (col) => {
  const name = renamingColumnName.value.trim()
  if (!name) return
  store.renameColumn(col.id, name)
  renamingColumnId.value = null
  renamingColumnName.value = ''
}

const deleteColumn = (col) => {
  if (confirm(`Delete the column "${col.name}"?`)) {
    store.deleteColumn(col.id)
  }
}

</script>

<template>
  <section class="detail-page">
    <header class="detail-header">
      <div class="detail-header__left">
        <button class="back" @click="goBack">←</button>
        <h1>{{ board ? board.name : 'Board not found' }}</h1>
      </div>

      <div class="detail-header__right" v-if="board">
        <div class="actions">
          <div class="members-dropdown-wrapper">
            <button type="button" class="secondary" @click="toggleMembers">👤 Members</button>
            <div v-if="showMembers" class="members-dropdown">
              <div class="members-title">Members</div>
              <div class="member-list">
                <template v-if="memberList.length">
                  <div v-for="member in memberList" :key="member.id" class="member-row">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="member-role">{{ member.role }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="member-empty">No members yet</div>
                </template>
              </div>
              <div class="invite-section">
                <template v-if="showInvite">
                  <input
                    v-model="inviteUsername"
                    class="invite-input"
                    placeholder="Username to invite"
                    @keyup.enter="sendInvite"
                  />
                  <button class="primary" @click="sendInvite">Send</button>
                  <button class="secondary" @click="cancelInvite">Cancel</button>
                  <div v-if="inviteError" class="invite-error">{{ inviteError }}</div>
                </template>
                <template v-else>
                  <button class="primary" @click="openInvite">✉ Invite</button>
                </template>
              </div>
            </div>
          </div>
          <template v-if="showNewColumn">
            <input
              ref="newColumnInput"
              v-model="newColumnName"
              class="column-input"
              placeholder="New column name"
              @keyup.enter="createColumn"
              style="width: 300px; margin-right: 0rem;"
            />
            <button class="primary" @click="createColumn">Create</button>
            <button class="secondary" @click="cancelAddColumn">Cancel</button>
          </template>
          <button v-else class="primary add-column-btn" @click="startAddColumn">+ New Column</button>
        </div>
      </div>
    </header>

    <div v-if="!board" class="empty">
      <p>Unable to find this board.</p>
    </div>

    <div v-else class="detail-content columns-area">
      <div class="columns-list">
        <div v-for="col in columns" :key="col.id" class="column-card">
          <div class="column-header">
            <template v-if="renamingColumnId === col.id">
              <input
                ref="renamingColumnInput"
                v-model="renamingColumnName"
                class="column-input"
                @keyup.enter="saveRenameColumn(col)"
                @blur="saveRenameColumn(col)"
                style="width: 70%"
              />
              <div class="editor">
                <button type="button" class="save" @click="saveRenameColumn(col)">Save</button>
                <button type="button" class="cancel" @click="cancelRenameColumn">Cancel</button>
              </div>
            </template>
            <template v-else>
              <span class="column-title column-title-wrap" style="max-width: 220px;">{{ col.name }}</span>
              <div class="column-actions">
                <button type="button" class="edit" @click="startRenameColumn(col)">✎ Edit</button>
                <button type="button" class="delete" @click="deleteColumn(col)">🗑 Delete</button>
              </div>
            </template>
          </div>




          <div class="tasks-area">
            <template v-if="tasksByColumn(col.id).length === 0">
              <div class="no-task-label">No task yet!</div>
            </template>
            <draggable
              v-model="taskLists[col.id]"
              :group="'tasks-' + col.id"
              item-key="id"
              class="draggable-tasks"
              @end="() => onTaskReorder(col.id)">
              <template #item="{ element: task }">
                <div class="task-card">
                  <template v-if="showEditTask[task.id]">
                    <input
                      :ref="el => { if (el) editTaskInput[task.id] = el }"
                      v-model="editTaskTitle[task.id]"
                      class="task-input"
                      placeholder="Edit task title"
                      @keyup.enter="saveEditTask(task.id)"
                      style="width: 100%"
                    />
                    <div class="edit-task-actions">
                      <button class="save" @click="saveEditTask(task.id)">Save</button>
                      <button class="cancel" @click="closeEditTask(task.id)">Cancel</button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="task-title">
                      <span class="task-title" style="max-width: 180px; display: inline-block; word-break: break-word; white-space: pre-line; overflow-wrap: break-word;">{{ task.title }}</span>
                    </div>
                    <div v-if="Array.isArray(task.assignedTo) && task.assignedTo.length" class="task-assigned">
                      Assigned:
                      <span v-for="userId in task.assignedTo" :key="userId" style="margin-right: 0.3rem;">{{ getUserName(userId) }}</span>
                    </div>
                    <div class="task-actions">
                      <div class="assign-dropdown-wrapper">
                        <button type="button" class="assign" @click="openAssignDropdown(col.id, task.id)">Assign</button>
                        <div v-if="showAssignDropdown[task.id]" class="assign-dropdown">
                          <div class="assign-title">Assign to</div>
                          <div class="assign-list">
                            <div v-for="member in memberList" :key="member.id" class="assign-row">
                              <button
                                class="secondary"
                                :class="{ assigned: Array.isArray(task.assignedTo) && task.assignedTo.includes(member.id) }"
                                @click="toggleAssignMember(task.id, member.id)"
                              >
                                <span>{{ member.name }} <span style="color:#888;font-size:0.95em;">({{ member.role }})</span></span>
                                <dev v-if="Array.isArray(task.assignedTo) && task.assignedTo.includes(member.id)" style="color:#2563eb;margin-left:0.5rem;"></dev>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="edit" @click="openEditTask(task.id, task.title)">✎ Edit</button>
                      <button type="button" class="delete" @click="deleteTask(task.id, task.title)">🗑 Delete</button>
                    </div>
                  </template>
                </div>
              </template>
            </draggable>
          </div>




          
          <div class="add-task">
            <template v-if="showAddTask[col.id]">
              <input
                :ref="el => { if (el) newTaskInput[col.id] = el }"
                v-model="newTaskTitle[col.id]"
                class="task-input"
                placeholder="Task title"
                @keyup.enter="createTask(col.id)"
                style="width: 100%"
              />
              <div class="add-task-actions">
                <button class="add" @click="createTask(col.id)">Add</button>
                <button class="cancel" @click="cancelAddTask(col.id)">Cancel</button>
              </div>
            </template>
            <button v-else class="secondary add-task-btn" @click="startAddTask(col.id)">+ Add Task</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail-page {
  padding: 1.25rem;
  max-width: 1080px;
  width: min(100%, 1080px);
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

 .detail-header__left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1 1 auto;
  min-width: 220px;
 }

.members-dropdown-wrapper {
  position: relative;
}
.members-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  min-width: 260px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.13);
  z-index: 20;
  padding: 1rem 1rem 0.75rem 1rem;
}
.members-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.member-list {
  max-height: 180px;
  overflow-y: auto;
  display: grid;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}
.member-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.7rem;
  background: rgba(243, 244, 246, 0.7);
  border-radius: 8px;
}
.member-name {
  font-weight: 600;
}
.member-role {
  font-size: 0.85rem;
  color: #6b7280;
}
.member-empty {
  padding: 0.7rem;
  text-align: center;
  color: #6b7280;
}
.invite-section {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.invite-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}
.invite-error {
  color: #dc2626;
  font-size: 0.9rem;
}
.meta .label {
  display: inline-block;
  font-weight: 600;
  margin-right: 0.35rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.primary {
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.65rem 1rem;
  cursor: pointer;
  font-weight: 600;
}

.primary:hover {
  background: #1d4ed8;
}

.secondary {
  background: rgba(107, 114, 128, 0.12);
  border: 1px solid rgba(107, 114, 128, 0.25);
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
}

.secondary:hover {
  background: rgba(107, 114, 128, 0.2);
}


.columns-area {
  padding: 1rem 0;
  overflow-x: auto;
}
.columns-list {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}
.column-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-width: 340px;
  max-width: 420px;
  min-height: 420px;
  padding: 1.5rem 1.25rem 1.25rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.column-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.column-title {
  font-weight: 700;
  font-size: 1.1rem;
  flex: 1 1 auto;
}
.column-title-wrap {
  word-break: break-word;
  white-space: pre-line;
  display: block;
  max-width: 100%;
  overflow-wrap: break-word;
}
.column-actions button {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.85rem;
}
.column-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-start;
}
.column-actions .delete {
  border-color: rgba(239, 68, 68, 0.7);
  color: #dc2626;
}
.column-actions .delete:hover {
  background: rgba(254, 202, 202, 0.2);
}
.column-actions .edit {

}
.column-actions .edit:hover {
  background: rgba(243, 244, 246, 0.9);
}

.editor {
  display: flex;
  gap: 0.5rem;
}
.editor .save {
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
  font-weight: 600;
}
.editor .save:hover {
  background: #1d4ed8;
}
.editor .cancel {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
}
.editor .cancel:hover {
  background: rgba(107, 114, 128, 0.12);
}

.add-task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.add-task-btn {
  font-size: 1rem;
  align-items: center;
  padding: 0.4rem 7.2rem;
}
.add-task-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-start;
}
.add-task-actions button {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.85rem;
}
.add-task-actions .add {
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
  font-weight: 600;
}
.add-task-actions .add:hover {
  background: #1d4ed8;
}
.add-task-actions .cancel {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
}
.add-task-actions .cancel:hover {
  background: rgba(107, 114, 128, 0.12);
}

.task-input {
  padding: 0.5rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.tasks-area {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.task-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  overflow: visible;
}
.task-title {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
}
.task-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-start;
}

.task-actions .assign {
  border-color: rgba(16, 185, 129, 0.7);
  color: #10b981;
}
.task-actions .edit {
  
}
.task-actions .edit:hover {
  background: rgba(243, 244, 246, 0.9);
}
.task-actions .delete {
    border-color: rgba(239, 68, 68, 0.7);
  color: #dc2626;
}
.task-actions button {
    display: flex;
  flex-direction: column;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.85rem;
}

.edit-task-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}
.edit-task-actions .save {
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
  font-weight: 600;
}
.edit-task-actions .save:hover {
  background: #1d4ed8;
}
.edit-task-actions .cancel {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
}
.edit-task-actions .cancel:hover {
  background: rgba(107, 114, 128, 0.12);
}

.column-input {
  padding: 0.5rem 0.85rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 1.25rem;
  min-width: 307px;
}
.add-column-btn {
  min-width: 180px;
  align-self: flex-start;
}
.tasks-area {
  min-height: 0px;
}
          .no-task-label {
            color: #6b7280;
            font-size: 1rem;
            text-align: center;
            margin-bottom: 0.7rem;
          }
          .assign-dropdown-wrapper {
            position: relative;
          }
          .assign-dropdown {
            position: absolute;
            top: 120%;
            left: 0;
            min-width: 160px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            z-index: 10;
            padding: 0.7rem 0.7rem 0.5rem 0.7rem;
          }
          .assign-title {
            font-weight: 600;
            margin-bottom: 0.4rem;
          }
          .assign-list {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            margin-bottom: 0.3rem;
          }
          .assign-row button {
            width: 100%;
            text-align: left;
          }
          .task-assigned {
            font-size: 0.92rem;
            color: #2563eb;
          }

.assign-row button.assigned {
  background: #e0e7ff;
  border-color: #2563eb;
}
.empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.75rem;
}

</style>