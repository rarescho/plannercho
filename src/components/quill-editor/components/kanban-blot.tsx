/* eslint-disable react/no-deprecated */
import Quill from 'quill';
import ReactDOM from 'react-dom';
import React from 'react';
import KanbanBoard from './kanban-board'; // Il tuo componente Kanban

const Embed: any = Quill.import('blots/embed');

class KanbanBlot extends Embed {
    static create(value: any) {
        const node = super.create(value);
        ReactDOM.render(<KanbanBoard />, node);
        return node;
    }

    static value(node: { dataset: { value: any; }; }) {
        return node.dataset.value;
    }
}

KanbanBlot.blotName = 'kanban';
KanbanBlot.tagName = 'div';
KanbanBlot.className = 'kanban-container';

Quill.register(KanbanBlot);
