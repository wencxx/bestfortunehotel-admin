<template>
    <div class="p-20 !pt-14 space-y-10">
        <div class="flex gap-x-2 items-center">
            <Icon icon="material-symbols-light:inventory-rounded" class="text-4xl" />
            <h1 class="text-xl">Room Stock Inventory</h1>
        </div>
        <div class="flex">
            <button class="ml-auto border border-custom-primary text-custom-primary px-3 py-1 rounded hover:shadow-md" @click="willAddItem = true">Add Item</button>
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
                    <option>In Stock</option>
                    <option>Low Stock</option>
                </select>
                <!-- <input type="text" placeholder="Search" class="border rounded pl-2 ml-auto" v-model="searchQuery"> -->
                <button class="bg-green-500 text-white px-3 rounded ml-auto" @click="generatePDF">Generate PDF</button>
            </div>
            <div class="full overflow-x-auto">
                <table class="w-full rounded-md overflow-hidden" id="inventoryTable">
                    <thead class="bg-custom-primary text-white">
                        <tr>
                            <th class="border w-2/5 py-2">Item</th>
                            <th class="border w-2/5 py-2">Category</th>
                            <th class="border w-1/5 py-2">Quantity</th>
                            <th class="border w-1/5 py-2">Status</th>
                            <th class="border w-1/5 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="filteredItems()?.length">
                        <tr v-for="(item, index) in filteredItems()" :key="item.id" :class="{ 'bg-gray-100': index % 2 === 0 }" class="border-b">
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3">{{ item.name }}</span></td>
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3">{{ item.category }}</span></td>
                            <td class="border-x text-center py-2 capitalize px-2"><span class="line-clamp-3">{{ item.quantity }}</span></td>
                            <td class="border-x text-center py-2 capitalize">
                                <button class="bg-green-500 px-3 rounded text-white" :class="{ 'bg-red-500': item.quantity < 50 }">
                                    {{ item.quantity > 49 ? 'In Stock' : 'Low Stock'  }}
                                </button>
                            </td>
                            <td class="border-x text-center py-2">
                                <div class="flex items-center gap-x-2 justify-center text-xl">
                                    <Icon icon="mdi:pencil" class="text-green-500" @click="editItem(item, index)" />
                                    <Icon icon="mdi:trash" class="text-red-500" @click="deleteItem(item.id, index)" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td class="border text-center py-2" colspan="5">No items to show</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AddItem v-if="willAddItem" @closeModal="closeModal" type='stock' />
        <EditItem v-if="willEditItem" @closeModal="closeEditModal" :itemDetailsToEdit="itemToEditDetails" />
        <DeleteModal v-if="willDeleteItem" :type="'Item'" @closeModal="willDeleteItem = false" @accept="confirmDelete" />
    </div>
</template>

<script setup>
import AddItem from '../components/AddItem.vue'
import EditItem from '../components/EditItem.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { onMounted, ref, watch } from 'vue'
import { db } from '../config/firebaseConfig'
import { collection, getDocs, doc, deleteDoc, addDoc, query, where } from 'firebase/firestore'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import moment from 'moment'
import jsPDF from "jspdf";
import "jspdf-autotable";
import headerImage from "../assets/277741668_347625477389163_2974931926985871192_n-removebg-preview.png";

const $toast = useToast()

onMounted(() => {
    getItems()
    loadNotifiedItems()
})

// get items 
const items = ref([])

const filterSelect = ref('')
const searchQuery = ref('')
const rowLimit = ref(5)

const filteredItems = () => {
    let filtered = items.value

    if (filterSelect.value) {
        if (filterSelect.value === 'In Stock') {
            filtered = filtered.filter(item => item.quantity > 49)
        } else if (filterSelect.value === 'Low Stock') {
            filtered = filtered.filter(item => item.quantity < 50)
        }
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(query)
            )
        )
    }

    return filtered.slice(0, rowLimit.value)
}

const itemsRef = collection(db, 'items')
const getItems = async () => {
    try {
        const q = query(
            itemsRef,
            where('type', '==', 'stock')
        )
        const snapshots = await getDocs(q)

        snapshots.docs.forEach(doc => {
            items.value.push({
                id: doc.id,
                ...doc.data()
            })
        })
    } catch (error) {
        console.log(error)
    }
}

// add item
const willAddItem = ref(false)

const closeModal = (data) => {
    if(data){
        items.value.unshift(data)
    }
    willAddItem.value = false
}

// edit item
const willEditItem = ref(false)
const itemToEditDetails = ref({})
const itemIndex = ref(0)

const editItem = (promoInfo, index) => {
    willEditItem.value = true
    itemToEditDetails.value = promoInfo
    itemIndex.value = index
}

const closeEditModal = (data) => {
    if(data){
        items.value[itemIndex.value] = data
    }
    willEditItem.value = false
}

// delete item
const willDeleteItem = ref(false)
const itemToDeleteId = ref('')
const itemToDeleteIndex = ref('')

const deleteItem = (itemId, index) => {
    itemToDeleteId.value = itemId
    itemToDeleteIndex.value = index
    willDeleteItem.value = true
}

const confirmDelete = async () => {
    try {
        willDeleteItem.value = false
        await deleteDoc(doc(db, 'items', itemToDeleteId.value))

        items.value.splice(itemToDeleteIndex.value, 1)
        $toast.success('Item successfully deleted')
    } catch (error) {
        console.log(error)
        $toast.error('Failed to delete item')
    }
}

// check if has low stock
const notifRef = collection(db, 'notifications')

const lowStockThreshold = 50
const notifiedItems = ref(new Set())

const loadNotifiedItems = () => {
    const savedNotifiedItems = JSON.parse(localStorage.getItem('notifiedItems')) || []
    notifiedItems.value = new Set(savedNotifiedItems)
}

const saveNotifiedItems = () => {
    localStorage.setItem('notifiedItems', JSON.stringify(Array.from(notifiedItems.value)))
}

watch(
  () => items.value,
  async (newItems) => {
    try {
      const lowStockItems = newItems.filter(item => item.quantity < lowStockThreshold);
      const itemsToNotify = lowStockItems.filter(item => !notifiedItems.value.has(item.id));

      if (itemsToNotify.length > 0) {
        const notificationPromises = itemsToNotify.map(item =>
          addDoc(notifRef, {
            itemName: item.name,
            notif: `Inventory Alert: ${item.name} stock is below the threshold. Consider restocking soon.`,
            isRead: false,
            isView: false,
            notifiedAt: new Date()
          })
        );

        await Promise.all(notificationPromises);

        itemsToNotify.forEach(item => notifiedItems.value.add(item.id));
        saveNotifiedItems();
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
    }
  },
  { immediate: true, deep: true }
);

// generate csv
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

  doc.addImage(headerImage, "PNG", imageX, 10, imageWidth, 25);

  doc.setFontSize(18);
  doc.text(headerText, pageWidth / 2, 40, { align: "center" });

  doc.setFontSize(12);
  doc.text(headerAddressLine1, pageWidth / 2, 45, { align: "center" });

  doc.setFontSize(12);
  doc.text(headerAddressLine2, pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(12);
  doc.text(headerPhone, pageWidth / 2, 55, { align: "center" });

  doc.setFontSize(12);
  doc.text(headerEmail, pageWidth / 2, 60, { align: "center" });

  let table = document.getElementById("inventoryTable");
  let rows = table.querySelectorAll("tr");
  let data = [];

  rows.forEach((row) => {
    let rowData = [];
    let cols = row.querySelectorAll("td, th");

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

  doc.save("stock-inventory.pdf");
};
</script>
