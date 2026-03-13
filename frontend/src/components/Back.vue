<script setup>
// компонент для возвращения назад
defineProps({
  toName: String
})
</script>

<template>
<RouterLink :to="{name: toName}" class="back">
  < Назад
</RouterLink>
</template>

<style scoped>
.back {
  position: absolute;
  top: 20px;
  left: 15px;
}
</style>