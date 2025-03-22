<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-x-2">
                <Icon icon="basil:book-mark-outline" class="text-4xl" />
                <h1 class="text-xl">Booking Lists</h1>
            </div>
            <button class="bg-custom-primary px-3 py-1 rounded text-white hover:bg-red-600" @click="showWalkInModal = true">Walk in</button>
        </div>
        <div class="bg-white w-full h-fit p-5 rounded-lg shadow space-y-5">
            <div class="flex justify-start gap-x-2">
                <select class="border py-1 px-3 rounded" v-model="rowLimit">
                    <option value="5">5 Rows</option>
                    <option value="10">10 Rows</option>
                    <option value="15">15 Rows</option>
                    <option value="20">20 Rows</option>
                    <option value="50">50 Rows</option>
                    <option value="100">100 Rows</option>
                </select>
                <select class="border py-1 px-3 rounded" v-model="filterSelect">
                    <option value="">All Bookings</option>
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Canceled</option>
                    <option>Declined</option>
                </select>
                <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery">
                <button class="bg-green-500 text-white px-3 rounded" @click="generateCSV">Generate CSV</button>
                <!-- <button class="bg-blue-500 px-3 rounded text-white" @click="generateReport">Generate Report</button> -->
            </div>
            <div class="w-full overflow-x-auto">
                <table class="w-[170%] rounded-md overflow-hidden" id="bookingsTable">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-fit py-2">Booking At</th>
                            <th class="border w-fit py-2">Booking Id</th>
                            <th class="border w-fit py-2">Type</th>
                            <th class="border w-fit py-2">Name</th>
                            <th class="border w-fit py-2">GCASH Reference</th>
                            <th class="border w-fit py-2">Room Name</th>
                            <th class="border w-fit py-2">Guests</th>
                            <th class="border w-fit py-2">Floor</th>
                            <th class="border w-fit py-2">Room Number</th>
                            <th class="border w-fit py-2">Check In</th>
                            <th class="border w-fit py-2">Check Out</th>
                            <th class="border w-fit py-2">Days</th>
                            <th class="border w-fit py-2">Add Ons</th>
                            <th class="border w-fit py-2">Total Price</th>
                            <th class="border w-fit py-2">Status</th>
                            <th class="border w-fit py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredBookings()?.length">
                        <tr v-for="(booking, index) in filteredBookings()" :key="booking.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize">{{ formatFirebaseTimestamp(booking.bookedAt) }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.id }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.type || 'online' }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.name || booking.firstName + ' ' + booking.lastName }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.referenceNumber || '--' }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.roomName }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.guests }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.floor }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.number }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ formatDate(booking.checkIn) }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ formatDate(booking.checkOut) }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.days }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ booking.beds || 0 }} beds</td>
                            <td class="border-x text-center py-2 capitalize">{{ formatCurrency(booking.totalPrice) }}</td>
                            <td class="border-x text-center p-1 capitalize">
                                <button class="px-2 text-white rounded py-1 w-3/4 capitalize" :class="{ 'bg-orange-500': booking.status === 'pending', 'bg-red-700': booking.status === 'canceled', 'bg-red-500': booking.status === 'declined', 'bg-green-500': booking.status === 'confirmed' }">{{ booking.status }}</button>
                            </td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-2xl" v-if="booking.status !== 'canceled'">
                                    <Icon v-if="booking.status !== 'confirmed'" icon="mdi:check" class="text-green-500 cursor-pointer" @click="showConfirmationModal(booking.id, booking.userId)" />
                                    <Icon icon="mdi:close" class="text-red-500 cursor-pointer" @click="showWarningModal(booking.id, booking.roomNumberId, booking.userId)" />
                                </div>
                                <div class="flex items-center gap-x-2 justify-center text-2xl" v-else>
                                    <Icon icon="mdi:trash" class="text-red-500 cursor-pointer" @click="showDeleteModal(booking.id)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="11">No rooms to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <confirmationModal v-if="showConfirmation" @closeModal="showConfirmation = false" @accept="acceptBooking"/>
        <warningModal v-if="showWarning" @closeModal="showWarning = false" @accept="declineBooking"/>
        <deleteModal v-if="showDelete" @closeModal="showDelete = false" @accept="deleteBooking" :type="'booking'"/>
        <walkInModal v-if="showWalkInModal" @closeModal="showWalkInModal = false" @submit="addWalkInBooking"/>
    </div>
</template>

<script setup>
import confirmationModal from '../components/ConfirmationModal.vue'
import warningModal from '../components/WarningModal.vue'
import deleteModal from '../components/DeleteModal.vue'
import walkInModal from '../components/WalkInModal.vue'
import AddRoom from '../components/AddRoom.vue'
import { onMounted, ref, computed } from 'vue'
import { useDataStore } from '../store'
import moment from 'moment'
import { db } from '../config/firebaseConfig'
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const $toast = useToast()

const dataStore = useDataStore()

onMounted(() => {
    dataStore.getBookings()
})

// get bookings
const bookings = computed(() => dataStore.bookings)

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref('5')

const filteredBookings = () => {
    let filtered = bookings.value

    if (filterSelect.value) {
        if (filterSelect.value === 'Pending') {
            filtered = filtered.filter(booking => booking.status === 'pending')
        } else if (filterSelect.value === 'Canceled') {
            filtered = filtered.filter(booking => booking.status === 'canceled')
        } else if (filterSelect.value === 'Confirmed') {
            filtered = filtered.filter(booking => booking.status === 'confirmed')
        } else if (filterSelect.value === 'Declined') {
            filtered = filtered.filter(booking => booking.status === 'declined')
        }
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(booking => {
            return Object.values(booking).some(value => 
                String(value).toLowerCase().includes(query)
            )
        })
    }

    return filtered.slice(0, rowLimit.value)
}

const formatCurrency = (price) => {
    return `₱ ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'PHP', currencyDisplay: 'code' }).format(Number(price)).replace('PHP', '')}`
}

const formatDate = (date) => {
    return moment(new Date(date)).format('ll')
}

function formatFirebaseTimestamp(firebaseTimestamp) {
    const { seconds, nanoseconds } = firebaseTimestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1e6;
    return moment(milliseconds).format('lll');
}

// accept booking 
const showConfirmation = ref(false)
const bookingToAccept = ref('')
const userToAccept = ref('')

const showConfirmationModal = (bookingId, userId) => {
    bookingToAccept.value = bookingId
    showConfirmation.value = true
    userToAccept.value = userId
}

const userNotifRefAccept = collection(db, 'userNotifications')

const acceptBooking = async () => {
    try {
        await updateDoc(doc(db, 'booking', bookingToAccept.value), {
            status: 'confirmed'
        })

        await addDoc(userNotifRefAccept, {
            notifications: 'The hotel accepted your booking',
            isRead: false,
            isFalse: false,
            userId: userToAccept.value || 'Admin'
        })

        $toast.success('Accepted Booking Successfully')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to accept booking')
    } finally {
        bookingToAccept.value = ''
        showConfirmation.value = false
    }
}

// decline booking
const showWarning = ref(false)
const bookingToDecline = ref('')
const userIdToDecline = ref('')
const roomNumberIdToDecline = ref('')

const showWarningModal = (bookingId, roomNumberId, userId) => {
    bookingToDecline.value = bookingId
    roomNumberIdToDecline.value = roomNumberId
    userIdToDecline.value = userId
    showWarning.value = true
}

const userNotifRef = collection(db, 'userNotifications')

const declineBooking = async (data) => {
    try {
        await updateDoc(doc(db, 'booking', bookingToDecline.value), {
            status: 'declined',
            reasonForDeclining: data
        })

        await updateDoc(doc(db, 'roomNumbers', roomNumberIdToDecline.value), {
            roomStatus: 'Available'
        })

        await addDoc(userNotifRef, {
            notifications: `Booking declined: ${data}`,
            isRead: false,
            isFalse: false,
            userId: userIdToDecline.value || 'Admin'
        })

        $toast.success('Declined Booking Successfully')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to decline booking')
    } finally {
        bookingToDecline.value = ''
        showWarning.value = false
    }
}

// delete booking
const showDelete = ref(false)
const bookingToDelete = ref('')

const showDeleteModal = (bookingId) => {
    bookingToDelete.value = bookingId
    showDelete.value = true
}

const deleteBooking = async () => {
    try {
        await deleteDoc(doc(db, 'booking', bookingToDelete.value))

        $toast.success('Deleted Booking Successfully')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to delete booking')
    } finally {
        bookingToDelete.value = ''
        showDelete.value = false
    }
}

// generate csv
const generateCSV = () => {
    let table = document.getElementById('bookingsTable');
    let rows = table.querySelectorAll('tr');
    let csvContent = '';

    rows.forEach((row) => {
        let rowData = [];
        let cols = row.querySelectorAll('td:not(:last-child), th:not(:last-child)'); 

        cols.forEach((col) => {
            let cellText = col.innerText.trim();
            rowData.push(`"${cellText.replace(/"/g, '""')}"`);
        });

        if (rowData.length > 0) {
            csvContent += rowData.join(',') + '\n';
        }
    });

    let blob = new Blob([csvContent], { type: 'text/csv' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Bookings.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};


// add walkin 
const bookingRef = collection(db, 'booking')
const showWalkInModal = ref(false)

const addWalkInBooking = async (walkInData) => {
    try {
        const newBooking = {
            bookedAt: new Date(),
            ...walkInData,
            type: 'walkin',
            status: 'confirmed'
        }
        await addDoc(bookingRef, newBooking)
        $toast.success('Walk-in Booking Added Successfully')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to add walk-in booking')
    } finally {
        showWalkInModal.value = false
    }
}
</script>