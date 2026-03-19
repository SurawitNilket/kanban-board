<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/store'

const store = useStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleRegister = () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  const userId = store.register(username.value, password.value)
  if (userId) {
    store.login(username.value, password.value)
    router.push('/board')
  } else {
    error.value = 'Username already exists'
  }
}
</script>

<template>
  <div class="register-container">
    <h1>Register to Kanban Board</h1>
    <form @submit.prevent="handleRegister">
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
      <button type="submit" class="register-btn">Register</button>
    </form>
    <p class="login-link">
      Already have an account?
      <router-link to="/login">Login here</router-link>
    </p>
  </div>
</template>

<style scoped>
.register-container {
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

.register-btn {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.register-btn:hover {
  background-color: #218838;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>