import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient'; // Adjust path as needed
import { toast } from 'react-hot-toast'; // Import toast for potential error messages

// Define the Message type based on your Supabase schema
interface Message {
  id: string;
  name: string;
  email: string | null;
  message: string;
  status: string; // e.g., 'unread', 'read', 'archived'
  created_at: string;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString([], { dateStyle: 'medium' }); // Adjust format as needed
};

const AdminMessages: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false }); // Show newest messages first

        if (error) throw error;

        setMessages(data || []);
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError(err.message || t('admin.messages.errors.fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [t]); // Add t to dependency array

  // TODO: Implement function to mark message as read/unread/archive
  const handleStatusChange = async (messageId: string, newStatus: string) => {
    console.log(`Changing status of ${messageId} to ${newStatus}`);
    // Implementation needed: Update Supabase and refresh state
     try {
        const { error } = await supabase
            .from('messages')
            .update({ status: newStatus })
            .eq('id', messageId);
        if (error) throw error;
        // Refresh messages list
        setMessages(messages.map(msg => msg.id === messageId ? { ...msg, status: newStatus } : msg));
        toast.success(t('admin.messages.notifications.status_updated', { status: newStatus }));
    } catch (err: any) {
        console.error("Error updating message status:", err);
        toast.error(t('admin.messages.errors.update_status'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('admin.messages.title')}</h1>

      {/* Add filtering/sorting options here later */}

      {loading && <p>{t('common.loading')}</p>} {/* Use common loading key */}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.messages.table.from')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.messages.table.email')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.messages.table.snippet')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.messages.table.received')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.messages.table.status')}</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span> {/* Use common actions key */}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {t('admin.messages.no_messages')}
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className={message.status === 'unread' ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{message.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.email || t('common.not_applicable')}</td> {/* Use common N/A key */}
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate">{message.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(message.created_at)}</td> {/* Date formatting is locale-aware */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{t(`admin.messages.status.${message.status}`)}</td> {/* Translate status */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Action buttons (View, Mark Read/Unread, Delete) */}
                      {/* TODO: Implement View and Delete functionality with translation */}
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.view')}</button>
                      {message.status === 'unread' ? (
                         <button onClick={() => handleStatusChange(message.id, 'read')} className="text-green-600 hover:text-green-900 mr-3">{t('admin.messages.actions.mark_read')}</button>
                      ) : (
                         <button onClick={() => handleStatusChange(message.id, 'unread')} className="text-yellow-600 hover:text-yellow-900 mr-3">{t('admin.messages.actions.mark_unread')}</button>
                      )}
                      <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button> {/* Use common delete key */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
       {/* Add pagination controls here later */}
    </div>
  );
};

export default AdminMessages;
