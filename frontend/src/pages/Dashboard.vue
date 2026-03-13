<script setup>

import {appFetch} from "../api.js";
import {onMounted, ref} from "vue";

const chats = ref([])

// создание вебсокет соединения и его обработка
const ws = new WebSocket('ws://localhost:6001');
ws.onopen = () => ws.send(JSON.stringify({ type: 'join', role: 'admin' }))
ws.onmessage = ({ data }) => {
  const payload = JSON.parse(data);

  if (payload.type === 'new_message') {
    const chat = chats.value.find(i => i.id === payload.chat_id)
    chat.last_message = payload.message
    chat.is_readed = false
  }
}

// запрос данных
const fetchData = async () => {
  const chatsResponse = await appFetch(`/chats`)
  if (chatsResponse.data) chats.value = chatsResponse.data.chats
}

onMounted(async() => {
  await fetchData()
})

// форматтер времени
const formatDate = (date) => new Intl.DateTimeFormat('ru-Ru', {hour: '2-digit', minute: '2-digit'}).format(date)
</script>

<template>
  <div class="container">
    <div class="container-top">
      <h2>Панель управления</h2>
      <RouterLink :to="{name: 'LoginAdmin'}" class="btn btn-primary">Выйти</RouterLink>
    </div>
    <div class="h5 mt-3">Чаты</div>
    <div class="chats mt-3">
      <RouterLink :to="{name: 'ChatAdmin', params: {chat_id: chat.id}}" v-for="chat in chats" class="chat">
        <div class="chat__is-unread" v-if="!chat.is_readed"></div>
        <div class="chat__who">
          {{chat.user.login}}
        </div>
        <span class="chat__message">
          {{chat?.last_message?.description}}
        </span>
        <div class="chat__date">
          {{formatDate(new Date(chat?.last_message ? chat?.last_message.created_at : chat.created_at))}}
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.chats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.chat {
  position: relative;
  width: 200px;
  height: 160px;
  border-radius: 18px;
  background-color: rgba(0,0,0,0.05);
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.chat__who {
  font-size: 24px;
  font-weight: 600;
}

.chat__date {
  margin-top: auto;
  margin-left: auto;
}

.chat__is-unread {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: red;
}
</style>