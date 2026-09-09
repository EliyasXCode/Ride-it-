import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket Connection Error]:', error.message);
    });
  }

  return socketInstance;
}
