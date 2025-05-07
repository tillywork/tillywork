import { useAuthStore } from '@/stores/auth';
import { io, Socket } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';

let socket: Socket | null = null;

export function useSocket() {
  const { token } = storeToRefs(useAuthStore());
  const isConnected = ref(false);

  function connect() {
    if (socket) {
      return;
    }

    socket = io(import.meta.env.TW_VITE_WS_URL, {
      auth: { token: token.value },
    });

    socket.on('connect', () => {
      isConnected.value = true;
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function joinRoom(room: string) {
    if (socket) {
      socket.emit('room:join', { room });
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
