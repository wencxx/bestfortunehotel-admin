<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="updateItem" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Update Item</h1>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Item Name <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded h-10 p-2" v-model="itemDetails.name">
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Quantity <span class="text-custom-primary">*</span></label>
                <input type="number" class="border rounded h-8 p-2" v-model="itemDetails.quantity">
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!updatinItem" class="bg-custom-primary w-1/4 rounded text-white">Update</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Updating</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { db } from '../config/firebaseConfig'
import { updateDoc, doc } from 'firebase/firestore'

const emit = defineEmits(['closeModal'])
const { itemDetailsToEdit } = defineProps({
  itemDetailsToEdit: Object
})

const closeModal = () => {
    emit('closeModal')
}

const itemDetails = ref({
    name: itemDetailsToEdit.name || '',
    quantity: itemDetailsToEdit.quantity || ''
})

// add room
const err = ref(false)
const updatinItem = ref(false)
const updateItem = async () => {
  err.value = false
  try {
    updatinItem.value = true


    const itemData = {
      id: itemDetailsToEdit.id,
      name: itemDetails.value.name,
      quantity: itemDetails.value.quantity,
    }

    await updateDoc(doc(db, 'items', itemDetailsToEdit.id), itemData)

    resetForm()
    emit('closeModal', itemData)

  } catch (error) {
    console.log('Error updating item:', error)
    err.value = true
  } finally {
    updatinItem.value = false
  }
}

const resetForm = () => {
    itemDetails.value = {
        name: '',
        quantity: ''
    }
}

</script>