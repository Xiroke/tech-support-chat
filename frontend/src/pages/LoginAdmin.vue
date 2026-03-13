<script setup>

import {appFetch, handleApiSubmit} from "../api.js";
import {provide, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import Input from "../components/Input.vue";

const router = useRouter()
const form = reactive({
  login: '',
  password: '',
})
const formErrors = ref()
provide('errors', formErrors)

// отправка формы
const handleSubmit = () => handleApiSubmit(
    () => appFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify(form),
    }),
    formErrors,
    async (data) => {
      localStorage.setItem('token', data?.token)
      localStorage.setItem('is_admin', data?.user.is_admin)
      await router.push({name: 'Dashboard'})
    }
)
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="form-page__form">
      <h2>Авторизация</h2>
      <Input v-model="form.login" name="login" placeholder="Логин" />
      <Input v-model="form.password" name="password" type='password' placeholder="Пароль" />
      <button class="btn btn-primary">Войти</button>
    </form>
  </div>
</template>

<style scoped>

</style>