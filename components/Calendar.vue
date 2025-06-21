<script setup>
  import { ref } from 'vue'
  import { CalendarDate } from '@internationalized/date'
  const now = new Date()
  const value = ref(new CalendarDate(now.getFullYear(), now.getMonth()+1, now.getDate()))

  // 親コンポーネントにイベントを伝えるためのemitを定義
  const emit = defineEmits(['select-date'])

  function handleSelect(newValue) {
    //value.value = newValue
    emit('select-date', newValue) // 選択された日付をindex.vueに伝える
  }
</script>

<template>
  <UCalendar v-model="value"/>
</template>