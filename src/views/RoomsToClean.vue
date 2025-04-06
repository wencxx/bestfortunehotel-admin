<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="material-symbols-light:inventory-rounded" class="text-4xl" />
            <h1 class="text-xl">Rooms to clean</h1>
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
                    <option>Cleaned</option>
                    <option>To Clean</option>
                </select>
                <!-- <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery"> -->
            </div>
            <div class="full overflow-x-auto">
                <table class="w-full rounded-md overflow-hidden">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-2/5 py-2">Room</th>
                            <th class="border w-1/5 py-2">Status</th>
                            <th class="border w-1/5 py-2">Assigned Staff</th>
                            <th class="border w-1/5 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredRoom().length">
                        <tr v-for="(item, index) in filteredRoom()" :key="item.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize px-2">{{ item.roomName }}</td>
                            <td class="border-x text-center py-2 capitalize px-2">
                                <div class="bg-green-500 w-1/2 mx-auto py-1 rounded text-white" :class="{ 'bg-orange-500': !item.cleaned }">
                                    <span>{{ item.cleaned ? 'Cleaned' : 'To Clean' }}</span>
                                </div>
                            </td>
                            <td class="border-x text-center py-2 capitalize px-2">
                                <div v-if="item.assignedStaffs && item.assignedStaffs.length">
                                    <span v-for="staffId in item.assignedStaffs" :key="staffId" class="block" >
                                        <p class="text-sm cursor-pointer" @click="removeStaff(item.id, staffId, index)">{{ getStaffName(staffId) }}</p>  
                                    </span>
                                </div>
                                <div v-else>--</div>
                            </td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-2xl">
                                    <Icon v-if="!item.cleaned" icon="mdi:check" class="text-green-500" @click="updateRoom(item.id, index, 'done')" />
                                    <Icon v-else icon="mdi:restore" class="text-orange-500" @click="updateRoom(item.id, index, 'restore')" />
                                    <Icon icon="mdi:trash" class="text-red-500" @click="deleteRoom(item.id, index)" />
                                    <select class="border py-1 px-3 rounded text-xs" v-model="tempSelectedStaff[index]" @change="assignStaff(item.id, tempSelectedStaff[index], index)">
                                        <option value="" disabled>Assign Staff</option>
                                        <option v-for="staff in staffs" :key="staff.id" :value="staff.id">{{ staff.fullName }}</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="4" class="border text-center py-2 capitalize px-2">No rooms to clean</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <DeleteModal v-if="willDeleteRoom" :type="'Data'" @closeModal="willDeleteRoom = false" @accept="confirmDelete" />

    </div>
</template>

<script setup>
import DeleteModal from '../components/DeleteModal.vue'
import { db } from '../config/firebaseConfig'
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast()

onMounted(() => {
    getRoomsToClean()
    getStaffs()
})

// get roomsToClean
const rtcRef = collection(db, 'roomsToClean')
const staffsRef = collection(db, 'staffs')

const roomsToClean = ref([])
const staffs = ref([])
const tempSelectedStaff = ref([])

const getRoomsToClean = async () => {
    try {
        const snapshots = await getDocs(rtcRef)
        snapshots.docs.forEach(doc => {
            const data = doc.data()
            roomsToClean.value.push({
                id: doc.id,
                ...data,
                assignedStaffs: data.assignedStaffs || []
            })
            tempSelectedStaff.value.push('')
        })
    } catch (error) {
        console.log(error)
    }
}

const getStaffs = async () => {
    try {
        const snapshots = await getDocs(staffsRef)
        snapshots.docs.forEach(doc => {
            staffs.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log(error)
    }
}

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)
const selectedStaff = ref('')

const filteredRoom = () => {
    let filtered = roomsToClean.value

    if (filterSelect.value) {
        if (filterSelect.value === 'Cleaned') {
            filtered = filtered.filter(room => room.cleaned === true)
        } else if (filterSelect.value === 'To Clean') {
            filtered = filtered.filter(room => room.cleaned === false)
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

const getStaffName = (staffId) => {
    const staff = staffs.value.find(staff => staff.id === staffId)
    return staff ? staff.fullName : 'Unknown'
}

// update room
const updateRoom = async (itemId, index, type) => {
    try {

        if(type === 'done'){
            await updateDoc(doc(db, 'roomsToClean', itemId), {
                cleaned: true
            })

            roomsToClean.value[index].cleaned = true
        }else{
            await updateDoc(doc(db, 'roomsToClean', itemId), {
                cleaned: false
            })

            roomsToClean.value[index].cleaned = false
        }

        $toast.success('Room updated successfully')
    } catch (error) {
        console.log('Failed to update')
        $toast.success('Failed to update room ')
    }
}

// assign staff to room
const assignStaff = async (roomId, staffId, index) => {
    try {
        const room = roomsToClean.value[index]
        if (!room.assignedStaffs.includes(staffId)) {
            room.assignedStaffs.push(staffId)
            await updateDoc(doc(db, 'roomsToClean', roomId), {
                assignedStaffs: room.assignedStaffs
            })
            $toast.success('Staff assigned successfully')
        } else {
            $toast.warning('Staff already assigned')
        }
    } catch (error) {
        console.log('Failed to assign staff')
        $toast.error('Failed to assign staff')
    }
}

// remove staff from room
const removeStaff = async (roomId, staffId, index) => {
    try {
        const room = roomsToClean.value[index]
        room.assignedStaffs = room.assignedStaffs.filter(id => id !== staffId)
        await updateDoc(doc(db, 'roomsToClean', roomId), {
            assignedStaffs: room.assignedStaffs
        })
        $toast.success('Staff removed successfully')
    } catch (error) {
        console.log('Failed to remove staff')
        $toast.error('Failed to remove staff')
    }
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
        await deleteDoc(doc(db, 'roomsToClean', roomToDeleteId.value))

        roomsToClean.value.splice(roomToDeleteIndex.value, 1)
        $toast.success('Room successfully deleted')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to delete room')
    }
}
</script>