import { NextApiResponseServerIo } from '@/lib/types';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path,
            cors: {
                origin: 'http://planner.computerhouse.local', // Sostituisci con il tuo dominio
                methods: ['GET', 'POST'],
                credentials: true, // Se necessario
            },
        });
        io.on('connection', (s) => {
            s.on('create-room', (fileId) => {
                console.log('New client connected');

                s.join(fileId);
            });
            s.on('send-changes', (deltas, fileId) => {
                console.log('CHANGE');
                s.to(fileId).emit('receive-changes', deltas, fileId);
            });
            s.on('send-cursor-move', (range, fileId, cursorId) => {
                s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
            });
        });
        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;