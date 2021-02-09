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