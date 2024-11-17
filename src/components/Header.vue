<template>
    <div class="items-center justify-between p-5">
        <div>
            <p class="text-lg">Hello Admin, {{ timeOfDay }}</p>
        </div>
        <div class="w-fit h-fit flex flex-col items-end">
            <p>{{ currentTime.split(',')[0] }}</p>
            <p>{{ currentTime.split(',')[1] }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import moment from "moment"

const currentTime = ref(moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'))
const timeOfDay  = ref('')

const updateTime = () => {
    currentTime.value = moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
    setTimeOfDay()
}

const setTimeOfDay = () => {
    const hour = moment().hour()

    if (hour >= 5 && hour < 12) {
        timeOfDay.value = "Good Morning"
    } else if (hour >= 12 && hour < 17) {
        timeOfDay.value = "Good Afternoon"
    } else {
        timeOfDay.value = "Good Evening"
    }
}

let interval
onMounted(() => {
    interval = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
    clearInterval(interval)
})
</script>
