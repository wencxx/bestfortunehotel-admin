<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="healthicons:city-worker-outline" class="text-4xl" />
            <h1 class="text-xl">Archived Staffs Lists</h1>
        </div>
        <div class="flex">
            <button class="ml-auto border border-custom-primary text-custom-primary px-3 py-1 rounded hover:shadow-md" @click="willAddStaff = true">Add Staff</button>
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
                    <option value="">All</option>
                    <option>Manager</option>
                    <option>Front desk officer</option>
                    <option>Room boy</option>
                    <option>Maintenance</option>
                    <option>Bell Boy</option>
                    <option>Chamber Mail</option>
                    <option>Secretary</option>
                </select>
                <!-- <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery"> -->
                <button class="bg-green-500 text-white px-3 rounded ml-auto" @click="generateCSV">Generate CSV</button>
            </div>
            <div class="full overflow-x-auto">
                <table class="w-full rounded-md overflow-hidden" id="staffsTable">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border !w-1/12 py-2">Full Name</th>
                            <th class="border !w-1/12 py-2">Role</th>
                            <th class="border !w-1/12 py-2">Gender</th>
                            <th class="border !w-1/12 py-2">Birth Date</th>
                            <th class="border !w-1/12 py-2">Started At</th>
                            <th class="border !w-2/12 py-2">Address</th>
                            <th class="border !w-1/12 py-2">Contact</th>
                            <th class="border !w-1/12 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredStaff()?.length">
                        <tr v-for="(staff, index) in filteredStaff()" :key="staff.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize">{{ staff.fullName }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ staff.role }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ staff.gender }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ moment(staff.birthDate).format('ll') }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ moment(staff.dateStarted).format('ll') }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ staff.address }}</td>
                            <td class="border-x text-center py-2 capitalize">{{ staff.contactNumber }}</td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-xl">
                                    <!-- <Icon icon="mdi:pencil" class="text-green-500 cursor-pointer" @click="editStaff(staff)" /> -->
                                    <!-- <Icon icon="mdi:trash" class="text-red-500 cursor-pointer" @click="deleteStaff(staff.id, index)" /> -->
                                    <Icon icon="mdi:restore" class="text-green-500 cursor-pointer" @click="restoreStaff(staff.id, index)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="9">No staffs to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AddStaff v-if="willAddStaff" @closeModal="closeModal" />
        <EditStaff v-if="willEditStaff" @closeModal="willEditStaff = false" :staffDetailsToEdit="staffToEditDetails" />
        <DeleteModal v-if="willDeleteStaff" :type="'Staff'" @closeModal="willDeleteStaff = false" @accept="confirmDelete" />
    </div>
</template>

<script setup>
import AddStaff from '../components/AddStaff.vue'
import EditStaff from '../components/EditStaff.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { computed, onMounted, ref } from 'vue'
import { db } from '../config/firebaseConfig'
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { useDataStore } from '../store'
import moment from 'moment'

const dataStore = useDataStore()
const $toast = useToast()

onMounted(() => {
    dataStore.getArchivedtaffs()
})

// get staffs 
const staffs = computed(() => dataStore.archivedStaffs)

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)

const filteredStaff = () => {
    let filtered = staffs.value

    if (filterSelect.value) {
        filtered = filtered.filter(staff => staff.role === filterSelect.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(staff =>
            Object.values(staff).some(value =>
                String(value).toLowerCase().includes(query)
            )
        )
    }

    return filtered.slice(0, rowLimit.value)
}

const restoreStaff = async (staffId, index) => {
    try {
        const staffRef = doc(db, 'staffs', staffId);
        await updateDoc(staffRef, { status: 'active' });

        $toast.success('Staff successfully restored');
    } catch (error) {
        $toast.error('Failed to archive staff');
    }
}

// add room
const willAddStaff = ref(false)

const closeModal = () => {
    willAddStaff.value = false
}

// edit room
const willEditStaff = ref(false)
const staffToEditDetails = ref({})

const editStaff = (staffInfo) => {
    willEditStaff.value = true
    staffToEditDetails.value = staffInfo
}

// delete room
const willDeleteStaff = ref(false)
const staffToDeleteId = ref('')

const deleteStaff = (roomId, index) => {
    staffToDeleteId.value = roomId
    willDeleteStaff.value = true
}

const confirmDelete = async () => {
    try {
        willDeleteStaff.value = false
        await deleteDoc(doc(db, 'staffs', staffToDeleteId.value))

        $toast.success('Staff successfully deleted')
    } catch (error) {
        $toast.error('Failed to delete staff')
    }
}

// generate csv
const generateCSV = () => {
    let table = document.getElementById('staffsTable');
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
    link.download = 'Staffs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
</script>