<script setup>
import {inject} from "vue";

defineProps({
  name: String
})
defineOptions({
  inheritAttrs: false
})

const model = defineModel()
const errors = inject('errors')
</script>

<template>
  <div>
    <input v-model="model" :name="name" class="form-control" :class="{'is-invalid': errors?.[name]?.[0]}" v-bind="$attrs"/>
    <div v-if="errors?.[name]?.[0]" class="invalid-feedback">
      {{errors?.[name]?.[0]}}
    </div>
  </div>
</template>
<style scoped>

</style>