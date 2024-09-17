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
      background: '#F3F3F3',
      surface: '#F7F7F7',
      accent: '#EAEAEA',
      navigation: '#EAEAEA',
      secondary: '#BCFFCD',
      error: '#E53935',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#3692ed',
      background: '#090909',
      surface: '#101112',
      accent: '#17191A',
      navigation: '#131516',
      secondary: '#88FA9D',
      error: '#EF5350',
      'surface-variant': '#FEFEFE',
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
      rounded: 'md',
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
  },
});

export default vuetify;
