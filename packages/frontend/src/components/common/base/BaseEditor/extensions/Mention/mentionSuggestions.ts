/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';

import MentionList from './MentionList.vue';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';

export default {
  items: async ({ query }: { query: string }) => {
    const { project } = storeToRefs(useAuthStore());
    const { getProjectUsers } = useProjectUsersService();
    const users = (await getProjectUsers({ projectId: project.value!.id })).map(
      (pU) => pU.user
    );

    return users
      .filter((user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .startsWith(query.toLowerCase())
      )
      .slice(0, 5);
  },

  render: () => {
    let component: VueRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        // Don't show user text in suggestions dropdown
        props.text = undefined;

        component = new VueRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        // Don't show user text in suggestions dropdown
        props.text = undefined;
        component.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
