import type { User } from '@/components/common/users/types';
import { useHttp } from '../useHttp';
import { useSnackbarStore } from '@/stores/snackbar';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        showSnackbar({
          message:
            e.response.data.message &&
            e.response.data.message === 'FILE_SIZE_LIMIT'
              ? 'File size exceeds allowed limit (5MB)'
              : 'Something went wrong, please try again.',
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
