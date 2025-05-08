import { useAuthStore } from '@/stores/auth';
import { io, Socket } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';

const socket: Ref<Socket | null> = ref(null);

export function useSocket() {
  const { token } = storeToRefs(useAuthStore());
  const isConnected = ref(false);

  function connect(cb?: () => void) {
    if (socket.value) {
      return;
    }

    const wsUrl = new URL(getWebSocketUrl());
    socket.value = io(wsUrl.origin, {
      path:
        wsUrl.pathname && wsUrl.pathname !== '/'
          ? wsUrl.pathname + '/socket.io'
          : undefined,
      auth: { token: token.value },
      transports: ['polling'],
    });

    socket.value.on('connect', () => {
      console.log('Connected');
      isConnected.value = true;

      if (cb) {
        cb();
      }
    });

    socket.value.on('connect_error', (err) => {
      console.error('Connection error');
      console.error(err);
    });
    socket.value.on('connect_failed', (err) => {
      console.error('Connection failed');
      console.error(err);
    });
    socket.value.on('disconnect', () => {
      console.log('Disconnected');
      isConnected.value = false;
      socket.value = null;
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  }

  function joinRoom(room: string) {
    if (socket.value) {
      socket.value.emit('room:join', { room });
    }
  }

  function getWebSocketUrl(): string {
    try {
      const apiUrl = import.meta.env.TW_VITE_API_URL;
      const url = new URL(apiUrl, window.location.origin);
      const basePath = url.pathname.replace(/\/[^/]+$/, '');
      const protocol = url.protocol;

      return `${protocol}//${url.host}${basePath}`;
    } catch {
      return `${window.location.origin}`;
    }
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
  };
}
