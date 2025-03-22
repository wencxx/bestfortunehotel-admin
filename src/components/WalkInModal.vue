<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center !mt-0">
        <div class="bg-white p-5 rounded-lg w-1/2">
            <h2 class="text-xl mb-4">Add Walk-in Booking</h2>
            <form @submit.prevent="submitForm" class="grid grid-cols-2 gap-3">
                <div class="mb-4">
                    <label class="block mb-1">Full Name</label>
                    <input type="text" v-model="formData.name" class="border w-full p-2 rounded" required>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Room Name</label>
                    <select class="border w-full p-2 rounded" v-model="roomId" @change="changeRoom">
                        <option value="" disabled>Select Room</option>
                        <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.roomName }}</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Room Price</label>
                    <input type="text" v-model="roomPrice" class="border w-full p-2 rounded" readonly>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Room Promo(%)</label>
                    <input type="text" v-model="roomPromo" class="border w-full p-2 rounded" readonly>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Guests</label>
                    <input type="number" v-model="formData.guests" class="border w-full p-2 rounded" required>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Floor</label>
                    <select class="border w-full p-2 rounded" v-model="formData.floor" required :disabled="!formData.roomName">
                        <option value="" disabled>Select Floor</option>
                        <option v-for="floor in roomFloors" :key="floor">{{ floor }}</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Room Number</label>
                    <select class="border w-full p-2 rounded" v-model="formData.number" required :disabled="!formData.roomName">
                        <option value="" disabled>Select Room Number</option>
                        <option v-for="number in roomNumbers" :key="number">{{ number }}</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Check In</label>
                    <input type="date" v-model="formData.checkIn" class="border w-full p-2 rounded" required>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Check Out</label>
                    <input type="date" v-model="formData.checkOut" class="border w-full p-2 rounded" required>
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Days</label>
                    <input type="number" v-model="formData.days" class="border w-full p-2 rounded" required @change="addDays">
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Add Ons(beds)</label>
                    <input type="number" v-model="formData.beds" class="border w-full p-2 rounded" @change="addBeds">
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Total Price</label>
                    <input type="number" v-model="formData.totalPrice" class="border w-full p-2 rounded" readonly>
                </div>
                <div class="flex justify-end col-span-2">
                    <button type="button" @click="emit('closeModal')" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { onMounted, ref, computed } from 'vue'

const emit = defineEmits(['submit', 'closeModal'])

const formData = ref({
    name: '',
    roomName: '',
    roomId: '',
    guests: 1,
    floor: '',
    number: '',
    checkIn: '',
    checkOut: '',
    days: 1,
    beds: 0,
    totalPrice: 0
})

const submitForm = () => {
    emit('submit', formData.value)
}

onMounted(() => {
    getRooms()
})

const rooms = ref([])

const roomRef = collection(db, 'rooms')

const getRooms = async () => {
    try {
        const snapshotQuery = query(
            roomRef,
            where('isAvailable', '==', true)
        )
        const snapshots = await getDocs(snapshotQuery)

        snapshots.forEach(doc => {
            rooms.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
        getNumbers()
    } catch (error) {
        console.log(error)
    }
}

const numbers = ref([])
const numberRef = collection(db, 'roomNumbers')

const getNumbers = async () => {
    try {
        const snapshotQuery = query(
            numberRef,
            where('roomStatus', '==', 'Available')
        )

        const snapshots = await getDocs(snapshotQuery)

        snapshots.forEach(doc => {
            numbers.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log(error)
    }
}

const roomId = ref('')
const roomFloors = ref([])
const roomNumbers = ref([])

const roomPrice = ref(0)
const roomPromo = ref(0)

const changeRoom = (e) => {
    const selectedRoom = rooms.value.find(room => room.id === e.target.value)
    if (selectedRoom) {
        formData.value.roomName = selectedRoom.roomName
        roomPrice.value = selectedRoom.roomPrice
        roomPromo.value = selectedRoom.roomPromo

        updateTotalPrice()
    }

    roomFloors.value = numbers.value.filter(number => number.roomType === e.target.value)?.map(room => room.roomFloor)
    roomNumbers.value = numbers.value.filter(number => number.roomType === e.target.value)?.map(room => room.roomNumber)
}

const addDays = (e) => {
    formData.value.days = e.target.value
    updateTotalPrice()
}

const addBeds = (e) => {
    formData.value.beds = e.target.value
    updateTotalPrice()
}

const updateTotalPrice = () => {
    const discountAmount = (roomPrice.value * roomPromo.value) / 100
    const priceXdays = (discountAmount * formData.value.days)
    const bedsPrice = formData.value.beds * 500
    formData.value.totalPrice = priceXdays + bedsPrice
}
</script>
