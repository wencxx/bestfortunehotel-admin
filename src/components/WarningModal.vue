<template>
    <div class="w-screen h-screen z-50 fixed top-0 left-0 bg-white/10 !mt-0 flex items-center justify-center">
        <div class="h-fit w-full max-w-md rounded bg-white shadow flex flex-col items-center justify-center gap-y-10 p-10">
            <Icon icon="ix:warning-filled" class="text-7xl text-orange-500" />
            <div class="w-full">
                <h1 class="w-full text-lg text-start font-medium uppercase h-10">Enter reason for declining:</h1>
                <textarea v-model="reason" class="w-full p-2 border rounded" placeholder="Enter reason for declining"></textarea>
            </div>
            <div class="w-full flex items-center justify-center gap-x-3">
                <button class="bg-red-500 w-1/4 text-white py-1 rounded" @click="emit('closeModal')">No</button>
                <button class="bg-green-500 w-1/4 text-white py-1 rounded" @click="emit('accept', reason)">Decline</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'

const emit = defineEmits(['closeModal', 'accept'])
const reason = ref('')
</script>