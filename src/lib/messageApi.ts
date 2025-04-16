import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

interface MessageData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export const sendMessage = async (messageData: MessageData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          name: messageData.name, 
          phone: messageData.phone, 
          email: messageData.email, 
          message: messageData.message,
          status: 'unread' // Default status for new messages
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw the error to be caught in the component
    }
    
    return true; // Indicate success
  } catch (err) {
    console.error("Failed to send message:", err);
    // Let the calling component handle UI feedback like toasts
    return false; // Indicate failure
  }
};
