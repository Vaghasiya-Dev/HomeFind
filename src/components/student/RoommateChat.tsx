
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { RoommateMessage, StudentDetail, isRelationError } from '@/types/property';

interface ChatProps {
  propertyId: string;
  residents: StudentDetail[];
}

export default function RoommateChat({ propertyId, residents }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RoommateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatTab, setChatTab] = useState<'conversations' | 'residents'>('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter out current user from residents
  const otherResidents = residents.filter(resident => {
    if (!resident) return false;
    
    // Handle potential errors in user object
    const residentUserId = resident.user_id;
    const residentUserObjId = resident.user && !isRelationError(resident.user) ? resident.user.id : undefined;
    
    return residentUserId !== user?.id && residentUserObjId !== user?.id;
  });
  
  // Get all unique conversations
  useEffect(() => {
    if (!user || !propertyId) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Fetch messages where user is either sender or recipient
        const { data: sentMessages, error: sentError } = await supabase
          .from('roommate_messages')
          .select('*, sender_id, recipient_id')
          .eq('sender_id', user.id)
          .eq('property_id', propertyId);
          
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('roommate_messages')
          .select('*, sender_id, recipient_id')
          .eq('recipient_id', user.id)
          .eq('property_id', propertyId);
          
        if (sentError || receivedError) throw sentError || receivedError;
        
        // Combine messages and sort by created_at
        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
        const sortedMessages = allMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setMessages(sortedMessages as RoommateMessage[]);
        
        // If there are messages and no selectedUser, select the first conversation
        if (sortedMessages.length > 0 && !selectedUser) {
          const firstMessageUserId = sortedMessages[0].sender_id === user.id 
            ? sortedMessages[0].recipient_id 
            : sortedMessages[0].sender_id;
          setSelectedUser(firstMessageUserId);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('roommate-messages')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public', 
          table: 'roommate_messages',
          filter: `property_id=eq.${propertyId}`
        }, 
        (payload) => {
          // When a new message arrives, fetch its details and add to state
          if (payload.eventType === 'INSERT') {
            const fetchNewMessage = async () => {
              const { data, error } = await supabase
                .from('roommate_messages')
                .select('*')
                .eq('id', payload.new.id)
                .single();
              
              if (!error && data) {
                // Add the new message to state
                setMessages(prev => [...prev, data as RoommateMessage]);
                
                // If the message is for the current user, set the sender as selected user
                if (data.recipient_id === user.id) {
                  setSelectedUser(data.sender_id);
                  // Mark as read if it's the current conversation
                  if (data.sender_id === selectedUser) {
                    markAsRead(data.id);
                  }
                }
              }
            };
            
            fetchNewMessage();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, user, selectedUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);
  
  // Mark message as read
  const markAsRead = async (messageId: string) => {
    await supabase
      .from('roommate_messages')
      .update({ read: true })
      .eq('id', messageId);
  };
  
  // Get unique conversation partners
  const getConversationPartners = () => {
    if (!user) return [];
    
    const userIds = new Set<string>();
    
    messages.forEach(message => {
      if (message.sender_id === user.id) {
        userIds.add(message.recipient_id);
      } else if (message.recipient_id === user.id) {
        userIds.add(message.sender_id);
      }
    });
    
    return Array.from(userIds);
  };
  
  // Get user details by ID
  const getUserDetails = (userId: string) => {
    const resident = residents.find(r => {
      return r.user_id === userId || 
             (r.user && !isRelationError(r.user) && r.user.id === userId);
    });
    
    if (!resident || !resident.user || isRelationError(resident.user)) {
      return { full_name: 'Unknown User', id: userId };
    }
    
    return resident.user;
  };
  
  // Get conversation messages with a specific user
  const getConversationMessages = () => {
    if (!selectedUser || !user) return [];
    
    return messages.filter(message => 
      (message.sender_id === user.id && message.recipient_id === selectedUser) || 
      (message.recipient_id === user.id && message.sender_id === selectedUser)
    );
  };
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUser || !propertyId) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('roommate_messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUser,
          property_id: propertyId,
          message: newMessage.trim(),
          read: false
        });
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  // Handle selecting a user to chat with
  const selectUserForChat = (userId: string) => {
    setSelectedUser(userId);
    
    // Mark unread messages from this user as read
    if (user) {
      messages
        .filter(msg => msg.sender_id === userId && msg.recipient_id === user.id && !msg.read)
        .forEach(msg => markAsRead(msg.id));
    }
  };
  
  // Get unread message count for a user
  const getUnreadCount = (userId: string) => {
    if (!user) return 0;
    
    return messages.filter(
      msg => msg.sender_id === userId && msg.recipient_id === user.id && !msg.read
    ).length;
  };
  
  // Determine if the message is from the current user
  const isUserMessage = (senderId: string) => {
    return user?.id === senderId;
  };
  
  const conversationPartners = getConversationPartners();
  const conversationMessages = getConversationMessages();

  // Helper function to get initial letter for avatar
  const getInitialLetter = (userObj: any): string => {
    if (!userObj || isRelationError(userObj)) return 'U';
    return userObj.full_name?.[0] || 'U';
  };
  
  // Helper function to get name for display
  const getDisplayName = (userObj: any): string => {
    if (!userObj || isRelationError(userObj)) return 'Unknown User';
    return userObj.full_name || 'Unknown User';
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg font-medium">Roommate Chat</CardTitle>
      </CardHeader>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with conversations */}
        <div className="w-1/3 border-r overflow-hidden flex flex-col">
          <Tabs value={chatTab} onValueChange={(v) => setChatTab(v as any)} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="residents">All Residents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversations" className="m-0 overflow-hidden h-full">
              <ScrollArea className="h-[480px]">
                <div className="p-3 space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversationPartners.length > 0 ? (
                    conversationPartners.map((partnerId) => {
                      const partner = getUserDetails(partnerId);
                      const unreadCount = getUnreadCount(partnerId);
                      
                      return (
                        <div
                          key={partnerId}
                          className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                            selectedUser === partnerId ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => selectUserForChat(partnerId)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitialLetter(partner)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getDisplayName(partner)}</p>
                            </div>
                          </div>
                          
                          {unreadCount > 0 && (
                            <div className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm mt-1">Start a chat with a roommate</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="residents" className="m-0 overflow-hidden h-full">
              <ScrollArea className="h-[480px]">
                <div className="p-3 space-y-2">
                  {otherResidents.length > 0 ? (
                    otherResidents.map((resident) => {
                      const userId = resident.user_id || 
                                    (resident.user && !isRelationError(resident.user) ? resident.user.id : '') || '';
                      
                      return (
                        <div
                          key={resident.id || 'unknown'}
                          className={`flex items-center p-3 rounded-md cursor-pointer ${
                            selectedUser === userId ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => selectUserForChat(userId)}
                        >
                          <Avatar className="mr-3">
                            <AvatarFallback>
                              {resident.user && !isRelationError(resident.user) && resident.user.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {resident.user && !isRelationError(resident.user) ? resident.user.full_name || 'Unknown User' : 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {resident.college_name} 
                              {resident.year_of_study && ` - ${resident.year_of_study} Year`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No other residents found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Chat content */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="p-3 border-b">
                <div className="flex items-center">
                  <Avatar className="mr-2">
                    <AvatarFallback>
                      {getInitialLetter(getUserDetails(selectedUser))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {getDisplayName(getUserDetails(selectedUser))}
                  </span>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.length > 0 ? (
                    conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isUserMessage(msg.sender_id) ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 ${
                            isUserMessage(msg.sender_id)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-70 text-right mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Send a message to start the conversation</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <CardFooter className="p-3 border-t">
                <div className="flex w-full space-x-2">
                  <Textarea
                    placeholder="Type a message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-muted-foreground mt-1">
                  Select a resident from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
