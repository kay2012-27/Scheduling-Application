<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Nuxtプラグインから提供されたFirestoreインスタンス($db)を取得
const { $db } = useNuxtApp();

// Firestoreの関数をインポート
import {
  collection, // データを参照する
  addDoc, // データを追加する
  onSnapshot, // データを監視する
  query, // データを取得する
  orderBy, // データをソートする
  deleteDoc, // データを削除する
  doc,
} from "firebase/firestore";

// フォーム入力用のリアクティブな状態
const form = ref({
  name: "",
  title: "",
  date: "",
  time: "",
});

const schedules = ref([]); // データベースから取得した予定リストを保持する状態
const isLoading = ref(true); // データ読み込み中の状態
let unsubscribe = null; // リアルタイムリスナーの解除用

// Read: データのリアルタイム読み取り
onMounted(() => {
  const q = query(collection($db, "schedules"), orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const schedulesData = [];
    querySnapshot.forEach((doc) => {
      schedulesData.push({ id: doc.id, ...doc.data() });
    });
    schedules.value = schedulesData;
    isLoading.value = false;
  });
});

// コンポーネントが破棄されるときにリスナーを解除
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// カレンダーの日付選択イベント
function onSelectedDate(date) {
  // CalendarDate型 → "YYYY-MM-DD" 文字列に変換
  form.value.date = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

// 選択中の日付の予定だけを抽出する算出プロパティ
const filteredSchedules = computed(() => {
  if (!form.value.date) return [];
  return schedules.value.filter(s => s.date === form.value.date);
});

// Create: データの登録
const addSchedule = async () => {
  if (!form.value.date) {
    alert("カレンダーで日付を選択してください。");
    return;
  }
  if (!form.value.name || !form.value.title || !form.value.time) {
    alert("名前、タイトル、時間を入力してください。");
    return;
  }
  try {
    await addDoc(collection($db, "schedules"), {
      name: form.value.name,
      title: form.value.title,
      time: form.value.time,
      date: form.value.date, 
      createdAt: new Date(),
    });
    // フォームをリセット（名前とタイトルのみ）
    form.value.name = "";
    form.value.title = "";
    form.value.time = "";
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("予定の登録に失敗しました。");
  }
};


// Delete: データの削除
const deleteSchedule = async (id) => {
  if (!window.confirm("この予定を削除しますか？")) return;
  try {
    // 指定されたIDのドキュメントを削除
    await deleteDoc(doc($db, "schedules", id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    alert("予定の削除に失敗しました。");
  }
};

</script>

<template>
  <div class="container">

    <form @submit.prevent="addSchedule" class="schedule-form">
      <input type="name" v-model="form.name" placeholder="名前" required />
      <input type="text" v-model="form.title" placeholder="予定のタイトル" required />
      <input type="time" v-model="form.time" required />
      <button type="submit">登録</button>
    </form>
    
    <UCalendar v-model="value" @update:model-value="onSelectedDate"/>

    <div class="schedules-list" v-if="form.date">
      <br>
      <h2>{{ form.date }} の予定</h2>
      <p v-if="isLoading">読み込み中...</p>
      <p v-else-if="filteredSchedules.length === 0">登録された予定はありません。</p>
      <ul v-else>
        <li v-for="schedule in filteredSchedules" :key="schedule.id">
          <div class="schedule-info">
            <span class="schedule-name">{{ schedule.name }}</span>
            <span class="schedule-title">{{ schedule.title }}</span>
            <span class="schedule-datetime">{{ schedule.time }}</span>
          </div>
          <button @click="deleteSchedule(schedule.id)" class="delete-button">
            削除
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .container {
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
  }
  h1 {
    text-align: center;
    color: #333;
  }
  .schedule-form {
    display: flex;
    gap: 10px;
    margin-bottom: 2rem;
  }
  .schedule-form input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
  }
  .schedule-form input[type="text"] {
    flex-grow: 1;
  }
  .schedule-form button {
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer;
  }
  .schedules-list h2 {
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
  .schedules-list ul {
    list-style: none;
    padding: 0;
  }
  .schedules-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }
  .schedule-name {
    font-weight: bold;
    margin: 15px;
  }
  .schedule-title {
    font-weight: bold;
    margin: 15px;
  }
  .schedule-datetime {
    font-weight: bold;
    margin: 15px;
  }
  .delete-button {
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: bold;
  }
</style>
