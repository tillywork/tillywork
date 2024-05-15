import '@/styles/styles.scss';
import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './app/App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { DataLoaderPlugin } from 'vue-router/auto';

const app = createApp(App);

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
app.use(DataLoaderPlugin, { router });
app.use(router);
app.use(VueQueryPlugin);

app.mount('#root');
