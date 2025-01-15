import { defineStore } from 'pinia'
import { db } from '../config/firebaseConfig'
import { onSnapshot, collection, addDoc, getDocs, query, where } from 'firebase/firestore'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        bookings: [],
        staffs: [],
        notifications: [],
        items: [],
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
                this.getItems()
                this.addRoomsToClean()
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
        },
        async getItems(){
            try {
                onSnapshot(
                    collection(db, 'items'),
                    (snapshot) => {
                        this.items = []
                        snapshot.docs.forEach(doc => {
                            this.items.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                    }
                )
            } catch (error) {
                console.log(error)
            }
        },
        async getNotifications() {
            try {
                onSnapshot(
                    collection(db, 'notifications'),
                    (snapshot) => {
                        this.notifications = []
                        snapshot.docs.forEach(doc => {
                            this.notifications.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                    }
                )
            } catch (error) {
                console.log('Failed to get notifications')
            }
        },
        async addRoomsToClean() {
            try {
                const today = new Date().toISOString().split('T')[0]; 
                const roomsToCleanCollection = collection(db, 'roomsToClean');
        
                for (const booking of this.bookings) {
                    const checkOutDate = booking.checkOut;
        
                    if (checkOutDate === today && booking.status === 'confirmed') {
                        const querySnapshot = await getDocs(
                            query(
                                roomsToCleanCollection, 
                                where('roomName', '==', booking.roomName),
                                where('checkOutDate', '==', booking.checkOut)
                            )
                        );
        
                        if (querySnapshot.empty) {
                            await addDoc(roomsToCleanCollection, {
                                roomName: booking.roomName,
                                checkOutDate: booking.checkOut,
                                cleaned: false
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to add rooms to clean:', error);
            }
        }
        
    },
    getters: {
        confirmedBookings(state){
            const currentYear = new Date().getFullYear();
            return state.bookings.filter(booking => {
                const bookingYear = booking.bookedAt.toDate().getFullYear();
                return booking.status === 'confirmed' && bookingYear === currentYear;
            });
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
