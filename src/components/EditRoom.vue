<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="updateRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Update Room</h1>
            <div class="flex flex-col gap-y-1">
                <label >Room Type<span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="roomDetails.roomType">
                    <option value="">Select Room Type</option>
                    <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">{{ roomType.roomName }}</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Floor <span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="roomDetails.roomFloor">
                    <option value="">Select Room Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>3rd Floor</option>
                    <option>4th Floor</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Number <span class="text-custom-primary">*</span></label>
                <input type="number" class="border rounded pl-2 h-8" v-model="roomDetails.roomNumber">
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Status <span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="roomDetails.roomStatus">
                    <option value="">Select Room Status</option>
                    <option>Available</option>
                    <option>Unavailable</option>
                </select>
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!updatingRoom" class="bg-custom-primary w-1/4 rounded text-white">Update</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Updating</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue'
import { db } from '../config/firebaseConfig'
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()

const emit = defineEmits(['closeModal'])
const { roomDetailsToEdit } = defineProps({
    roomDetailsToEdit: Object
})

const closeModal = () => {
    emit('closeModal')
}

onMounted(() => {
    getRoomType()
})

const roomTypes = ref([])

const roomRef = collection(db, 'rooms')

const getRoomType = async () => {
    try {
        const snapshots = await getDocs(roomRef)

        snapshots.docs.forEach(doc => {
            roomTypes.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log('Failed to get room types')
    }
}


const roomDetails = ref({
    roomType: roomDetailsToEdit.roomType || '',
    roomFloor: roomDetailsToEdit.roomFloor || '',
    roomNumber: roomDetailsToEdit.roomNumber || '',
    roomStatus: roomDetailsToEdit.roomStatus || '',
})

const updatingRoom = ref(false)
const updateRoom = async () => {
    try {
        updatingRoom.value = true
        await updateDoc(doc(db, 'roomNumbers', roomDetailsToEdit.id), roomDetails.value)

        $toast.success('Room updated successfully')
        emit('closeModal', {
            id: roomDetailsToEdit.id,
            ...roomDetails.value
        })
    } catch (error) {
        console.log(error)
        $toast.error('Failed to update room')
    } finally {
        updatingRoom.value = false
    }
}

</script>