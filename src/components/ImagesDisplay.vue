<template>
    <div class="fixed top-0 left-0 w-screen h-screen bg-black/25 !mt-0 flex items-center justify-center">
        <div class="bg-black/75 w-fit p-1 rounded-full text-white absolute top-5 right-5 cursor-pointer" @click="emit('closeModal')">
            <Icon icon="material-symbols:close-rounded" class="text-3xl" />
        </div>
        <div @click="prevImage" class="absolute cursor-pointer top-1/2 -translate-y-1/2 left-5 bg-black/65 py-1 px-3 text-white rounded-full">
            <Icon icon="weui:arrow-filled" class="rotate-180 text-4xl" />
        </div>
        <img :src="images[currentShowing]" class="w-[80dvh] aspect-square rounded-md">
        <div @click="nextImage" class="absolute cursor-pointer top-1/2 -translate-y-1/2 right-5 bg-black/65 py-1 px-3 text-white rounded-full">
            <Icon icon="weui:arrow-filled" class="text-4xl" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const { images } = defineProps({
    images: Array
})

const emit = defineEmits(['closeModal'])

const currentShowing = ref(0)

const prevImage = () => {
    if(currentShowing.value === 0){
        currentShowing.value = images.length - 1
    }else{
        currentShowing.value--
    }
}

const nextImage = () => {
    if(currentShowing.value === images.length - 1){
        currentShowing.value = 0
    }else{
        currentShowing.value++
    }
}
</script>