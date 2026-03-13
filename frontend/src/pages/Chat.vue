<script setup>
import {nextTick, onMounted, provide, reactive, ref} from "vue";
import {appFetch, handleApiSubmit} from "../api.js";
import {useRoute} from "vue-router";
import Back from "../components/Back.vue";

const messagesRef = ref(null)
const pastedImage = ref()
const isAdmin = localStorage.getItem('is_admin') === '1'
const users = ref({})
const route = useRoute()
const chatId = route.params?.chat_id
const messages = ref(null)
const formErrors = ref()
provide('errors', formErrors)

const form = reactive({
  description: ''
})

// создание вебсокет соединения
const ws = new WebSocket('ws://localhost:6001');
ws.onopen = () =>
    isAdmin ? ws.send(JSON.stringify({ type: 'join', role: 'admin' })) : ws.send(JSON.stringify({ type: 'join', chat_id: chatId }))
ws.onmessage = async ({ data }) => {
  const payload = JSON.parse(data);

  if (payload.type === 'new_message' && messages.value) {
    messages.value.unshift(payload.message)
  }

  // установка статуса "Прочитано"
  if (isAdmin) {
    await appFetch(`/chats/${chatId}/read`, {method: 'POST'})
  }
}

// отправка формы
const handleSubmit = async () => {
  const formData = new FormData()
  if (form.description) formData.append('description', form.description)
  if (form.image) formData.append('image', form.image)

  await handleApiSubmit(
      () => appFetch(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: formData
      }, true),
      formErrors,
  )

  form.description = ''
  pastedImage.value = null
}

const handlePaste = (e) => {
  const items = e.clipboardData?.items
  console.log(items)
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      console.log(file)
      form.image = file

      const reader = new FileReader()
      reader.onload = event => pastedImage.value = event.target.result
      reader.readAsDataURL(file)
      break
    }
  }
}

const fetchData = async () => {
  const chatResponse = await appFetch(`/chats/${chatId}`)
  if (chatResponse.data) messages.value = chatResponse.data.chat.messages
}

onMounted(async() => {
  await fetchData()
  await nextTick()

  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
})

const formatDate = (date) => new Intl.DateTimeFormat('ru-Ru', {hour: '2-digit', minute: '2-digit'}).format(date)
</script>

<template>
  <Back to-name="Dashboard" v-if="isAdmin "/>
  <div class="chat">
    <div class="messages" :ref="messagesRef">
      <div v-for="message in messages" class="message message-admin">
        <div class="message-author">
          {{message.user.login}}
        </div>
        <div class="message-image" v-if="message.image">
          <img :src="message.imageUrl" class="img img-thumbnail" alt="фото" >
        </div>
        <div class="message-text">
          {{message.description}}
        </div>
        <div class="message-time">
          {{formatDate(new Date(message?.created_at))}}
        </div>
      </div>
      <div v-if="messages === null" class="d-flex gap-2 align-items-center">
        <div class="spinner-border"></div>
        Загрузка...
      </div>
      <div v-else-if="messages.length === 0" class="d-flex gap-2 align-items-center">
        Нет сообщений
      </div>
    </div>
    <div class="send">
      <div class="send-image" v-if="pastedImage">
        <img :src="pastedImage" class="img img-thumbnail" alt="фото">
      </div>

      <div class="input-group">
        <input @paste="handlePaste" v-model="form.description" name="description" type="text" class="form-control" placeholder="Напишите сообщение...">
        <button class="btn btn-primary" @click="handleSubmit">Отправить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat {
  padding: 40px 0;
  width: 30%;
  display: flex;
  flex-direction: column;
  margin: auto;
  height: 100dvh;
}

.messages {
  display: flex;
  flex-direction: column-reverse;
  gap: 24px;
  overflow: auto;
  scrollbar-width: thin;
  margin-bottom: 20px;
}

.message {
  background-color: rgba(0,0,0,0.05);
  border-radius: 12px;
  padding: 16px;
  font-size: 18px;
}

.message-author {
  font-size: 14px;
  font-weight: 700;
}

.message-time {
  display: block;
  font-size: 16px;
  color: rgba(0,0,0,0.5);
  font-weight: 700;
  margin-left: auto;
  text-align: right;
}

.send {
  position: sticky;
  margin-top: auto;
  bottom: 40px;
}
</style>