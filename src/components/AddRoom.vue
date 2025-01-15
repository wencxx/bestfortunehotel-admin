<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="addRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Add Room</h1>
            <div v-if="err" class="col-span-2">
                <p class="bg-red-500 text-white pl-2 py-1 rounded">Failed adding room</p>
            </div>
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
                <button v-if="!addingRoom" class="bg-custom-primary w-1/4 rounded text-white">Add</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Adding</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { db, storage } from '../config/firebaseConfig'
import { addDoc, collection, getDocs } from 'firebase/firestore'

const emit = defineEmits(['closeModal'])

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
        console.log('Failed to get rooms')
    }
}

const roomDetails = ref({
    roomType: '',
    roomFloor: '',
    roomNumber: '',
    roomStatus: '',
})


// add room
const err = ref(false)
const addingRoom = ref(false)
const roomNumbersRef = collection(db, 'roomNumbers')
const addRoom = async () => {
  err.value = false
  try {
    addingRoom.value = true
    const roomData = {
      roomType: roomDetails.value.roomType,
      roomFloor: roomDetails.value.roomFloor,
      roomNumber: parseInt(roomDetails.value.roomNumber),
      roomStatus: roomDetails.value.roomStatus,
      createdAt: new Date()
    }

    await addDoc(roomNumbersRef, roomData)

    resetForm()
    emit('closeModal', roomData)

  } catch (error) {
    console.log('Error adding room:', error)
    err.value = true
  } finally {
    addingRoom.value = false
  }
}

const resetForm = () => {
  roomDetails.value = {
    roomType: '',
    roomFloor: '',
    roomNumber: '',
    roomStatus: '',
  }
}

</script>