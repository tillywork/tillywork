import { useHttp } from '@/composables/useHttp';
import { useSnackbarStore } from '@/stores/snackbar';
import type { User } from '@tillywork/shared';

export type TWFile = {
  id: number;
  name: string;
  url: string;
  type: TWFileType;
  size: string;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
};

export enum TWFileType {
  FILE = 'file',
  IMAGE = 'image',
}

export const useFilesService = () => {
  const { sendRequest } = useHttp();
  const { showSnackbar } = useSnackbarStore();

  async function uploadFiles(files: File[]): Promise<TWFile[]> {
    const fileUploads: TWFile[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const fileUpload = await sendRequest('/files', {
          method: 'POST',
          data: formData,
        });

        fileUploads.push(fileUpload);
      } catch (e: any) {
        let message: string;

        switch (e.response.data.message) {
          case 'FILE_SIZE_LIMIT':
            message = 'File size exceeds allowed limit (5MB)';
            break;

          case 'UPLOAD_LIMIT_EXCEEDED':
            message = `You have reached your project's upload limit.`;
            break;

          default:
            message = 'Something went wrong, please try again.';
            break;
        }

        showSnackbar({
          message,
          color: 'error',
        });
      }
    }

    return fileUploads;
  }

  function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return {
    uploadFiles,
    formatBytes,
  };
};
