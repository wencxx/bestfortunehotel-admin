<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="updateRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Update Room Type</h1>
            <div class="flex flex-col gap-y-1">
                <label >Room Type<span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomName">
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Price <span class="text-custom-primary">*</span></label>
                <input type="number" class="border rounded pl-2 h-8" v-model="roomDetails.roomPrice">
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Capacity <span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="roomDetails.roomCapacity">
                    <option value="">Select Room Capacity</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Room Size <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomSize">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Room Bed <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomBed">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Room Bathroom <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomBathroom">
            </div>
            <!-- <div class="flex flex-col gap-y-1">
                <label>Availability <span class="text-custom-primary">*</span></label>
                <select v-model="roomDetails.isAvailable" class="border rounded pl-2 h-8">
                    <option :value="true">Available</option>
                    <option :value="false">Occupied</option>
                </select>
            </div> -->
            <div class="flex flex-col gap-y-1 col-span-2">
                <label>Room Key Features <span class="text-custom-primary">*</span></label>
                <textarea class="border rounded min-h-20 p-2" v-model="roomDetails.roomKeyFeatures"></textarea>
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Room Promo(%)</label>
                <select class="border rounded h-8" v-model="roomDetails.roomPromo">
                    <option value="" disabled>None</option>
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                    <option>35</option>
                    <option>40</option>
                    <option>45</option>
                    <option>50</option>
                    <option>55</option>
                    <option>60</option>
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
import { ref, defineEmits, defineProps } from 'vue'
import { db } from '../config/firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'
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

const roomDetails = ref({
    roomName: roomDetailsToEdit.roomName || '',
    roomPrice: roomDetailsToEdit.roomPrice || '',
    roomCapacity: roomDetailsToEdit.roomCapacity || '',
    roomSize: roomDetailsToEdit.roomSize || '',
    roomBed: roomDetailsToEdit.roomBed || '',
    roomBathroom: roomDetailsToEdit.roomBathroom || '',
    roomKeyFeatures: roomDetailsToEdit.roomKeyFeatures || '',
    roomPromo: roomDetailsToEdit.roomPromo || '',
    // isAvailable: roomDetailsToEdit.isAvailable,
})

const updatingRoom = ref(false)

const updateRoom = async () => {
    try {
        updatingRoom.value = true
        await updateDoc(doc(db, 'rooms', roomDetailsToEdit.id), roomDetails.value)

        $toast.success('Room type updated successfully')
        emit('closeModal', {
            id: roomDetailsToEdit.id,
            ...roomDetails.value
        })
    } catch (error) {
        console.log(error)
        $toast.error('Failed to update room type')
    } finally {
        updatingRoom.value = false
    }
}

</script>