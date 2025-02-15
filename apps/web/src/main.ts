import { createApp } from 'vue'
import App from '@/App.vue'
import '@/index.css'
import router from '@/composables/router'

import SuperTokens from 'supertokens-web-js'
import { SuperTokensWebJSConfig } from './sessions.config'

SuperTokens.init(SuperTokensWebJSConfig)

console.log('Creating app...', import.meta.env)
console.log('Local mocking is', import.meta.env.PUBLIC_MOCK_ENABLED ? 'enabled' : 'disabled')


const app = createApp(App)
app.use(router)
app.mount('#app')
