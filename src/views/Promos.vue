<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="lsicon:badge-promotion-outline" class="text-4xl" />
            <h1 class="text-xl">Promo Lists</h1>
        </div>
        <div class="flex">
            <button class="ml-auto border border-custom-primary text-custom-primary px-3 py-1 rounded hover:shadow-md" @click="willAddPromo = true">Add Promo</button>
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
                <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery">
            </div>
            <div class="full overflow-x-auto">
                <table class="w-full rounded-md overflow-hidden">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-2/5 py-2">Promo Description</th>
                            <th class="border w-1/5 py-2">Attachments</th>
                            <th class="border w-1/5 py-2">Promo end</th>
                            <th class="border w-1/5 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredPromos()?.length">
                        <tr v-for="(promo, index) in filteredPromos()" :key="promo.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3">{{ promo.description }}</span></td>
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3 cursor-pointer" @click="showImages(promo.imagesUrls)">{{ promo.imagesUrls.length }} Attachments</span></td>
                            <td class="border-x text-center py-2 capitalize">{{ moment(promo.end).format('LL') }}</td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-xl">
                                    <Icon icon="mdi:pencil" class="text-green-500" @click="editPromo(promo, index)" />
                                    <Icon icon="mdi:trash" class="text-red-500" @click="deletePromo(promo.id, index)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="4">No promos to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AddPromo v-if="willAddPromo" @closeModal="closeModal" />
        <EditPromo v-if="willEditPromo" @closeModal="closeEditModal" :promoDetailsToEdit="promoToEditDetails" />
        <DeleteModal v-if="willDeletePromo" :type="'Promo'" @closeModal="willDeletePromo = false" @accept="confirmDelete" />
        <ImagesDisplayModal v-if="showImagesDisplayModal" :images="imagesToShow" @closeModal="closeShowImagesModal" />
    </div>
</template>

<script setup>
import AddPromo from '../components/AddPromo.vue'
import EditPromo from '../components/EditPromo.vue'
import DeleteModal from '../components/DeleteModal.vue'
import ImagesDisplayModal from '../components/ImagesDisplay.vue'
import { onMounted, ref } from 'vue'
import { db } from '../config/firebaseConfig'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import moment from 'moment'

const $toast = useToast()

onMounted(() => {
    getRoom()
})


// get promos 
const promos = ref([])

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)

const filteredPromos = () => {
    let filtered = promos.value

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



const promosRef = collection(db, 'promos')
const getRoom = async () => {
    try {
        const snapshots = await getDocs(promosRef)

        snapshots.docs.forEach(doc => {
            promos.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log(error)
    }
}

// add room
const willAddPromo = ref(false)

const closeModal = (data) => {
    if(data){
        promos.value.unshift(data)
    }
    willAddPromo.value = false
}

// edit room
const willEditPromo = ref(false)
const promoToEditDetails = ref({})
const promoIndex = ref(0)

const editPromo = (promoInfo, index) => {
    willEditPromo.value = true
    promoToEditDetails.value = promoInfo
    promoIndex.value = index
}

const closeEditModal = (data) => {
    if(data){
        promos.value[promoIndex.value] = data
    }
    willEditPromo.value = false
}

// delete room
const willDeletePromo = ref(false)
const promoToDeleteId = ref('')
const promoToDeleteIndex = ref('')

const deletePromo = (promoId, index) => {
    promoToDeleteId.value = promoId
    promoToDeleteIndex.value = index
    willDeletePromo.value = true
}

const confirmDelete = async () => {
    try {
        willDeletePromo.value = false
        await deleteDoc(doc(db, 'promos', promoToDeleteId.value))

        promos.value.splice(promoToDeleteIndex.value, 1)
        $toast.success('Promo successfully deleted')
    } catch (error) {
        $toast.error('Failed to delete promo')
    }
}

const imagesToShow = ref([])
const showImagesDisplayModal = ref(false)

const showImages = (images) => {
    imagesToShow.value = images
    showImagesDisplayModal.value = true
}

const closeShowImagesModal = () => {
    showImagesDisplayModal.value =  false
    imagesToShow.value = []
}
</script>