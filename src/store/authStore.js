import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        currentUser: null,
        isAuth: !!localStorage.getItem('isAuth'),
        token: localStorage.getItem('token') || null
    }),
    actions: {
        async login(token, user){
            this.token = token
            this.isAuth = true
            this.currentUser = user

            localStorage.setItem('token', token)
            localStorage.setItem('isAuth', true)
        },
        async logout(){
            this.token = null
            this.isAuth = false
            this.currentUser = null

            localStorage.removeItem('token')
            localStorage.removeItem('isAuth')
        }
    }
})