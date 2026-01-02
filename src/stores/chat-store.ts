
'use client';
import { create } from 'zustand';
import type { ChatContact, ChatMessage, UserProfile as FirestoreUser } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { format } from 'date-fns';

type ChatState = {
  messages: Record<string, ChatMessage[]>;
};

type ChatActions = {
  sendMessage: (contactId: string, text: string, senderInitials: string) => void;
};

// Only managing messages now
const mockMessages: Record<string, ChatMessage[]> = {
    // This user ID corresponds to the default admin user
    'fHHF0vDosiMaC5ZcMLi6oDgroFR2': [
        { id: 'msg1', text: 'Hi, I have a question about my last trip.', sender: 'otherUser', timestamp: '10:40', initials: 'U' },
        { id: 'msg2', text: 'Sure, I can help with that.', sender: 'currentUser', timestamp: '10:42', initials: 'ME' },
    ],
    // This is a driver dlNo
    'D12345678': [
        { id: 'msg3', text: 'Ali, please head to the new pickup point at Olaya Towers.', sender: 'otherAgent', timestamp: '11:02', initials: 'SA' },
        { id: 'msg4', text: 'Copy that. On my way now.', sender: 'otherUser', timestamp: '11:03', initials: 'AA' },
        { id: 'msg5', text: 'I have arrived at the pickup location.', sender: 'otherUser', timestamp: '11:05', initials: 'AA' },
    ],
    // This is a client ID
    'CUST-001': [
        { id: 'msg6', text: 'Can I get an ETA for job #JOB-201?', sender: 'otherUser', timestamp: '10:55', initials: 'GS' },
        { id: 'msg7', text: 'Certainly, let me check for you. The driver should be there in approximately 15 minutes.', sender: 'currentUser', timestamp: '10:56', initials: 'ME' },
    ],
};


export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
    messages: mockMessages,
    sendMessage: (contactId, text, senderInitials) => {
        const now = new Date();
        const newMessage: ChatMessage = {
            id: `msg-${now.getTime()}`,
            text,
            sender: 'otherUser', // 'otherUser' from the current user's perspective in the UI
            timestamp: format(now, 'HH:mm'),
            initials: senderInitials,
        };

        const updatedMessages = { ...get().messages };
        if (!updatedMessages[contactId]) {
            updatedMessages[contactId] = [];
        }
        updatedMessages[contactId].push(newMessage);
        
        // Simulate agent reply for demo purposes
        setTimeout(() => {
            const agentReply: ChatMessage = {
                id: `msg-${now.getTime() + 1}`,
                text: 'This is an automated reply. We are looking into your message.',
                sender: 'otherAgent',
                timestamp: format(new Date(), 'HH:mm'),
                initials: 'A',
            };
             updatedMessages[contactId].push(agentReply);
             set({ messages: { ...updatedMessages } });
        }, 1500);

        set({ messages: updatedMessages });
    }
}));

export type { ChatMessage };
