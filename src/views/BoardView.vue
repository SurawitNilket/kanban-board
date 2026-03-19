<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/store'

const store = useStore()
const router = useRouter()

const boards = computed(() => store.myBoards)

const creating = ref(false)
const newBoardName = ref('')
const newBoardInput = ref(null)

const renamingBoardId = ref(null)
const renameValue = ref('')
const renamingBoardInput = ref(null)

const startCreate = () => {
  creating.value = true
  newBoardName.value = ''
  nextTick(() => {
    if (newBoardInput.value) newBoardInput.value.focus()
  })
}

const cancelCreate = () => {
  creating.value = false
  newBoardName.value = ''
}

const saveCreate = () => {
  const name = newBoardName.value.trim()
  if (!name) return
  const id = store.addBoard(name)
  cancelCreate()
  router.push({ name: 'board-detail', params: { boardId: id } })
}

const openBoard = (boardId) => {
  router.push({ name: 'board-detail', params: { boardId } })
}

const startRename = (board) => {
  renamingBoardId.value = board.id
  renameValue.value = board.name
  nextTick(() => {
    if (renamingBoardInput.value) renamingBoardInput.value.focus()
  })
}

const cancelRename = () => {
  renamingBoardId.value = null
  renameValue.value = ''
}

const saveRename = (board) => {
  const name = renameValue.value.trim()
  if (!name || name === board.name) return cancelRename()
  store.renameBoard(board.id, name)
  cancelRename()
}

const handleDelete = (board) => {
  if (window.confirm(`Delete board "${board.name}"? This cannot be undone.`)) {
    store.deleteBoard(board.id)
  }
}

const getUserName = (userId) => {
  const user = store.data.users.find(u => u.id === userId)
  return user ? user.name : 'Unknown'
}
</script>

<template>
  <section class="board-page">
    <header class="board-header">
      <h2>My Boards</h2>

      <div class="header-actions">
        <template v-if="creating">
          <input
            ref="newBoardInput"
            v-model="newBoardName"
            class="input"
            placeholder="New board name"
            @keyup.enter="saveCreate"
          />
          <button class="primary" @click="saveCreate">Create</button>
          <button class="secondary" @click="cancelCreate">Cancel</button>
        </template>

        <button v-else class="primary" @click="startCreate">+ New Board</button>
      </div>
    </header>






    <div v-if="!boards.length" class="empty">
      <p>No boards yet. Click “New Board” to start.</p>
    </div>

    <div v-else class="board-grid">
      <article
        v-for="board in boards"
        :key="board.id"
        class="board-card clickable"
        @click="openBoard(board.id)"
      >
        <div class="board-card__header">
          <template v-if="renamingBoardId === board.id">
            <input
              ref="renamingBoardInput"
              v-model="renameValue"
              class="board-input"
              @keyup.enter="saveRename(board)"
              @keyup.esc="cancelRename"
              @click.stop
            />
            <div class="board-card__actions">
              <button type="button" class="save" @click.stop="saveRename(board)">Save</button>
              <button type="button" class="cancel" @click.stop="cancelRename">Cancel</button>
            </div>
          </template>
          <template v-else>
            <h2 class="board-name-wrap">{{ board.name }}</h2>
            <span class="board-card__actions">
              <template v-if="store.currentUser === board.owner">
                <button type="button" class="rename" @click.stop="startRename(board)">✎ Rename</button>
                <button type="button" class="delete" @click.stop="handleDelete(board)">🗑 Delete</button>
              </template>
            </span>
          </template>
        </div>

        <div class="board-card__details">
          <div>
            <span class="label">Owner</span>
            <span>{{ getUserName(board.owner) }}</span>
          </div>
          <div>
            <span class="label">Members</span>
            <span>{{ board.members.length }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.board-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.board-header h2 {
  margin: 0;
  font-size: 1.75rem;
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

.empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.board-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.board-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.board-card.clickable {
  cursor: pointer;
}

.board-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.board-card__header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.board-card__header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.board-name-wrap {
  word-break: break-word;
  white-space: pre-line;
  display: block;
  max-width: 100%;
  overflow-wrap: break-word;
}

.board-card__actions {
  display: flex;
  gap: 0.5rem;
}

.board-input {
  padding: 0.5rem 0.85rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 1.25rem;
  min-width: 307px;
}

.input {
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 1rem;
  min-width: 300px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.board-card__actions button {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.85rem;
}

.board-card__actions button:hover {
  background: rgba(243, 244, 246, 0.9);
}

.board-card__actions .rename {

}
.board-card__actions .rename:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.board-card__actions .delete {
  border-color: rgba(239, 68, 68, 0.7);
  color: #dc2626;
}
.board-card__actions .delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.5);
}

.board-card__actions .save {
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem 3.5rem;
  cursor: pointer;
  font-weight: 600;
}

.board-card__actions .save:hover {
  background: #1d4ed8;
}

.board-card__actions .cancel {
  padding: 0.5rem 3.5rem;
}
.board-card__actions .cancel:hover {
  background: rgba(243, 244, 246, 0.9);
}

.board-card__details {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.board-card__details .label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
