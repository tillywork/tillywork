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
      background: '#EEEDED',
      surface: '#FBF8F8',
      accent: '#EEEDED',
      secondary: '#bcffcd',
      error: '#E53935',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#5E35B1',
      background: '#090909',
      surface: '#101112',
      accent: '#17191A',
      secondary: '#88FA9D',
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
