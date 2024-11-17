import { defineStore } from 'pinia'
import { db } from '../config/firebaseConfig'
import { onSnapshot, collection } from 'firebase/firestore'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        bookings: [],
        staffs: []
    }),
    actions: {
        async getBookings() {
            try {
                onSnapshot(
                    collection(db, 'booking'),
                    (snapshot) => {
                        this.bookings = []
                        snapshot.docs.forEach(doc => {
                            this.bookings.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                    }
                )
                this.getStaffs()
            } catch (error) {
                console.log('Failed to get bookings')
            }
        },
        async getStaffs() {
            try {
                onSnapshot(
                    collection(db, 'staffs'),
                    (snapshot) => {
                        this.staffs = []
                        snapshot.docs.forEach(doc => {
                            this.staffs.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                    }
                )
            } catch (error) {
                console.log('Failed to get bookings')
            }
        }
    },
    getters: {
        confirmedBookings(state){
            return state.bookings.filter(booking => booking.status === 'confirmed')
        },
        todaysConfirmedBookings(state){
            const today = new Date().toLocaleString().split(',')[0]
            return state.bookings.filter(booking => booking.status === 'confirmed' && booking.bookedAt.toDate().toLocaleString().split(',')[0] === today)
        },
        pendingBookings(state){
            const today = new Date().toLocaleString().split(',')[0]
            return state.bookings.filter(booking => booking.status === 'pending' && booking.bookedAt.toDate().toLocaleString().split(',')[0] === today)
        },
        canceledBookings(state){
            const today = new Date().toLocaleString().split(',')[0]
            return state.bookings.filter(booking => booking.status === 'canceled' && booking.bookedAt.toDate().toLocaleString().split(',')[0] === today)
        },
        checkedOutBookings(state){
            return state.bookings.filter(booking => booking.status === 'checked out')
        },
        popularRooms(){
            const roomCounts = this.confirmedBookings.reduce((acc, booking) => {
                if(!acc[booking.roomName]){
                    acc[booking.roomName] = 1

                    return acc
                }

                acc[booking.roomName] += 1

                return acc
            }, {})

            const sortedRoomCounts = Object.fromEntries(
                Object.entries(roomCounts).sort(([, a], [, b]) => b - a).splice(0, 5)
            );

            return sortedRoomCounts
        },
        staffCounts(){
            const staffCounts = this.staffs.reduce((acc, staff) => {
                if(!acc[staff.role]){
                    acc[staff.role] = 1

                    return acc
                }

                acc[staff.role] += 1

                return acc
            }, {})

            return staffCounts
        }
    }
})
