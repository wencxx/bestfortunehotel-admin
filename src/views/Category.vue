<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="lsicon:badge-promotion-outline" class="text-4xl" />
            <h1 class="text-xl">Category Lists</h1>
        </div>
        <div class="flex">
            <button class="ml-auto border border-custom-primary text-custom-primary px-3 py-1 rounded hover:shadow-md" @click="willAddPromo = true">Add Category</button>
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
                <!-- <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery"> -->
            </div>
            <div class="full overflow-x-auto">
                <table class="w-full rounded-md overflow-hidden">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-2/5 py-2">Category</th>
                            <th class="border w-1/5 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredCategory()?.length">
                        <tr v-for="(category, index) in filteredCategory()" :key="category.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3">{{ category.category }}</span></td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-xl">
                                    <Icon icon="mdi:trash" class="text-red-500" @click="deleteCategory(category.id, index)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="4">No categories to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AddCategory v-if="willAddPromo" @closeModal="closeModal" />
        <DeleteModal v-if="willDeleteCategory" :type="'Category'" @closeModal="willDeleteCategory = false" @accept="confirmDelete" />
        <ImagesDisplayModal v-if="showImagesDisplayModal" :images="imagesToShow" @closeModal="closeShowImagesModal" />
    </div>
</template>

<script setup>
import AddCategory from '../components/AddCategory.vue'
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
    getCategory()
})


// get categories 
const categories = ref([])

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)

const filteredCategory = () => {
    let filtered = categories.value

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



const categoriesRef = collection(db, 'categories')
const getCategory = async () => {
    try {
        const snapshots = await getDocs(categoriesRef)

        snapshots.docs.forEach(doc => {
            categories.value.push({
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
        categories.value.unshift(data)
    }
    willAddPromo.value = false
}

// delete room
const willDeleteCategory = ref(false)
const categoryToDeleteID = ref('')
const categoryToDeleteIndex = ref('')

const deleteCategory = (promoId, index) => {
    categoryToDeleteID.value = promoId
    categoryToDeleteIndex.value = index
    willDeleteCategory.value = true
}

const confirmDelete = async () => {
    try {
        willDeleteCategory.value = false
        await deleteDoc(doc(db, 'categories', categoryToDeleteID.value))

        categories.value.splice(categoryToDeleteIndex.value, 1)
        $toast.success('Category successfully deleted')
    } catch (error) {
        $toast.error('Failed to delete category')
    }
}
</script>