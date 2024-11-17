<template>
    <div class="flex items-center justify-center h-full w-full">
        <form @submit.prevent="signIn" class="bg-white w-full max-w-md h-fit rounded-md border p-5 flex flex-col gap-y-2">
            <div class="flex flex-col items-center gap-y-2">
                <img src="../assets/277741668_347625477389163_2974931926985871192_n-removebg-preview.png" class="w-16 aspect-square" />
                <h1 class="text-center text-xl uppercase">Welcome Admin</h1>
            </div>
            <p v-if="errLogginIn" class="bg-red-500 pl-2 text-white rounded py-1 capitalize">{{ errLogginIn }}</p>
            <div class="flex flex-col gap-y-1 mt-3">
                <label class="text-lg tracking-wide">Username:</label>
                <input type="text" class="border rounded pl-2 h-9" v-model="username">
            </div>
            <div class="flex flex-col gap-y-1">
                <label class="text-lg tracking-wide">Password:</label>
                <input type="password" class="border rounded pl-2 h-9" v-model="password">
            </div>
            <div class="w-full flex items-center justify-center mt-5">
                <button v-if="!logginIn" class="bg-custom-primary text-white w-full rounded py-1">Sign In</button>
                <button v-else class="bg-custom-primary text-white w-full rounded py-1 animate-pulse" disabled>Signing In</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { db, auth } from '../config/firebaseConfig'
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuthStore } from '../store'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()

// sign in
const logginIn = ref(false)
const username = ref('')
const password = ref('')
const errLogginIn = ref('')

const signIn = async () => {
    try {
        logginIn.value = true
        const credentials = await signInWithEmailAndPassword(auth, `${username.value}@gmail.com`, password.value)

        const user = credentials.user

        if(!user) return errLogginIn.value = 'Failed to log in'
        
        authStore.login(user.accessToken, user)

        localStorage.setItem('isAuth', true)

        router.push('/dashboard')
    } catch (error) {
        errLogginIn.value = error.message
        console.log(error)
    } finally {
        logginIn.value = false
    }
}
</script>