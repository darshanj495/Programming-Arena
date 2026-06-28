import { io } from 'socket.io-client';

export const socket = io('https://programming-arena-7hr2.onrender.com', { autoConnect: false });