import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// ★ FirebaseOptions 型をインポートする
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  // ★ as FirebaseOptions を追加して型を明示的に指定する
  const firebaseConfig = config.public.firebase as FirebaseOptions

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  nuxtApp.provide('db', db)
})