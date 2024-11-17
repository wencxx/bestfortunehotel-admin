<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'

const props = defineProps({
  labels: Array, 
  data: Array, 
  label: String
})

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      backgroundColor: ['#cb2107', '#fffc37', '#cb2107'],
      data: props.data,
      borderWidth: 1
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: props.label || 'Revenue Every Year',
      font: {
        size: 18, 
        weight: 'normal'
      },
      padding: {
        bottom: 15
      }
    },
    tooltip: {
      bodyFont: {
        size: 6
      }
    },
  }
}
</script>