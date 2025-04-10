<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="addItem" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Add Item</h1>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Item Name <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded h-10 p-2" v-model="itemDetails.name">
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Category<span class="text-custom-primary">*</span></label>
                <select v-model="itemDetails.category" class="border rounded h-10 p-2">
                    <option value="" disabled>Select Category</option>
                    <option>Beds and Mattresses</option>
                    <option>Bed Linens and Pillows</option>
                    <option>Towels and Bathrobes</option>
                    <option>Curtains and Blinds</option>
                    <option>Furniture</option>
                    <option>Toiletries</option>
                    <option>Bathroom Cleaning Supplies</option>
                </select>
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Quantity <span class="text-custom-primary">*</span></label>
                <input type="number" class="border rounded h-8 p-2" v-model="itemDetails.quantity">
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!addingItem" class="bg-custom-primary w-1/4 rounded text-white">Add</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Adding</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { db, storage } from '../config/firebaseConfig'
import { addDoc, collection } from 'firebase/firestore'

const emit = defineEmits(['closeModal'])
const { type } = defineProps({
  type: String
})

const closeModal = () => {
    emit('closeModal')
}

const itemDetails = ref({
    name: '',
    quantity: '',
    category: ''
})

// add room
const err = ref(false)
const addingItem = ref(false)
const promoRef = collection(db, 'items')
const addItem = async () => {
  err.value = false
  try {
    addingItem.value = true


    const itemData = {
      name: itemDetails.value.name,
      quantity: itemDetails.value.quantity,
      category: itemDetails.value.category,
      type,
      createdAt: new Date()
    }

    await addDoc(promoRef, itemData)

    resetForm()
    emit('closeModal', itemData)

  } catch (error) {
    console.log('Error adding item:', error)
    err.value = true
  } finally {
    addingItem.value = false
  }
}

const resetForm = () => {
    itemDetails.value = {
        name: '',
        quantity: '',
        category: '',
    }
}

</script>