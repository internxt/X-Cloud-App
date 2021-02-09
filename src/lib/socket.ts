import axios from 'axios';
import io from 'socket.io-client';
export const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000', {
    transports: ['websocket'],
    upgrade: false,
    path: '/api/sockets',
    timeout: 60000 
});

export const reconnect = ({ wait }) : Promise<boolean> => {
    socket.connect();
    return new Promise((res) => {
        setTimeout(() => res(false), wait * 1000); 
        socket.on('connect', () => res(true));
    });
}

export const isInternetWorking = async () : Promise<boolean> => {
    try {
        await axios.get('https://www.google.com');
        return true;
    } catch (e) {
        return false;
    }
}

export const handleDisconnectedSocket = async () : Promise<string> => {
    const reconnected = await reconnect({ wait: 10 });
    if (reconnected) return 'Reconnected';

    const isWorking = await isInternetWorking();
    return isWorking ? 'server error' : 'internet connection failed';
} 