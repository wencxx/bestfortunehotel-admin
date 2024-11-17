<template>
    <div class="w-screen h-screen z-50 fixed top-0 left-0 bg-white/10 !mt-0 flex items-center justify-center">
        <div class="h-1/3 w-full max-w-md rounded bg-white shadow flex flex-col items-center justify-center gap-y-10 p-10">
            <Icon icon="ix:warning-filled" class="text-7xl text-green-500" />
            <h1 class="w-3/4 text-lg text-center font-medium uppercase">Are you sure you want to accept this booking?</h1>
            <div class="w-full flex items-center justify-center gap-x-3">
                <button class="bg-red-500 w-1/4 text-white py-1 rounded" @click="emit('closeModal')">No</button>
                <button class="bg-green-500 w-1/4 text-white py-1 rounded" @click="emit('accept')">Yes</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['closeModal', 'accept'])
</script>