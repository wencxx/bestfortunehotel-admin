<template>
    <div class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center">
        <form @submit.prevent="addRoom" class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5">
            <h1 class="text-xl text-center font-medium col-span-2">Add Room Type</h1>
            <div v-if="passImageLimit" class="col-span-2">
                <p class="bg-red-500 text-white pl-2 py-1 rounded">Exceed images uploads</p>
            </div>
            <div v-if="err" class="col-span-2">
                <p class="bg-red-500 text-white pl-2 py-1 rounded">Failed adding room</p>
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Type <span class="text-custom-primary">*</span></label>
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
                <label >Room Size <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomSize">
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Bed <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomBed">
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Bathroom <span class="text-custom-primary">*</span></label>
                <input type="text" class="border rounded pl-2 h-8" v-model="roomDetails.roomBathroom">
            </div>
            <div class="flex flex-col gap-y-1 col-span-2">
                <label >Room Key Features <span class="text-custom-primary">*</span></label>
                <textarea class="border rounded min-h-20 p-2" v-model="roomDetails.roomKeyFeatures"></textarea>
            </div>
            <div class="flex flex-col gap-y-1">
                <label >Room Thumbnail <span class="text-custom-primary">*</span></label>
                <input type="file" accept=".jpg, .png, .jpeg" class="rounded h-8" @change="changeThumbnail">
            </div>
            <div class="flex flex-col gap-y-1">
                <label>Room Images (up to 4 images)</label>
                <input type="file" accept=".jpg, .png, .jpeg" multiple class="rounded h-8" @change="changeRoomImages">
            </div>
            <div class="relative w-fit group">
                <img v-if="thumbnailTempUrl" :src="thumbnailTempUrl" alt="thumbnail photo" class="w-20 aspect-square object-cover rounded cursor-pointer">
                <div class="absolute top-1 right-1 bg-black p-1 rounded-full hidden group-hover:block">
                    <icon icon="mdi:close" class="text-white" @click="removeThumbnail()"/>
                </div>
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
                <button v-if="!addingRoom" class="bg-custom-primary w-1/4 rounded text-white">Add</button>
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

const roomDetails = ref({
    roomName: '',
    roomPrice: '',
    roomCapacity: '',
    roomSize: '',
    roomBed: '',
    roomBathroom: '',
    roomKeyFeatures: '',
})

// room images
const images = ref([])
const thumbnail = ref(null)

// add room thumbnail
const thumbnailTempUrl = ref('')

const changeThumbnail = () => {
    const file = event.target.files[0]

    thumbnailTempUrl.value = URL.createObjectURL(file)

    thumbnail.value = file
}

const removeThumbnail = () => {
    thumbnailTempUrl.value = ''
    thumbnail.value = null
}


// add room images
const passImageLimit = ref(false)
const imagesTempUrl = ref([])

const changeRoomImages = () => {
    passImageLimit.value = false

    const files = Array.from(event.target.files)
    
    if(files.length > 4) return passImageLimit.value = true

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
const addingRoom = ref(false)
const roomRef = collection(db, 'rooms')
const addRoom = async () => {
  err.value = false
  try {
    addingRoom.value = true
    let thumbnailUrl = ''
    if (thumbnail.value) {
      const thumbnailStorageRef = storageRef(storage, `roomImages/thumbnails/${thumbnail.value.name}`)
      await uploadBytes(thumbnailStorageRef, thumbnail.value)
      thumbnailUrl = await getDownloadURL(thumbnailStorageRef)
    }

    const imagesUrls = []
    for (const image of images.value) {
      const imageStorageRef = storageRef(storage, `roomImages/gallery/${image.name}`)
      await uploadBytes(imageStorageRef, image)
      const imageUrl = await getDownloadURL(imageStorageRef)
      imagesUrls.push(imageUrl)
    }

    const roomData = {
      roomName: roomDetails.value.roomName,
      roomPrice: parseFloat(roomDetails.value.roomPrice),
      roomCapacity: parseInt(roomDetails.value.roomCapacity),
      roomSize: roomDetails.value.roomSize,
      roomBed: roomDetails.value.roomBed,
      roomBathroom: roomDetails.value.roomBathroom,
      roomKeyFeatures: roomDetails.value.roomKeyFeatures,
      isAvailable: true,
      thumbnailUrl: thumbnailUrl || '',
      imagesUrls: imagesUrls,
      createdAt: new Date()
    }

    await addDoc(roomRef, roomData)

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
    roomName: '',
    roomPrice: '',
    roomCapacity: '',
    roomSize: '',
    roomBed: '',
    roomBathroom: '',
    roomKeyFeatures: ''
  }
  thumbnail.value = null
  thumbnailTempUrl.value = ''
  images.value = []
  imagesTempUrl.value = []
}

</script>