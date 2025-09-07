import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './style.css'
import 'remixicon/fonts/remixicon.css'

// Глобальный обработчик ошибок
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Здесь можно добавить отправку ошибок в систему мониторинга
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

// Глобальный обработчик ошибок Vue
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  // Здесь можно добавить отправку ошибок в систему мониторинга
}

app.mount('#app')