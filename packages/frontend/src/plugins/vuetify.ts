import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

const themes = {
  light: {
    dark: false,
    colors: {
      primary: '#5E35B1',
      secondary: '#FFCA28',
      accent: '#03A9F4',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      error: '#E53935',
      'on-primary': '#FFFFFF',
      'on-secondary': '#212121',
      'on-surface': '#212121',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#5E35B1',
      secondary: '#FFCA28',
      accent: '#29B6F6',
      background: '#121212',
      surface: '#1E1E1E',
      error: '#EF5350',
      'on-primary': '#FFFFFF',
      'on-secondary': '#212121',
      'on-surface': '#E0E0E0',
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
      rounded: 'lg',
      flat: true,
    },
    VSwitch: {
      color: 'primary',
      flat: true,
    },
    VTextField: {
      color: 'primary',
      singleLine: true,
    },
    VDataTable: {
      density: 'compact',
    }
  },
});

export default vuetify;
