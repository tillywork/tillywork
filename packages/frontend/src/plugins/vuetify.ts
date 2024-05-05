import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import '@/styles/vuetify.scss';

const themes = {
  light: {
    dark: false,
    colors: {
      primary: '#5E35B1',
      secondary: '#bcffcd',
      accent: '#03A9F4',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      error: '#E53935',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#5E35B1',
      background: '#080808',
      surface: '#0f1011',
      accent: '#17181a',
      menu: '#1b1c1f',
      secondary: '#88fa8d',
      error: '#EF5350',
    },
  },
};

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: themes,
  },
  defaults: {
    global: {
      elevation: 0,
    },
    VBtn: {
      color: 'primary',
      rounded: 'md',
    },
    VSwitch: {
      color: 'primary',
      flat: true,
    },
    VTextField: {
      color: 'primary',
      density: 'compact',
    },
    VDataTable: {
      density: 'compact',
    },
  },
});

export default vuetify;
