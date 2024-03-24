import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import '@babylonjs/loaders/glTF'
import '@babylonjs/loaders/OBJ/objFileLoader'

// Import our custom CSS
import './scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.mount('#app')
