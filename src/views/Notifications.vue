<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="mdi:bell-outline" class="text-4xl" />
            <h1 class="text-xl">Notifications</h1>
        </div>
        <div class="space-y-2">
            <div class="mb-5 flex justify-between">
                <select class="py-1 px-2 rounded" v-model="filterSelect">
                    <option value="">All notifications</option>
                    <option>New</option>
                    <option>Old</option>
                </select>
                <div class="space-x-2">
                    <button class="bg-blue-500 text-white px-2 py-1 rounded" @click="markAllNotifications">Mark All</button>
                    <button class="bg-orange-500 text-white px-2 py-1 rounded" @click="unMarkAllNotifications">Unmark All</button>
                    <button class="bg-red-500 text-white px-2 py-1 rounded" @click="deleteNotifications">Delete</button>
                </div>
            </div>
            <div v-if="fileredNotifications().length">
                <div v-for="(notification, index) in fileredNotifications()" :key="index" class="flex items-center gap-x-5 shadow rounded p-3">
                    <input type="checkbox" :value="notification.id" class="w-5 aspect-square" v-model="markedNotif">
                    <div>
                        <h2 class="text-lg font-medium">{{ notification.notif }}</h2>
                        <p class="text-xs text-gray-500 -mt-1">{{ convertDate(notification.notifiedAt) }}</p>
                    </div>
                    <div v-if="!notification.isRead" class="ml-auto bg-green-500 px-4 py-1 rounded text-white">
                        <p>New</p>
                    </div>
                </div>
            </div>
            <p v-else class="text-center">No Notifications to show</p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDataStore } from '../store'
import { db } from '../config/firebaseConfig'
import { collection, updateDoc, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore'
import moment from 'moment'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()

const dataStore = useDataStore()

const notifications = computed(() => dataStore.notifications)

// filtered notifications
const filterSelect = ref('')

const fileredNotifications = () => {
    if(!filterSelect.value) return notifications.value

    if(filterSelect.value === 'New'){
        return notifications.value.filter(notif => notif.isRead === false)
    }else{
        return notifications.value.filter(notif => notif.isRead === true)
    }
}

onMounted(() => {
    viewAllNotifications()
})

onUnmounted(() => {
    readAllNotifications()
})

const notifRef = collection(db, 'notifications')

// view all notifications on mounted 
const viewAllNotifications = async () => {
    try {
        const q = query(
            notifRef,
            where('isView', '==', false)
        )
        const snapshots = await getDocs(q)

        for(const snapshot of snapshots.docs){
            const docRef = doc(db, 'notifications', snapshot.id)
            await updateDoc(docRef, {
                isView: true
            })
        }

    } catch (error) {
        console.log(error)
    }
}

// read all notifications on mounted 
const readAllNotifications = async () => {
    try {
        const q = query(
            notifRef,
            where('isRead', '==', false)
        )
        const snapshots = await getDocs(q)

        for(const snapshot of snapshots.docs){
            const docRef = doc(db, 'notifications', snapshot.id)
            await updateDoc(docRef, {
                isRead: true
            })
        }

    } catch (error) {
        console.log(error)
    }
}

// convert date
const convertDate = (timestamp) => {
    const date = timestamp.toDate()

    return moment(date).calendar()
}

const markedNotif = ref([])

// mark all notifications
const markAllNotifications = () => {
    for(const notif of notifications.value){
        markedNotif.value.push(notif.id)
    }
}

// unmark all notifications
const unMarkAllNotifications = () => {
    markedNotif.value = []
}

// delete notifications
const deleteNotifications = async () => {
    try {
        for(const notif of markedNotif.value){
            const docRef = doc(db, 'notifications', notif)

            await deleteDoc(docRef)
        }

        $toast.success('Deleted marked notifications successfully.')
    } catch (error) {
        console.log(error)   
        $toast.error('Failed to delete notifications.')
    }
}
</script>