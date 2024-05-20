import '@/styles/styles.scss';
import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './app/App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import { VueQueryPlugin } from '@tanstack/vue-query';
import posthog from './plugins/posthog';
import BaseIconBtn from './components/common/base/BaseIconBtn.vue';

const app = createApp(App);

app.component('BaseIconBtn', BaseIconBtn);

const pinia = createPinia();
// Adds router as a store plugin for each store
// can be used by this.$router.push('/')
// from inside the store
pinia.use(({ store }) => {
  store.$router = markRaw(router);
});
// Persist the store through page reload
// make sure to set persist: true in store
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(vuetify);
app.use(router);
app.use(VueQueryPlugin);
app.use(posthog);

app.mount('#root');
