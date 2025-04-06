<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="material-symbols-light:bedroom-child-outline" class="text-4xl" />
            <h1 class="text-xl">Room Types</h1>
        </div>
        <div class="flex">
            <button class="ml-auto border border-custom-primary text-custom-primary px-3 py-1 rounded hover:shadow-md" @click="willAddRoom = true">Add Room Type    </button>
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
                <!-- <select class="border py-1 px-3 rounded" v-model="filterSelect">
                    <option value="">All</option>
                    <option>Available</option>
                    <option>Occupied</option>
                </select> -->
                <!-- <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery"> -->
                <button class="bg-green-500 text-white px-3 rounded ml-auto" @click="generatePDF">Generate PDF</button>
            </div>
            <div class="full overflow-x-auto">
                <table class="w-[120%] rounded-md overflow-hidden" id="roomsTable">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-2/12 py-2">Room Type</th>
                            <th class="border w-1/12 py-2">Price</th>
                            <th class="border w-1/12 py-2">Capacity</th>
                            <th class="border w-1/12 py-2">Room Size</th>
                            <th class="border w-1/12 py-2">Bed</th>
                            <th class="border w-1/12 py-2">Bathroom</th>
                            <th class="border w-3/12 py-2">Key Features</th>
                            <th class="border w-1/12 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredRoom()?.length">
                        <tr v-for="(room, index) in filteredRoom()" :key="room.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize">{{ room.roomName }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ formatCurrency(room.roomPrice) }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ room.roomCapacity }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ room.roomSize }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ room.roomBed }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ room.roomBathroom }}</td>
                            <td class="border-x text-center py-2"><span class="line-clamp-3">{{ room.roomKeyFeatures || 'N/A' }}</span></td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-xl">
                                    <Icon icon="mdi:pencil" class="text-green-500" @click="editRoom(room, index)" />
                                    <Icon icon="mdi:trash" class="text-red-500" @click="deleteRoom(room.id, index)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="9">No rooms to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AddRoom v-if="willAddRoom" @closeModal="closeModal" />
        <EditRoom v-if="willEditRoom" @closeModal="closeEditModal" :roomDetailsToEdit="roomToEditDetails" />
        <DeleteModal v-if="willDeleteRoom" :type="'Room'" @closeModal="willDeleteRoom = false" @accept="confirmDelete" />
    </div>
</template>

<script setup>
import AddRoom from '../components/AddRoomType.vue'
import EditRoom from '../components/EditRoomType.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { onMounted, ref } from 'vue'
import { db } from '../config/firebaseConfig'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import headerImage from '../assets/277741668_347625477389163_2974931926985871192_n-removebg-preview.png'

const $toast = useToast()

onMounted(() => {
    getRoom()
})


// get rooms 
const rooms = ref([])

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)

const filteredRoom = () => {
    let filtered = rooms.value

    if (filterSelect.value) {
        if (filterSelect.value === 'Available') {
            filtered = filtered.filter(room => room.isAvailable === true)
        } else if (filterSelect.value === 'Occupied') {
            filtered = filtered.filter(room => room.isAvailable === false)
        } else if (filterSelect.value === 'Occupied') {
            filtered = filtered.filter(room => room.isAvailable === false)
        }
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(room =>
            Object.values(room).some(value =>
                String(value).toLowerCase().includes(query)
            )
        )
    }

    return filtered.slice(0, rowLimit.value)
}



const roomsRef = collection(db, 'rooms')
const getRoom = async () => {
    try {
        const snapshots = await getDocs(roomsRef)

        snapshots.docs.forEach(doc => {
            rooms.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log(error)
    }
}

const formatCurrency = (price) => {
    return `₱ ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'PHP', currencyDisplay: 'code' }).format(Number(price)).replace('PHP', '')}`
}

// add room
const willAddRoom = ref(false)

const closeModal = (data) => {
    if(data){
        rooms.value.unshift(data)
    }
    willAddRoom.value = false
}

// edit room
const willEditRoom = ref(false)
const roomToEditDetails = ref({})
const roomIndex = ref(0)

const editRoom = (roomInfo, index) => {
    willEditRoom.value = true
    roomToEditDetails.value = roomInfo
    roomIndex.value = index
}

const closeEditModal = (data) => {
    if(data){
        rooms.value[roomIndex.value] = data
    }
    willEditRoom.value = false
}

// delete room
const willDeleteRoom = ref(false)
const roomToDeleteId = ref('')
const roomToDeleteIndex = ref('')

const deleteRoom = (roomId, index) => {
    roomToDeleteId.value = roomId
    roomToDeleteIndex.value = index
    willDeleteRoom.value = true
}

const confirmDelete = async () => {
    try {
        willDeleteRoom.value = false
        await deleteDoc(doc(db, 'rooms', roomToDeleteId.value))

        rooms.value.splice(roomToDeleteIndex.value, 1)
        $toast.success('Room type successfully deleted')
    } catch (error) {
        $toast.error('Failed to delete room type')
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

    let table = document.getElementById('roomsTable');
    let rows = table.querySelectorAll('tr');
    let data = [];

    rows.forEach((row) => {
        let rowData = [];
        let cols = row.querySelectorAll('td, th');

        // Only loop through all columns except the last
        for (let i = 0; i < cols.length - 1; i++) {
            let cellText = cols[i].innerText.trim();
            rowData.push(cellText);
        }

        if (rowData.length > 0) {
            data.push(rowData);
        }
    });


    doc.autoTable({
        head: [data[0]],
        body: data.slice(1),
        startY: 70,
    });

    doc.save('Roomtypes.pdf');
};

</script>