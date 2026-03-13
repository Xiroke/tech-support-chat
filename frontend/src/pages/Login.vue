<script setup>
// страница для входа обычного пользователя
import Input from "../components/Input.vue";
import {appFetch, handleApiSubmit} from "../api.js";
import {provide, reactive, ref} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()
const form = reactive({
  login: '',
})
const formErrors = ref()
provide('errors', formErrors)

// отправка формы
const handleSubmit = () => handleApiSubmit(
    () => appFetch('/login', {
      method: 'POST',
      body: JSON.stringify(form),
    }),
    formErrors,
    async (data) => {
      localStorage.setItem('token', data?.token)
      localStorage.setItem('is_admin', data?.user.is_admin)
      await router.push({name: 'Chat', params: {chat_id: data?.chat.id}})
    }
)

</script>

<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="form-page__form">
      <h2>Написать в тех-поддержку</h2>
      <Input v-model="form.login" name="login" placeholder="Логин" />
      <button class="btn btn-primary">Войти</button>
    </form>
  </div>
</template>

<style scoped>

</style>