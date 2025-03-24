<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-5 rounded-lg shadow-lg w-1/3">
      <h2 class="text-xl mb-4">Select Columns</h2>
      <div class="space-y-2">
        <div v-for="column in columns" :key="column">
          <label>
            <input type="checkbox" v-model="selectedColumns" :value="column" />
            {{ column }}
          </label>
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <button class="bg-gray-500 text-white px-3 py-1 rounded mr-2" @click="emit('closeModal')">Cancel</button>
        <button class="bg-blue-500 text-white px-3 py-1 rounded" @click="updateColumns">Update</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['updateColumns', 'closeModal'])

const columns = [
  'Booking At', 'Booking Id', 'Type', 'Name', 'GCASH Reference', 'Room Name',
  'Guests', 'Floor', 'Room Number', 'Check In', 'Check Out', 'Days', 'Add Ons',
  'Total Price', 'Status', 'Action'
]

const selectedColumns = ref([...columns])

const updateColumns = () => {
  emit('updateColumns', selectedColumns.value)
  emit('closeModal')
}
</script>
