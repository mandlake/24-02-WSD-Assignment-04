<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
})
</script>

<style>
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar, body::-webkit-scrollbar {
  width: 0;
  height: 0;
}



</style>
