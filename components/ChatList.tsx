
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from '../types';

interface ChatListProps {
    messages: Message[];
    onImageClick?: (url: string) => void;
}

// React.memo asegura que este componente SOLO se re-renderice si 'messages' cambia.
// No se re-renderizará si el padre (App) cambia el estado 'inputValue'.
export const ChatList = React.memo(({ messages, onImageClick }: ChatListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);

    // Detectar si el usuario subió el scroll manualmente para no bajarle de golpe
    useLayoutEffect(() => {
        const node = chatAreaRef.current;
        if (node) {
            const { scrollTop, scrollHeight, clientHeight } = node;
            // Si está cerca del final (50px), activamos autoscroll
            shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
        }
    });

    useEffect(() => {
        if (shouldAutoScrollRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="chat-area" ref={chatAreaRef} role="log" aria-live="polite">
            {messages.map(msg => <ChatMessage key={msg.id} message={msg} onImageClick={onImageClick} />)}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
    );
});
