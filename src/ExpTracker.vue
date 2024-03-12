<script setup>
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import db from "./firebase/config.js";
import { onMounted, ref } from "vue";
import { computed } from "vue";

const expenses = ref([]);
const name = ref("");
const category = ref("");
const amount = ref("");
const isEditing = ref(false);
const editId = ref(null);

const buttonText = computed(() => {
  return isEditing.value ? "Save Expense" : "Add Expense";
});

const getExpenses = async () => {
  onSnapshot(collection(db, "ExpenseTracker"), (querySnap) => {
    const tmp = [];
    querySnap.forEach((doc) => {
      const expense = {
        id: doc.id,
        data: doc.data(),
      };
      tmp.push(expense);
    });
    expenses.value = tmp;

    expenses.value.sort((a, b) => a.data.category - b.data.category);
  });
};

const addExpense = async () => {
  if (
    !name.value.trim() ||
    !category.value.trim() ||
    !amount.value.toString().trim()
  ) {
    alert("Enter data first");
    return;
  }

  const data = {
    datetime: new Date(),
    name: name.value,
    category: category.value,
    amount: amount.value,
  };

  if (isEditing.value) {
    await updateExpense(editId.value, data);
  } else {
    await addDoc(collection(db, "ExpenseTracker"), data);
  }

  name.value = "";
  category.value = "";
  amount.value = "";
  isEditing.value = false;
  editId.value = null;
};

const onDelete = async (id) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this expense?"
  );
  if (confirmDelete) {
    await deleteDoc(doc(db, "ExpenseTracker", id));
    expenses.value = expenses.value.filter((expense) => expense.id !== id);
  }
};

const onEdit = async (id) => {
  const expense = expenses.value.find((expense) => expense.id === id);

  name.value = expense.data.name;
  category.value = expense.data.category;
  amount.value = expense.data.amount;
  isEditing.value = true;
  editId.value = id;
};

const updateExpense = async (id, data) => {
  await setDoc(doc(db, "ExpenseTracker", id), data);
};

const formatDateTime = (timestamp) => {
  if (!timestamp || !timestamp.seconds) {
    return "Invalid Date";
  }

  const milliseconds =
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  const date = new Date(milliseconds);
  return date.toLocaleString();
};

const totalExpense = computed(() => {
  let total = expenses.value.reduce((acc, expense) => {
    return acc + parseFloat(expense.data.amount);
  }, 0);
  return "₱" + total.toFixed(2);
});

onMounted(() => {
  getExpenses();
});
</script>

<template>
  <div class="justify-center items-center h-full">
    <div>
      <h1 class="text-center m-5 text-3xl font-bold">Expense Tracker</h1>

      <div class="flex flex-col justify-center mx-auto md:flex-row">
        <div
          class="lg:w-1/3 m-3 p-3 border border-slate-500 rounded"
          style="height: 450px"
        >
          <form
            @submit.prevent="addExpense"
            class="flex flex-col"
            style="height: 100%"
          >
            <label for="name" class="my-5">Item: </label>
            <input
              type="text"
              v-model="name"
              class="border border-slate-500 rounded mb-5 p-2"
            />

            <label for="category" class="my-5">Category: </label>
            <select
              v-model="category"
              class="mb-5 border border-slate-500 rounded p-2"
            >
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
            </select>

            <label for="amount" class="my-5">Amount: </label>
            <input
              type="number"
              v-model="amount"
              class="border border-slate-500 rounded mb-5 p-2"
            />
            <button
              type="submit"
              class="border-2 py-2 rounded text-black hover:opacity-80 hover:border-black hover:text-white hover:bg-black transition ease-linear duration-100"
            >
              {{ buttonText }}
            </button>
          </form>
        </div>

        <div class="lg:w-2/3 m-3" style="max-height: 450px; width: 100%">
          <div>
            <table class="scrolldown">
              <thead>
                <tr>
                  <th class="px-3 py-2 border">Date & Time</th>
                  <th class="px-3 py-2 border">Item</th>
                  <th class="px-3 py-2 border">Category</th>
                  <th class="px-3 py-2 border">Amount</th>
                  <th class="px-3 py-2 border">...</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in expenses" :key="expense.id">
                  <td class="px-3 py-2 border nowrap">
                    {{ formatDateTime(expense.data.datetime) }}
                  </td>
                  <td class="px-3 py-2 border nowrap">
                    {{ expense.data.name }}
                  </td>
                  <td class="px-3 py-2 border nowrap">
                    {{ expense.data.category }}
                  </td>
                  <td class="px-3 py-2 border nowrap">
                    {{ "₱" + parseFloat(expense.data.amount).toFixed(2) }}
                  </td>
                  <td class="px-3 py-2 border text-center">
                    <button @click="onEdit(expense.id)" class="mx-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 text-blue-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button @click="onDelete(expense.id)" class="mx-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 text-red-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="px-3 py-2 border-1">
                    Total Expenses: {{ totalExpense }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
table.scrolldown {
  height: 450px;
}

table.scrolldown tbody,
table.scrolldown thead {
  display: block;
}

thead,
tfoot {
  border: 1px solid black;
}

table.scrolldown tbody {
  height: 364.4px;
  overflow: auto;
  width: 100%;
}

table.scrolldown tbody::-webkit-scrollbar {
  display: none;
}

tbody td,
thead th {
  width: 300px;
}

.nowrap {
  white-space: nowrap;
}

td {
  text-align: center;
}

table.scrolldown tbody td,
table.scrolldown thead th {
  width: auto;
  min-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

table.scrolldown tbody td,
table.scrolldown thead th {
  text-align: center;
}
</style>
