<template>
  <div
    class="fixed w-screen h-screen bg-black/30 top-0 left-0 !mt-0 flex items-center justify-center"
  >
    <form
      @submit.prevent="addCategory"
      class="bg-white rounded-md w-full max-w-xl h-fit border p-5 grid grid-cols-2 gap-5"
    >
      <h1 class="text-xl text-center font-medium col-span-2">Add Category</h1>
      <div class="flex flex-col gap-y-1 col-span-2">
        <label>Category<span class="text-custom-primary">*</span></label>
        <input
          type="text"
          class="border rounded h-8 p-2"
          v-model="categoryDetails.category"
        />
      </div>
      <div class="flex gap-x-3 justify-end col-span-2 mt-5">
        <button
          class="border border-custom-primary w-1/4 rounded text-custom-primary"
          type="button"
          @click="closeModal"
        >
          Close
        </button>
        <button
          v-if="!addingPromo"
          class="bg-custom-primary w-1/4 rounded text-white"
        >
          Add
        </button>
        <button
          v-else
          class="bg-custom-primary w-1/4 rounded text-white animate-pulse"
          disabled
        >
          Adding
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import { db, storage } from "../config/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

const emit = defineEmits(["closeModal"]);

const closeModal = () => {
  emit("closeModal");
};

const categoryDetails = ref({
  category: "",
});

// add category
const err = ref(false);
const addingPromo = ref(false);
const categoriesRef = collection(db, "categories");
const addCategory = async () => {
  err.value = false;
  try {
    addingPromo.value = true;

    await addDoc(categoriesRef, categoryDetails.value);

    resetForm();
    emit("closeModal", categoryDetails);
  } catch (error) {
    console.log("Error adding promo:", error);
    err.value = true;
  } finally {
    addingPromo.value = false;
  }
};

const resetForm = () => {
  categoryDetails.value = {
    category: "",
  };
};
</script>
