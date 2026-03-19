<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/store'

const store = useStore()
const router = useRouter()
const showNotifications = ref(false)

const unreadCount = computed(() => store.unreadNotifications.length)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const logout = () => {
  store.logout()
  router.push('/login')
}

const markAllRead = () => {
  store.data.notifications.forEach(n => {
    if (n.userId === store.currentUser) n.read = true
  })
  store.persist()
}

const clearAllNotifications = () => {
  store.data.notifications = store.data.notifications.filter(n => n.userId !== store.currentUser)
  store.persist()
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <span class="brand">Kanban Board</span>
    </div>

    <div class="topbar-right">
      <button class="notif" type="button" @click="toggleNotifications">
        🕭
        <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
      </button>

      <div v-if="showNotifications" class="notif-popover">
        <div class="notif-header">
          <span class="notif-title">Notifications</span>
          <button class="mark-read" type="button" @click="markAllRead">Mark all read</button>
          <button class="mark-read" type="button" @click="clearAllNotifications" style="margin-left:0.7rem;color:#dc2626;">Clear all</button>
        </div>
        <ul>
          <li v-for="note in store.data.notifications.filter(n => n.userId === store.currentUser).slice().reverse()" :key="note.id">
            <span :class="{ unread: !note.read }">{{ note.message }}</span>
          </li>
          <li v-if="!store.data.notifications.some(n => n.userId === store.currentUser)">No notifications</li>
        </ul>
      </div>

      <span class="current-user">{{ store.currentUserName }}</span>
      <button class="logout" type="button" @click="logout">Logout</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #1f2937;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.notif {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.45rem 0.75rem;
  color: white;
  cursor: pointer;
}

.badge {
  margin-left: 0.35rem;
  background: #ef4444;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.notif-popover {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 340px;
  min-height: 180px;
  background: white;
  color: #111827;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 10;
  padding: 1.1rem;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.notif-title {
  font-size: 1rem;
  font-weight: 700;
}

.mark-read {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
}

.notif-popover ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 240px;
  overflow-y: auto;
}

.notif-popover li {
  padding: 0.35rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.notif-popover li:last-child {
  border-bottom: 0;
}

.unread {
  font-weight: 600;
}

.current-user {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.logout {
  background: rgba(239, 68, 68, 0.85);
  border: none;
  color: white;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.logout:hover {
  background: rgba(239, 68, 68, 1);
}
</style>
