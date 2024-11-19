<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="addRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Add Promo</h1>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Promo Description <span class="text-custom-primary">*</span></label>
                <textarea class="border rounded min-h-20 p-2" v-model="promoDetails.description"></textarea>
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Promo End <span class="text-custom-primary">*</span></label>
                <input type="date" class="border rounded h-8 p-2" v-model="promoDetails.end">
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label>Promo Images</label>
                <input type="file" accept=".jpg, .png, .jpeg" multiple class="rounded h-8" @change="changeRoomImages">
            </div>
            <div v-if="imagesTempUrl.length" class="flex gap-2">
                <div v-for="(image, index) in imagesTempUrl" :key="index" class="relative w-fit group">
                    <img :src="image" alt="thumbnail photo" class="w-14 aspect-square object-cover rounded cursor-pointer">
                    <div class="absolute top-1 right-1 bg-black p-1 rounded-full hidden group-hover:block">
                        <icon icon="mdi:close" class="text-white" @click="removeImage(index)"/>
                    </div>
                </div>
            </div>
            <div class="flex gap-x-3 justify-end col-span-2 mt-5">
                <button class="border border-custom-primary w-1/4 rounded text-custom-primary" type="button" @click="closeModal">Close</button>
                <button v-if="!addingPromo" class="bg-custom-primary w-1/4 rounded text-white">Add</button>
                <button v-else class="bg-custom-primary w-1/4 rounded text-white animate-pulse" disabled>Adding</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { db, storage } from '../config/firebaseConfig'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'

const emit = defineEmits(['closeModal'])

const closeModal = () => {
    emit('closeModal')
}

const promoDetails = ref({
    description: '',
    end: ''
})

// add room images
const images = ref([])


const imagesTempUrl = ref([])

const changeRoomImages = () => {

    const files = Array.from(event.target.files)
    
    files.forEach(file => {
        const tempUrl = URL.createObjectURL(file)

        imagesTempUrl.value.push(tempUrl)

        images.value.push(file)
    })
}

const removeImage = (index) => {
    imagesTempUrl.value.splice(index, 1)
    images.value.splice(index, 1)
}

// add room
const err = ref(false)
const addingPromo = ref(false)
const promoRef = collection(db, 'promos')
const addRoom = async () => {
  err.value = false
  try {
    addingPromo.value = true

    const imagesUrls = []
    for (const image of images.value) {
      const imageStorageRef = storageRef(storage, `roomImages/gallery/${image.name}`)
      await uploadBytes(imageStorageRef, image)
      const imageUrl = await getDownloadURL(imageStorageRef)
      imagesUrls.push(imageUrl)
    }

    const promoData = {
      description: promoDetails.value.description,
      end: promoDetails.value.end,
      imagesUrls: imagesUrls,
      createdAt: new Date()
    }

    await addDoc(promoRef, promoData)

    resetForm()
    emit('closeModal', promoData)

  } catch (error) {
    console.log('Error adding promo:', error)
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
  images.value = []
  imagesTempUrl.value = []
}

</script>