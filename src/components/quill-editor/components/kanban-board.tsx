import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'TASK';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
        { id: 2, title: 'Task 2', description: 'Description 2', status: 'In Progress' },
        { id: 3, title: 'Task 3', description: 'Description 3', status: 'Done' },
    ]);

    const updateTaskStatus = (id: number, status: any) => {
        setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {['To Do', 'In Progress', 'Done'].map((status) => (
                    <Column
                        key={status}
                        status={status}
                        tasks={tasks.filter((task) => task.status === status)}
                        updateTaskStatus={updateTaskStatus}
                    />
                ))}
            </div>
        </DndProvider>
    );
};

const Column = ({ status, tasks, updateTaskStatus }: { status: string; tasks: Array<{ id: number; title: string; description: string; status: string }>; updateTaskStatus: (id: number, status: string) => void }) => {
    const [, drop] = useDrop({
        accept: ItemType,
        drop: (item: any) => updateTaskStatus(item.id, status),
    });

    return (
        <div style={{ width: '30%', padding: '1rem', border: '1px solid black' }}>
            <h2>{status}</h2>
            {tasks.map((task) => (
                <Task key={task.id} task={task} />
            ))}
        </div>
    );
};

interface TaskProps {
    task: {
        id: number;
        title: string;
        description: string;
        status: string;
    };
}

const Task = ({ task }: TaskProps) => {
    const [, drag] = useDrag({
        type: ItemType,
        item: { id: task.id },
    });

    return (
        <div style={{ padding: '1rem', margin: '0.5rem 0', border: '1px solid gray' }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
        </div>
    );
};

export default KanbanBoard;
