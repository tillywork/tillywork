import { Extension } from '@tiptap/core';
import { EditorView } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import type { TWFile } from '@/composables/services/useFilesService';

interface FileHandlerOptions {
  uploadFn: (files: File[]) => Promise<TWFile[]>; // Function to handle the file upload
}

export const FileHandler = Extension.create<FileHandlerOptions>({
  name: 'fileHandler',

  addOptions() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      uploadFn: async (files: File[]) => [], // Default upload function
    };
  },

  addProseMirrorPlugins() {
    const uploadFiles = async (view: EditorView, files: File[]) => {
      const { uploadFn } = this.options;
      if (!uploadFn) {
        console.error('No upload function provided');
        return;
      }

      // Separate images from other files
      const images: File[] = [];
      const genericFiles: File[] = [];
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          images.push(file);
        } else {
          genericFiles.push(file);
        }
      });

      if (images.length === 0 && genericFiles.length === 0) {
        return;
      }

      const imageUploads = await uploadFn(images);
      const fileUploads = await uploadFn(genericFiles);

      const state = view.state;
      const tr = state.tr;

      imageUploads.forEach((fileUpload) => {
        const node = view.state.schema.nodes.image.create({
          src: fileUpload.url,
        });

        if (!state.selection.empty) {
          tr.insert(state.selection.to, node);
        } else {
          tr.replaceSelectionWith(node);
        }
      });

      fileUploads.forEach((fileUpload) => {
        const node = view.state.schema.nodes.file.create(fileUpload);

        if (!state.selection.empty) {
          tr.insert(state.selection.to, node);
        } else {
          tr.replaceSelectionWith(node);
        }
      });

      if (tr.docChanged) {
        view.dispatch(tr);
      }
    };

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            paste: (view: EditorView, event: ClipboardEvent) => {
              const items = event.clipboardData?.items;
              const files: File[] = [];

              if (items) {
                // Convert items to an array
                Array.from(items).forEach((item) => {
                  if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
                      files.push(file);
                    }
                  }
                });
              }

              if (files.length) {
                uploadFiles(view, files);
                return true;
              }
              return false;
            },
            drop: (view: EditorView, event: DragEvent) => {
              const files = Array.from(event.dataTransfer?.files || []);
              if (files.length) {
                uploadFiles(view, files);
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
