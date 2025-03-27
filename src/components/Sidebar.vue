<template>
    <div class="bg-white border-r py-5 space-y-10 h-screen overflow-y-auto">
        <div class="flex items-center justify-center gap-x-3">
            <img src="../assets/277741668_347625477389163_2974931926985871192_n-removebg-preview.png" class="w-14 aspect-square" />
            <h1 class="font-medium text-xl">BFH - Admin</h1>
        </div>
        <nav class="space-y-1">
            <router-link :to="{ name: 'dashboard' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="gala:chart" class="text-2xl" />
                <span class="text-xl">Dashboard</span>
            </router-link>
            <router-link :to="{ name: 'notifications' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="mdi:bell-outline" class="text-2xl" />
                <span class="text-xl">Notifications</span>
                <div v-if="hasUnviewNotifications()" class="w-3 aspect-square bg-red-500 rounded-full ml-auto"></div>
            </router-link>
            <router-link :to="{ name: 'roomTypes' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="material-symbols-light:bedroom-child-outline" class="text-3xl" />
                <span class="text-xl">Room Types</span>
            </router-link>
            <router-link :to="{ name: 'rooms' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="material-symbols-light:bedroom-child-outline" class="text-3xl" />
                <span class="text-xl">Rooms</span>
            </router-link>
            <router-link :to="{ name: 'promos' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="lsicon:badge-promotion-outline" class="text-3xl" />
                <span class="text-xl">Promos</span>
            </router-link>
            <router-link :to="{ name: 'bookings' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="basil:book-mark-outline" class="text-3xl" />
                <span class="text-xl">Bookings</span>
            </router-link>
            <router-link :to="{ name: 'staffs' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="healthicons:city-worker-outline" class="text-3xl" />
                <span class="text-xl">Staffs</span>
            </router-link>
            <router-link :to="{ name: 'archivedStaffs' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="healthicons:city-worker-outline" class="text-3xl" />
                <span class="text-xl">Archived Staffs</span>
            </router-link>
            <router-link :to="{ name: 'roomsToClean' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="guidance:cleaning-room" class="text-3xl" />
                <span class="text-xl">Rooms To Clean</span>
            </router-link>
            <router-link :to="{ name: 'inventory' }" class="flex items-center gap-x-2 px-4 py-3">
                <Icon icon="material-symbols-light:inventory-rounded" class="text-3xl" />
                <span class="text-xl">Inventory</span>
            </router-link>
        </nav>

        <div class="w-full flex justify-center">
            <button class="border border-custom-primary text-custom-primary w-3/4 rounded py-1 flex items-center justify-center gap-x-2" @click="logout">
                <Icon icon="ph:sign-out-fill" class="text-xl" />
                <span>Sign Out</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { auth } from '../config/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useAuthStore, useDataStore } from '../store'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

const notifications = computed(() => dataStore.notifications)

const hasUnviewNotifications = () => {
    const unviewNotif = notifications.value.some(notif => !notif.isView)

    return unviewNotif
}

const logout = async () => {
    try {
        await signOut(auth)

        authStore.logout()
        router.push('/')
    } catch (error) {
        console.log('Failed to logout')
    }
}

onMounted(() => {
    dataStore.getNotifications()
})
</script>

<style scoped>
.router-link-active {
    background-color: #e5e7eb;
}
</style>