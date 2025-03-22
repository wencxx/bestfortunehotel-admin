<template>
  <div class="p-20 !pt-14 space-y-10">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2">
        <Icon icon="basil:book-mark-outline" class="text-4xl" />
        <h1 class="text-xl">Booking Lists</h1>
      </div>
      <button
        class="bg-custom-primary px-3 py-1 rounded text-white hover:bg-red-600"
        @click="showWalkInModal = true"
      >
        Walk in
      </button>
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
        <input
          type="text"
          placeholder="Search"
          class="border rounded pl-2 ml-auto"
          v-model="searchQuery"
        />
        <button
          class="bg-green-500 text-white px-3 rounded"
          @click="generatePDF"
        >
          Generate PDF
        </button>
        <button
          class="bg-blue-500 text-white px-3 rounded"
          @click="showColumnModal = true"
        >
          Select Columns
        </button>
      </div>
      <div class="w-full overflow-x-auto">
        <table class="w-[170%] rounded-md overflow-hidden" id="bookingsTable">
          <thead class="bg-custom-primary text-white">
            <tr>
              <th v-if="selectedColumns.includes('Booking At')" class="border w-fit py-2">Booking At</th>
              <th v-if="selectedColumns.includes('Booking Id')" class="border w-fit py-2">Booking Id</th>
              <th v-if="selectedColumns.includes('Type')" class="border w-fit py-2">Type</th>
              <th v-if="selectedColumns.includes('Name')" class="border w-fit py-2">Name</th>
              <th v-if="selectedColumns.includes('GCASH Reference')" class="border w-fit py-2">GCASH Reference</th>
              <th v-if="selectedColumns.includes('Room Name')" class="border w-fit py-2">Room Name</th>
              <th v-if="selectedColumns.includes('Guests')" class="border w-fit py-2">Guests</th>
              <th v-if="selectedColumns.includes('Floor')" class="border w-fit py-2">Floor</th>
              <th v-if="selectedColumns.includes('Room Number')" class="border w-fit py-2">Room Number</th>
              <th v-if="selectedColumns.includes('Check In')" class="border w-fit py-2">Check In</th>
              <th v-if="selectedColumns.includes('Check Out')" class="border w-fit py-2">Check Out</th>
              <th v-if="selectedColumns.includes('Days')" class="border w-fit py-2">Days</th>
              <th v-if="selectedColumns.includes('Add Ons')" class="border w-fit py-2">Add Ons</th>
              <th v-if="selectedColumns.includes('Total Price')" class="border w-fit py-2">Total Price</th>
              <th v-if="selectedColumns.includes('Status')" class="border w-fit py-2">Status</th>
              <th v-if="selectedColumns.includes('Action')" class="border w-fit py-2">Action</th>
            </tr>
          </thead>
          <tbody v-if="filteredBookings()?.length">
            <tr
              v-for="(booking, index) in filteredBookings()"
              :key="booking.id"
              :class="{ 'bg-gray-100': index % 2 === 0 }"
              class="border-b"
            >
              <td v-if="selectedColumns.includes('Booking At')" class="border-x text-center py-2 capitalize">
                {{ formatFirebaseTimestamp(booking.bookedAt) }}
              </td>
              <td v-if="selectedColumns.includes('Booking Id')" class="border-x text-center py-2 capitalize">
                {{ booking.id }}
              </td>
              <td v-if="selectedColumns.includes('Type')" class="border-x text-center py-2 capitalize">
                {{ booking.type || "online" }}
              </td>
              <td v-if="selectedColumns.includes('Name')" class="border-x text-center py-2 capitalize">
                {{ booking.name || booking.firstName + " " + booking.lastName }}
              </td>
              <td v-if="selectedColumns.includes('GCASH Reference')" class="border-x text-center py-2 capitalize">
                {{ booking.referenceNumber || "--" }}
              </td>
              <td v-if="selectedColumns.includes('Room Name')" class="border-x text-center py-2 capitalize">
                {{ booking.roomName }}
              </td>
              <td v-if="selectedColumns.includes('Guests')" class="border-x text-center py-2 capitalize">
                {{ booking.guests }}
              </td>
              <td v-if="selectedColumns.includes('Floor')" class="border-x text-center py-2 capitalize">
                {{ booking.floor }}
              </td>
              <td v-if="selectedColumns.includes('Room Number')" class="border-x text-center py-2 capitalize">
                {{ booking.number }}
              </td>
              <td v-if="selectedColumns.includes('Check In')" class="border-x text-center py-2 capitalize">
                {{ formatDate(booking.checkIn) }}
              </td>
              <td v-if="selectedColumns.includes('Check Out')" class="border-x text-center py-2 capitalize">
                {{ formatDate(booking.checkOut) }}
              </td>
              <td v-if="selectedColumns.includes('Days')" class="border-x text-center py-2 capitalize">
                {{ booking.days }}
              </td>
              <td v-if="selectedColumns.includes('Add Ons')" class="border-x text-center py-2 capitalize">
                {{ booking.beds || 0 }} beds
              </td>
              <td v-if="selectedColumns.includes('Total Price')" class="border-x text-center py-2 capitalize">
                {{ formatCurrency(booking.totalPrice) }}
              </td>
              <td v-if="selectedColumns.includes('Status')" class="border-x text-center p-1 capitalize">
                <button
                  class="px-2 text-white rounded py-1 w-3/4 capitalize"
                  :class="{
                    'bg-orange-500': booking.status === 'pending',
                    'bg-red-700': booking.status === 'canceled',
                    'bg-red-500': booking.status === 'declined',
                    'bg-green-500': booking.status === 'confirmed',
                  }"
                >
                  {{ booking.status }}
                </button>
              </td>
              <td v-if="selectedColumns.includes('Action')" class="border-x text-center py-2">
                <div
                  class="flex items-center gap-x-2 justify-center text-2xl"
                  v-if="booking.status !== 'canceled'"
                >
                  <Icon
                    v-if="booking.status !== 'confirmed'"
                    icon="mdi:check"
                    class="text-green-500 cursor-pointer"
                    @click="showConfirmationModal(booking.id, booking.userId)"
                  />
                  <Icon
                    icon="mdi:close"
                    v-if="booking.status !== 'declined'"
                    class="text-red-500 cursor-pointer"
                    @click="
                      showWarningModal(
                        booking.id,
                        booking.roomNumberId,
                        booking.userId
                      )
                    "
                  />
                </div>
                <div
                  class="flex items-center gap-x-2 justify-center text-2xl"
                  v-else
                >
                  <Icon
                    icon="mdi:trash"
                    class="text-red-500 cursor-pointer"
                    @click="showDeleteModal(booking.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="border text-center py-2" colspan="11">
                No rooms to show
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <confirmationModal
      v-if="showConfirmation"
      @closeModal="showConfirmation = false"
      @accept="acceptBooking"
    />
    <warningModal
      v-if="showWarning"
      @closeModal="showWarning = false"
      @accept="declineBooking"
    />
    <deleteModal
      v-if="showDelete"
      @closeModal="showDelete = false"
      @accept="deleteBooking"
      :type="'booking'"
    />
    <walkInModal
      v-if="showWalkInModal"
      @closeModal="showWalkInModal = false"
      @submit="addWalkInBooking"
    />
    <columnModal
      v-if="showColumnModal"
      @closeModal="showColumnModal = false"
      @updateColumns="updateSelectedColumns"
    />
  </div>
</template>

<script setup>
import confirmationModal from '../components/ConfirmationModal.vue'
import warningModal from '../components/WarningModal.vue'
import deleteModal from '../components/DeleteModal.vue'
import walkInModal from '../components/WalkInModal.vue'
import AddRoom from '../components/AddRoom.vue'
import columnModal from '../components/ColumnModal.vue'
import { onMounted, ref, computed } from 'vue'
import { useDataStore } from '../store'
import moment from 'moment'
import { db } from '../config/firebaseConfig'
import { doc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, or, where } from 'firebase/firestore'
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
const itemRef = collection(db, 'items')

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
        showConfirmation.value = false

        const querySnapshot = query(
            itemRef,
            or(
                where('name', '==', 'Shampoo'),
                where('name', '==', 'Soap'),
                where('name', '==', 'Toothpaste'),
                where('name', '==', 'Toothbrush'),
                where('name', '==', 'tissue'),
                where('name', '==', 'Towel'),
                where('name', '==', 'Blankets'),
                where('name', '==', 'Pillow'),
            )
        )

        const snapshots = await getDocs(querySnapshot)

        for (const snapshot of snapshots.docs) { 
            const docRef = doc(itemRef, snapshot.id);
            const currentQuantity = snapshot.data().quantity;

            if (currentQuantity > 0) {
                await updateDoc(docRef, {
                    quantity: currentQuantity - 1
                });
            }
        }
    } catch (error) {
        console.log(error)
        $toast.error('Failed to accept booking')
    } finally {
        bookingToAccept.value = ''
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

// generate pdf
const generatePDF = () => {
    const doc = new jsPDF();
    const headerText = "Best Fortune Hotel"; 
    const headerAddressLine1 = "805-807 Benavidez St.";
    const headerAddressLine2 = "cor Salazar St. Binondo, Manila, Philippines"; 
    const headerPhone = "0915 595 9227"; 
    const headerEmail = "bestfortunehotel@yahoo.com"; 
    const headerImage = "src/assets/277741668_347625477389163_2974931926985871192_n-removebg-preview.png"; 

    const pageWidth = doc.internal.pageSize.getWidth();
    const imageWidth = 25;
    const imageX = (pageWidth - imageWidth) / 2;

    doc.addImage(headerImage, 'PNG', imageX, 10, imageWidth, 25);

    doc.setFontSize(18);
    doc.text(headerText, pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.text(headerAddressLine1, pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(12);
    doc.text(headerAddressLine2, pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(12);
    doc.text(headerPhone, pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.text(headerEmail, pageWidth / 2, 60, { align: 'center' });

    let table = document.getElementById('bookingsTable');
    let rows = table.querySelectorAll('tr');
    let data = [];

    rows.forEach((row) => {
        let rowData = [];
        let cols = row.querySelectorAll('td, th');

        cols.forEach((col) => {
            let cellText = col.innerText.trim();
            rowData.push(cellText);
        });

        if (rowData.length > 0) {
            data.push(rowData);
        }
    });

    doc.autoTable({
        head: [data[0]],
        body: data.slice(1),
        startY: 70,
    });

    doc.save('Bookings.pdf');
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

const showColumnModal = ref(false)
const selectedColumns = ref([
  'Booking At', 'Booking Id', 'Type', 'Name', 'GCASH Reference', 'Room Name',
  'Guests', 'Floor', 'Room Number', 'Check In', 'Check Out', 'Days', 'Add Ons',
  'Total Price', 'Status', 'Action'
])

const updateSelectedColumns = (columns) => {
  selectedColumns.value = columns
}
</script>
