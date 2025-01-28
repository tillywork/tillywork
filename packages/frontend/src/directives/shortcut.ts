import { render, type Directive } from 'vue';
import { install, uninstall } from '@github/hotkey';

const shortcutDirective = <Directive<HTMLElement, string>>{
  mounted(el, { value }) {
    if (value === '') {
      return;
    }
    install(el, value);

    let slot = el.querySelector('.v-list-item__append');

    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'v-list-item__append';
      el.appendChild(slot);
    }

    const vnode = h(
      'div',
      {
        class: 'v-kbd ms-2 text-xs elevation-0 font-weight-medium',
      },
      value.toUpperCase()
    );
    render(vnode, slot);
  },
  beforeUnmount(el) {
    uninstall(el);
    const slot = el.querySelector('.v-list-item__append');
    if (slot) {
      render(null, slot);
      if (slot.childNodes.length === 0) {
        slot.remove();
      }
    }
  },
};

export default shortcutDirective;
