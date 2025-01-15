<template>
    <div class="p-20 !pt-14">
        <div class="w-full grid grid-cols-3 xl:grid-cols-7 gap-5">
            <div class="col-span-5 space-y-5">
                <div class="w-full p-7 border h-fit rounded-xl bg-white grid grid-cols-3">
                    <div class="flex gap-4 justify-center">
                        <div class="bg-blue-200 border border-blue-300 w-10 h-10 flex items-center justify-center p-2 rounded">
                            <Icon icon="majesticons:book-line" class="text-3xl text-neutral-800" />
                        </div>
                        <div class="space-y-4">
                            <h2 class="text-gray-500 text-xl uppercase">Annual Bookings</h2>
                            <h1 class="font-bold text-2xl">{{ Number(confirmedBookings.length).toLocaleString() }}</h1>
                        </div>
                    </div>
                    <div class="flex gap-4 justify-center border-x-2">
                        <div class="bg-orange-200 border border-orange-300 w-10 h-10 flex items-center justify-center p-2 rounded">
                            <Icon icon="mdi:person-group-outline" class="text-3xl text-neutral-800" />
                        </div>
                        <div class="space-y-4">
                            <h2 class="text-gray-500 text-xl uppercase">Annual Guests</h2>
                            <h1 class="font-bold text-2xl">{{ Number(totalGuests).toLocaleString() }}</h1>
                        </div>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <div class="bg-green-200 border border-green-300 w-10 h-10 flex items-center justify-center p-2 rounded">
                            <Icon icon="mdi:user" class="text-3xl text-neutral-800" />
                        </div>
                        <div class="space-y-4">
                            <h2 class="text-gray-500 text-xl uppercase">Annual Revenue</h2>
                            <h1 class="font-bold text-2xl">{{ formatCurrency(totalRevenue) }}</h1>
                        </div>
                    </div>
                </div>
                <!-- graph -->
                <div class="p-10 bg-white rounded-xl border">
                    <select class="border float-end px-3 py-1 rounded" v-model="revenueYear">
                        <option>2020</option>
                        <option>2021</option>
                        <option>2022</option>
                        <option>2023</option>
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028</option>
                        <option>2029</option>
                        <option>2030</option>
                        <option>2031</option>
                        <option>2032</option>
                        <option>2033</option>
                        <option>2034</option>
                        <option>2035</option>
                    </select>
                    <AreaChart :data="Object.values(filteredRevenue)" :labels="revenueMonths" />
                </div>
                <!-- table -->
                <div class="p-10 bg-white rounded-xl border space-y-3">
                    <h1 class="font-medium text-center text-lg text-gray-500">Todays Bookings</h1>
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border py-1">Booking ID</th>
                                <th class="border py-1">Full Name</th>
                                <th class="border py-1">Room</th>
                                <th class="border py-1">Guests</th>
                                <th class="border py-1">Days</th>
                                <th class="border py-1">Status</th>
                            </tr>
                        </thead>
                        <tbody v-if="todaysBooking.length">
                            <tr v-for="booking in todaysBooking" :key="booking.id">
                                <td class="border py-1 text-center">{{ booking.id }}</td>
                                <td class="border py-1 text-center">{{ booking.firstName + ' ' + booking.lastName }}</td>
                                <td class="border py-1 text-center">{{ booking.roomName }}</td>
                                <td class="border py-1 text-center">{{ booking.guests }}</td>
                                <td class="border py-1 text-center">{{ booking.days }}</td>
                                <td class="border py-1 text-center capitalize">
                                    <div class="bg-red-500 text-white rounded" :class="{ '!bg-green-500': booking.status === 'confirmed' }">
                                        {{ booking.status }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr>
                                <td colspan="6" class="border py-2 text-center">No confirmed booking today</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-span-3 xl:col-span-2 space-y-5">
                <div class="bg-white h-56 rounded-xl border p-5">
                    <BarChart :data="[todaysConfirmedBookings.length, canceledBookings.length, pendingBookings.length]" :labels="['Confirmed', 'Canceled', 'Pending']" />
                </div>
                <div class="bg-white space-y-3 h-fit rounded-xl border p-5">
                    <h1 class="text-center text-gray-500 font-medium text-lg">Popular Rooms</h1>
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border py-1 w-1/4">No.</th>
                                <th class="border py-1 w-2/4">Room</th>
                                <th class="border py-1 w-1/4">Bookings</th>
                            </tr>
                        </thead>
                        <tbody v-if="Object.entries(popularRooms).length">
                            <tr v-for="([key, value], index) in Object.entries(popularRooms)" :key="key">
                                <td class="border py-1 text-center">{{ index + 1 }}</td>
                                <td class="border py-1 text-center">{{ key }}</td>
                                <td class="border py-1 text-center">{{ value }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr>
                                <td colspan="3" class="border py-1 text-center">No bookings yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="bg-white space-y-3 h-fit rounded-xl border p-5">
                    <h1 class="text-center text-gray-500 font-medium text-lg">Staff Counts</h1>
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border py-1 w-2/3">Role</th>
                                <th class="border py-1 w-1/3">Count</th>
                            </tr>
                        </thead>
                        <tbody v-if="Object.entries(staffCounts).length">
                            <tr v-for="[key, value] in Object.entries(staffCounts)" :key="key">
                                <td class="border py-1 text-center">{{ key }}</td>
                                <td class="border py-1 text-center">{{ value }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr>
                                <td colspan="3" class="border py-1 text-center">No staffs yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="bg-white space-y-3 h-fit rounded-xl border p-5">
                    <h1 class="text-center text-gray-500 font-medium text-lg">Low Stocks Items</h1>
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border py-1 w-2/3">Item Name</th>
                                <th class="border py-1 w-1/3">Quantity</th>
                            </tr>
                        </thead>
                        <tbody v-if="lowStocks.length">
                            <tr v-for="item in lowStocks" :key="item.id">
                                <td class="border py-1 text-center">{{ item.name }}</td>
                                <td class="border py-1 text-center">{{ item.quantity }}</td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr>
                                <td colspan="3" class="border py-1 text-center">No staffs yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AreaChart from '../components/AreaChart.vue'
import BarChart from '../components/BarChart.vue'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useDataStore } from '../store'

const dataStore = useDataStore()

onMounted(() => {
    dataStore.getBookings()
})

const popularRooms = computed(() => dataStore.popularRooms)
const staffCounts = computed(() => dataStore.staffCounts)


const canceledBookings = computed(() => dataStore.canceledBookings)
const pendingBookings = computed(() => dataStore.pendingBookings)
const todaysConfirmedBookings = computed(() => dataStore.todaysConfirmedBookings)
const confirmedBookings = computed(() => dataStore.confirmedBookings)
const items = computed(() => dataStore.items)

const todaysBooking = computed(() => ([
    ...pendingBookings.value,
    ...todaysConfirmedBookings.value,
]))

const lowStocks = items.value.filter(item => item.quantity < 50)

// filter revenue year
const months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ]
const revenueYear = ref('2024')
const revenueByMonthAndYear = ref({})
const filteredRevenue = ref(null)
const revenueMonths = ref([])

// calculate revenue
const totalGuests = ref(0)
const totalRevenue = ref(0)

watchEffect(() => {
    totalGuests.value = confirmedBookings.value?.reduce((acc, booking) => acc + Number(booking.guests), 0)
    totalRevenue.value = confirmedBookings.value?.reduce((acc, booking) => acc + Number(booking.totalPrice), 0)

    revenueByMonthAndYear.value = confirmedBookings.value.reduce((acc, booking) => {
        const date = new Date(booking.checkIn)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const key = `${year}-${String(month).padStart(2, '0')}`

        if (!acc[key]) {
            acc[key] = 0
        }

        acc[key] += booking.totalPrice
        return acc
    }, {})

    const sortedRevenueByMonthAndYear = Object.fromEntries(
        Object.entries(revenueByMonthAndYear.value).sort(([keyA], [keyB]) => {
            return new Date(keyA) - new Date(keyB);
        })
    )

    filteredRevenue.value = Object.fromEntries(
        Object.entries(sortedRevenueByMonthAndYear).filter(([key]) => key.split('-')[0] === revenueYear.value)
    )

    revenueMonths.value = Object.keys(filteredRevenue.value).map(month => {
        const numbMonth = month.split('-')[1] - 1
        return months[numbMonth]
    })
})

const formatCurrency = (revenue) => {
    return `₱ ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', currencyDisplay: 'code' }).format(Number(revenue)).replace('PHP', '')}`
}
 </script>