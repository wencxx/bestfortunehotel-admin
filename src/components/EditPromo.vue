<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="updateRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Update Promo</h1>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Promo Description <span class="text-custom-primary">*</span></label>
                <textarea class="border rounded min-h-20 p-2" v-model="promoDetails.description"></textarea>
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Promo End <span class="text-custom-primary">*</span></label>
                <input type="date" class="border rounded h-8 p-2" v-model="promoDetails.end">
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!addingPromo" class="bg-custom-primary w-1/4 rounded text-white">Update</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Updating</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { db, storage } from '../config/firebaseConfig'
import { updateDoc, doc } from 'firebase/firestore'

const emit = defineEmits(['closeModal'])

const { promoDetailsToEdit } = defineProps({
    promoDetailsToEdit: Object
})

const closeModal = () => {
    emit('closeModal')
}

const promoDetails = ref({
    description: promoDetailsToEdit.description || '',
    end: promoDetailsToEdit.end || ''
})


// add room
const err = ref(false)
const addingPromo = ref(false)
const updateRoom = async () => {
  err.value = false
  try {
    addingPromo.value = true

    const promoData = {
      description: promoDetails.value.description,
      end: promoDetails.value.end,
      imagesUrls: promoDetailsToEdit.imagesUrls
    }

    await updateDoc(doc(db, 'promos', promoDetailsToEdit.id), promoData)

    resetForm()
    emit('closeModal', promoData)

  } catch (error) {
    console.log('Error updatings promo:', error)
    err.value = true
  } finally {
    addingPromo.value = false
  }
}

const resetForm = () => {
  promoDetails.value = {
        description: '',
        end: ''
    }
}

</script>