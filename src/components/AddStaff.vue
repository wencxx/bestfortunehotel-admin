<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="addStaff" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Add Staff</h1>
            <div v-if="err" class="col-span-2">
                <p class="bg-red-500 text-white pl-2 py-1 rounded">Failed adding staff</p>
            </div>
            <div v-if="hasEmptyField" class="col-span-2">
                <p class="bg-red-500 text-white pl-2 py-1 rounded">Has empty fields</p>
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Full Name <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="staffData.fullName">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Birth Date <span class="text-custom-primary">*</span></label>
                <input type="date" class="border rounded pl-2 h-8" v-model="staffData.birthDate">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Gender <span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="staffData.gender">
                    <option value="">Select  Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Address <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="staffData.address">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Role <span class="text-custom-primary">*</span></label>
                <select class="border rounded pl-2 h-8" v-model="staffData.role">
                    <option value="">Select staff role</option>
                    <option>Manager</option>
                    <option>Front desk officer</option>
                    <option>Room boy</option>
                    <option>Maintenance</option>
                    <option>Bell boy</option>
                    <option>Chamber mail</option>
                    <option>Secretary</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Contact Number <span class="text-custom-primary">*</span></label>
                <input type="number" class="border rounded pl-2 h-8" v-model="staffData.contactNumber">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Date Started <span class="text-custom-primary">*</span></label>
                <input type="date" class="border rounded pl-2 h-8" v-model="staffData.dateStarted">
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!addingStaff" class="bg-custom-primary w-1/4 rounded text-white">Add</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Adding</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { db } from '../config/firebaseConfig'
import { addDoc, collection } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()

const emit = defineEmits(['closeModal'])

const closeModal = () => {
    emit('closeModal')
}

// staff data
const staffData = ref({
    fullName: '',
    birthDate: '',
    gender: '',
    address: '',
    role: '',
    contactNumber: '',
    dateStarted: ''
})

// add staff
const err = ref(false)
const addingStaff = ref(false)
const hasEmptyField = ref(false)
const staffsRef = collection(db, 'staffs')

const addStaff = async () => {
    hasEmptyField.value = false
    err.value = false
    try {
        addingStaff.value = true
        if(Object.values(staffData.value).some(field => !field)) return hasEmptyField.value = true

        const snapshot = await addDoc(staffsRef, {
            ...staffData.value,
            addedAt: new Date()
        })

        if(snapshot.empty) return $toast.error('Failed to add staff')

        emit('closeModal', {
            id: snapshot.id,
            ...staffData.value
        })
        resetStaffData()
        $toast.success('Staff added successfully')
    } catch (error) {
        console.log(error)
        err.value = true
        $toast.error('Failed to add staff')
    } finally {
        addingStaff.value = false
    }
}

const resetStaffData = () => {
    staffData.value = {
        fullName: '',
        birthDate: '',
        gender: '',
        address: '',
        role: '',
        contactNumber: '',
        dateStarted: ''
    }
}

</script>