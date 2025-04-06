import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import DashboardView from '../views/Dashboard.vue'
import { useAuthStore } from '../store' 

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/notifications',
        name: 'notifications',
        component: () => import('../views/Notifications.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/room-types',
        name: 'roomTypes',
        component: () => import('../views/RoomTypes.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/rooms',
        name: 'rooms',
        component: () => import('../views/Rooms.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/promos',
        name: 'promos',
        component: () => import('../views/Promos.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/bookings',
        name: 'bookings',
        component: () => import('../views/Bookings.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/staffs',
        name: 'staffs',
        component: () => import('../views/Staffs.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/archive-staffs',
        name: 'archivedStaffs',
        component: () => import('../views/ArchivedStaffs.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/rooms-to-clean',
        name: 'roomsToClean',
        component: () => import('../views/RoomsToClean.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/reusable-inventory',
        name: 'inventory',
        component: () => import('../views/Inventory.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/room-stock-inventory',
        name: 'stockInventory',
        component: () => import('../views/stockInventory.vue'),
        meta: {
            requiresAuth: true
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isAuth = authStore.isAuth

    if(to.meta.requiresAuth && !isAuth){
        next('/')
    }else if(to.fullPath === '/' && isAuth){
        next('/dashboard')
    }else{
        next()
    }
})


export default router