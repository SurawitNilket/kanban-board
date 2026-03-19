<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TopBar from './components/TopBar.vue'

const route = useRoute()
const showTopBar = computed(() => !['login', 'register'].includes(route.name))
</script>

<template>
  <div id="app">
    <TopBar v-if="showTopBar" />
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
