<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/store'

const store = useStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  const success = store.login(username.value, password.value)
  if (success) {
    router.push('/board')
  } else {
    error.value = 'Invalid username or password'
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Login to Kanban Board</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Enter username"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter password"
          required
        />
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <button type="submit" class="login-btn">Login</button>
    </form>
    <p class="register-link">
      Don't have an account?
      <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.error {
  color: red;
  margin-bottom: 10px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-btn:hover {
  background-color: #0056b3;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>