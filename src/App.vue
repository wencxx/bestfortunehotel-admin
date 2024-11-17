<template>
  <div class="h-screen w-screen bg-gray-100 flex font-Inter">
      <sideBar v-if="isAuth" class="w-[20dvw] xl:w-2/12 h-screen" />
      <div :class="['w-full', {'w-[80dvw] xl:w-10/12': isAuth}]">
        <Header :class="['hidden h-[8dvh] border-b w-full bg-white', {'!flex': isAuth}]" />
        <router-view class="h-[92dvh] overflow-y-auto" />
      </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import sideBar from "./components/Sidebar.vue";
import Header from './components/Header.vue'
import { useAuthStore } from './store'

const authStore = useAuthStore()
const isAuth = computed(() => authStore.isAuth)
</script>