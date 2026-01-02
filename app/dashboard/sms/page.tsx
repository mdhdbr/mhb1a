
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Phone, Video, Search, User, Truck, Building, Loader2, ArrowRight, MessageSquare, Users } from 'lucide-react';
import { useChatStore, type ChatMessage } from '@/stores/chat-store';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { useUserStore } from '@/stores/user-store';
import { useDriverStore } from '@/stores/driver-store';
import { useCustomerStore } from '@/stores/customer-store';
import { Badge } from '@/components/ui/badge';
import ContextMenu from '@/components/context-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { ChatContact } from '@/lib/types';


const ChatMessageBubble = ({ message, contactType }: { message: ChatMessage, contactType?: 'Admin' | 'Agent' | 'Driver' | 'Customer' | 'User' }) => {
    const isCurrentUser = message.sender === 'currentUser';
    const isOtherAgent = message.sender === 'otherAgent';
    
    const agentInitials = message.initials || 'A';

    return (
        <div className={cn("flex w-full items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
             {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                        {isOtherAgent ? agentInitials : message.initials}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col gap-1">
                 {!isCurrentUser && isOtherAgent && (
                    <p className="text-xs text-muted-foreground ml-2">Agent Response</p>
                 )}
                <div className={cn(
                    "max-w-xs md:max-w-md rounded-lg px-4 py-2",
                    isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                    <p className="text-sm">{message.text}</p>
                    <p className={cn(
                        "text-xs mt-1 text-right",
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {message.timestamp}
                    </p>
                </div>
            </div>
             {isCurrentUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                        {message.initials}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
};

const ContactContextMenu = ({ contact }: { contact: ChatContact }) => (
  <>
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      <span>View Profile</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Phone className="mr-2 h-4 w-4" />
      <span>Call</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <MessageSquare className="mr-2 h-4 w-4" />
      <span>Send Direct SMS</span>
    </DropdownMenuItem>
  </>
);


const ContactList = ({ contacts, onSelectContact, selectedContactId, isLoading }: {
    contacts: ChatContact[];
    onSelectContact: (contact: ChatContact) => void;
    selectedContactId: string | null;
    isLoading?: boolean;
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
                {contacts.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-4">No contacts in this category.</div>
                )}
                {contacts.map((contact) => {
                    const hasUnread = (contact.unreadCount || 0) > 0;
                    return (
                      <ContextMenu key={contact.id} menuItems={<ContactContextMenu contact={contact} />}>
                        <button
                            className={cn(
                                "w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3",
                                selectedContactId === contact.id ? "bg-primary/10" : "hover:bg-muted"
                            )}
                            onClick={() => onSelectContact(contact)}
                        >
                            <Avatar className="h-10 w-10 border-2" style={{ borderColor: contact.status === 'online' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}>
                                <AvatarImage src={contact.avatar} alt={contact.name} />
                                <AvatarFallback>{getInitials({ name: contact.name })}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className={cn("font-semibold truncate", hasUnread && "text-primary")}>{contact.name}</p>
                                <p className={cn("text-xs truncate", hasUnread ? "text-foreground font-medium" : "text-muted-foreground")}>{contact.lastMessage}</p>
                            </div>
                            <div className="flex flex-col items-end self-start">
                                <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                                {hasUnread && (
                                    <Badge className="mt-1 h-5 w-5 flex items-center justify-center p-0">{contact.unreadCount}</Badge>
                                )}
                            </div>
                        </button>
                      </ContextMenu>
                    )
                })}
            </div>
        </ScrollArea>
    );
}

const RecentActivityFeed = () => {
    const dummyFeed = [
        { id: 'act1', from: 'Ali Ahmed (Driver)', fromType: 'Driver', message: 'Reached the destination. Waiting for unloading instructions.', handledBy: 'Rayyaan Taariq', time: '2m ago' },
        { id: 'act2', from: 'Global Petro Services', fromType: 'Customer', message: 'We have another shipment ready. Can we book a truck?', handledBy: 'Mohamed Buhari', time: '5m ago' },
        { id: 'act3', from: 'Hassan Ibrahim (Driver)', fromType: 'Driver', message: 'Stuck in heavy traffic on King Fahd Road, ETA will be delayed by 15 mins.', handledBy: 'Rayyaan Taariq', time: '8m ago' },
        { id: 'act4', from: 'Innovate LLC', fromType: 'Customer', message: 'Where is my ride? The app shows the driver is nearby but not moving.', handledBy: 'Admin User', time: '12m ago' }
    ];

    const getIcon = (type: string) => {
        if (type === 'Driver') return <Truck className="h-6 w-6 text-primary" />;
        if (type === 'Customer') return <Building className="h-6 w-6 text-primary" />;
        return <User className="h-6 w-6 text-primary" />;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 p-6">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-headline">Communications Hub</h2>
                <p className="text-muted-foreground">Select a contact to begin a conversation or monitor live activity.</p>
            </div>
            <div className="w-full max-w-2xl space-y-4">
                {dummyFeed.map(item => (
                    <Card key={item.id} className="shadow-sm p-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full mt-1">
                                {getIcon(item.fromType)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{item.from}</p>
                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                                <p className="text-sm mt-1">"{item.message}"</p>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                                    <ArrowRight className="h-3 w-3 mr-1"/>
                                    Handled by <span className="font-semibold text-foreground ml-1">{item.handledBy}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};


export default function SmsPage() {
    const { messages, sendMessage } = useChatStore();
    const { users, isLoading: isLoadingUsers } = useUserStore();
    const { driverGridData } = useDriverStore();
    const { customers } = useCustomerStore();

    const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('drivers');
    
    const allUsers = useMemo(() => {
        return users.map((user, index) => ({
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed User',
                avatar: user.avatar,
                status: user.status || 'offline',
                lastMessage: `Role: ${user.role || 'user'}`,
                lastMessageTime: 'Yesterday',
                type: 'User',
                unreadCount: 0,
            }));
    }, [users]);
    
    const drivers = useMemo(() => {
        return driverGridData.map((driver, index) => ({
            id: driver.dlNo,
            name: driver.name,
            avatar: undefined,
            status: driver.dutyStartTime ? 'online' : 'offline',
            lastMessage: index === 0 ? 'I\'m running about 10 mins late.' : `Vehicle: ${driver.vehicleRegNum}`,
            lastMessageTime: index === 0 ? '2m' : '1h',
            type: 'Driver',
            unreadCount: index === 0 ? 2 : 0,
        }));
    }, [driverGridData]);
    
    const customerContacts = useMemo(() => {
         return customers.map((customer, index) => ({
            id: customer.id,
            name: customer.name,
            avatar: undefined,
            status: customer.status === 'Active' ? 'online' : 'offline',
            lastMessage: index === 1 ? 'Thanks for the update!' : `Rating: ${customer.rating}`,
            lastMessageTime: index === 1 ? '5m' : '3h',
            type: 'Customer',
            unreadCount: index === 1 ? 1 : 0,
        }));
    }, [customers]);

    useEffect(() => {
        if (!selectedContact && drivers.length > 0) {
            setSelectedContact(drivers[0]);
        }
    }, [drivers, selectedContact]);

    const filteredDrivers = useMemo(() => drivers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [drivers, searchQuery]);
    const filteredCustomers = useMemo(() => customerContacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [customerContacts, searchQuery]);
    const filteredUsers = useMemo(() => allUsers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [allUsers, searchQuery]);

    const currentMessages = selectedContact ? messages[selectedContact.id] || [] : [];
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;
        sendMessage(selectedContact.id, newMessage, getInitials({ name: 'Me' }));
        setNewMessage('');
    }

    const handleSelectContact = (contact: ChatContact) => {
        const targetTab = 
            drivers.some(c => c.id === contact.id) ? 'drivers' :
            customerContacts.some(c => c.id === contact.id) ? 'customers' :
            'users';

        setActiveTab(targetTab);
        setSelectedContact(contact);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-8rem)] gap-4">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline">Communications</CardTitle>
                     <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search contacts..." 
                            className="pl-10" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3 mx-auto px-2">
                        <TabsTrigger value="drivers"><Truck className="h-4 w-4 mr-1.5"/>Drivers</TabsTrigger>
                        <TabsTrigger value="customers"><Building className="h-4 w-4 mr-1.5"/>Customers</TabsTrigger>
                        <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5"/>Users</TabsTrigger>
                    </TabsList>
                    <TabsContent value="drivers" className="flex-1 mt-0">
                       <ContactList contacts={filteredDrivers} onSelectContact={handleSelectContact} selectedContactId={selectedContact?.id || null} />
                    </TabsContent>
                    <TabsContent value="customers" className="flex-1 mt-0">
                       <ContactList contacts={filteredCustomers} onSelectContact={handleSelectContact} selectedContactId={selectedContact?.id || null} />
                    </TabsContent>
                    <TabsContent value="users" className="flex-1 mt-0">
                       <ContactList contacts={filteredUsers} onSelectContact={handleSelectContact} selectedContactId={selectedContact?.id || null} isLoading={isLoadingUsers} />
                    </TabsContent>
                </Tabs>
            </Card>

            <Card className="flex flex-col h-full">
                {selectedContact ? (
                    <>
                        <CardHeader className="flex flex-row items-center justify-between border-b">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                                    <AvatarFallback>{getInitials({name: selectedContact.name})}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{selectedContact.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center">
                                        <span className={cn("h-2 w-2 rounded-full mr-1.5", selectedContact.status === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
                                        {selectedContact.status}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon"><Phone /></Button>
                                <Button variant="ghost" size="icon"><Video /></Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-4 overflow-hidden">
                             <ScrollArea className="h-full">
                                <div className="space-y-6 p-4">
                                    {currentMessages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} contactType={selectedContact.type} />)}
                                </div>
                             </ScrollArea>
                        </CardContent>

                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Type a message..." 
                                    className="h-11"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!newMessage.trim()}>
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                   <RecentActivityFeed />
                )}
            </Card>
        </div>
    );
}
