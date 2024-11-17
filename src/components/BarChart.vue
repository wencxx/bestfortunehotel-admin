<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

const props = defineProps({
  labels: Array, 
  data: Array, 
  label: String
})

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.data,
      backgroundColor: 'rgba(203, 33, 7, 0.2)', 
      borderColor: '#cb2107',
      fill: true,
      borderWidth: 2,
      tension: 0.4 
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
      text: props.label || 'Todays Booking',
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
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>
