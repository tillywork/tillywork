import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import '@/styles/vuetify.scss';
import { VNumberInput } from 'vuetify/labs/VNumberInput';

const themes = {
  light: {
    dark: false,
    colors: {
      primary: '#126ac2',
      background: '#EAEAEA',
      surface: '#FBFBFB',
      accent: '#EDEDED',
      'accent-lighten': '#F6F6F6',
      navigation: '#EAEAEA',
      secondary: '#BCFFCD',
      error: '#E53935',
      dialog: '#FFFFFF',
      card: '#FFFFFF',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#3692ED',
      background: '#101012',
      surface: '#0D0D0E',
      accent: '#1B1D21',
      'accent-lighten': '#17181B',
      navigation: '#090909',
      secondary: '#88FA9D',
      error: '#EF5350',
      'surface-variant': '#FEFEFE',
      dialog: '#17181B',
      card: '#0D0D0E',
    },
  },
};

const vuetify = createVuetify({
  blueprint: md3,
  components: {
    ...components,
    VNumberInput,
  },
  directives,
  theme: {
    defaultTheme: 'light',
    themes: themes,
  },
  defaults: {
    global: {
      elevation: 0,
    },
    VBtn: {
      color: 'primary',
      class: 'text-body-3',
    },
    VSwitch: {
      color: 'primary',
      flat: true,
      inset: true,
      density: 'comfortable',
    },
    VTextField: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined',
    },
    VDataTable: {
      density: 'compact',
    },
    VCard: {
      rounded: 'md',
    },
    VList: {
      density: 'compact',
      slim: true,
      VListItem: {
        VListItemTitle: {
          class: 'text-body-3',
        },
        VIcon: {
          size: 'x-small',
        },
      },
    },
    VNavigationDrawer: {
      VList: {
        lines: false,
        slim: true,
        nav: true,
      },
      color: 'navigation',
    },
    VMenu: {
      offset: 3,
      width: 200,
      transition: 'none',
    },
    VIcon: {
      size: 'small',
      style: 'opacity: 0.9',
    },
    VSelect: {
      density: 'compact',
      variant: 'outlined',
    },
    VAutocomplete: {
      density: 'compact',
      variant: 'outlined',
    },
    VCombobox: {
      density: 'compact',
      variant: 'outlined',
    },
    VCheckbox: {
      density: 'compact',
      color: 'primary',
      hideDetails: true,
    },
    VChip: {
      rounded: 'pill',
    },
    VAppBar: {
      color: 'navigation',
    },
    VNumberInput: {
      density: 'compact',
      variant: 'outlined',
      VBtn: {
        color: 'default',
        rounded: 'circle',
      },
    },
    VField: {
      rounded: 'pill',
      VIcon: {
        size: 'x-small',
      },
    },
  },
});

export default vuetify;
