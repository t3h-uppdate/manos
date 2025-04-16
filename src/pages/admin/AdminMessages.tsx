import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons

// Define the Message type based on your Supabase schema
interface Message {
  id: string;
  name: string;
  email: string | null;
  phone: string | null; // Add phone number
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
  const [allMessages, setAllMessages] = useState<Message[]>([]); // Store all fetched messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'unread', 'read', 'archived'
  const [sortColumn, setSortColumn] = useState<keyof Message | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Or make this configurable later
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set()); // State for expanded messages

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

        setAllMessages(data || []); // Store fetched data in allMessages
      } catch (err: unknown) {
        console.error("Error fetching messages:", err);
        // Type guard for error message
        let errorMessage = t('admin.messages.errors.fetch');
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only once on mount

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    console.log(`Changing status of ${messageId} to ${newStatus}`);
     try {
        const { error } = await supabase
            .from('messages')
            .update({ status: newStatus })
            .eq('id', messageId);
        if (error) throw error;
        // Refresh messages list in allMessages state
        setAllMessages(prevMessages => 
          prevMessages.map(msg => msg.id === messageId ? { ...msg, status: newStatus } : msg)
        );
        toast.success(t('admin.messages.notifications.status_updated', { status: newStatus }));
    } catch (err: unknown) {
        console.error("Error updating message status:", err);
        let errorDetails = '';
        if (err instanceof Error) {
          errorDetails = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
          errorDetails = err.message;
        }
        console.error("Update error details:", errorDetails); // Log details
        toast.error(t('admin.messages.errors.update_status'));
    }
  };

  // Function to toggle message expansion
  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(messageId)) {
        newExpanded.delete(messageId);
      } else {
        newExpanded.add(messageId);
      }
      return newExpanded;
    });
  };

  // Memoized filtered and sorted messages
  const filteredMessages = useMemo(() => {
    let filtered = [...allMessages];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
          return sortDirection === 'asc' ? comparison : -comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
           const comparison = String(aValue).localeCompare(String(bValue));
           return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [allMessages, filterStatus, sortColumn, sortDirection]);

  // Memoized paginated messages
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMessages.slice(startIndex, endIndex);
  }, [filteredMessages, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredMessages.length / itemsPerPage);
  }, [filteredMessages.length, itemsPerPage]);

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  // Function to handle sorting
  const handleSort = (column: keyof Message) => {
    if (sortColumn === column) {
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Function to handle viewing a message
  const handleView = (message: Message) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);
  };

  // Function to handle deleting a message
  const handleDelete = async (messageId: string) => {
    if (!window.confirm(t('admin.messages.confirm_delete'))) {
      return;
    }

    const toastId = toast.loading(t('admin.messages.deleting'));
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) throw deleteError;

      setAllMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      toast.success(t('admin.messages.notifications.deleted'), { id: toastId });

    } catch (err: unknown) {
      console.error("Error deleting message:", err);
      let errorDetails = '';
      if (err instanceof Error) {
        errorDetails = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        errorDetails = err.message;
      }
      console.error("Delete error details:", errorDetails); // Log details
      toast.error(t('admin.messages.errors.delete'), { id: toastId });
    }
  };

  // Helper to render sort icons
  const renderSortIcon = (column: keyof Message) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('admin.messages.title')}</h1>

      {/* Filtering Controls */}
      <div className="mb-4 flex justify-end">
         <div className="flex items-center space-x-2">
           <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
             {t('admin.messages.filter_by_status')}:
           </label>
           <select
             id="status-filter"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
           >
             <option value="all">{t('admin.messages.filter_options.all')}</option>
             <option value="unread">{t('admin.messages.status.unread')}</option>
             <option value="read">{t('admin.messages.status.read')}</option>
             <option value="archived">{t('admin.messages.status.archived')}</option>
           </select>
         </div>
      </div>


      {loading && <p>{t('common.loading')}</p>}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>}

      {!loading && !error && (
        <>
          {/* Card View (All screens) */}
          <div className="space-y-4">
            {paginatedMessages.length === 0 ? (
               <div className="bg-white shadow-md rounded-lg p-4 text-center text-gray-500">
                 {filterStatus === 'all' ? t('admin.messages.no_messages') : t('admin.messages.no_filtered_messages')}
               </div>
             ) : (
              paginatedMessages.map((message) => (
                <div key={message.id} className={`bg-white shadow-md rounded-lg p-4 ${message.status === 'unread' ? 'border-l-4 border-yellow-400' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-semibold text-gray-900">{message.name}</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full capitalize ${
                      message.status === 'unread' ? 'bg-yellow-100 text-yellow-800' :
                      message.status === 'read' ? 'bg-green-100 text-green-800' :
                      message.status === 'archived' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`admin.messages.status.${message.status}`)}
                    </span>
                  </div>
                  {message.email && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{t('admin.messages.table.email')}:</span> {message.email}
                    </p>
                  )}
                  {message.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{t('admin.messages.table.phone')}:</span> {message.phone}
                    </p>
                  )}
                   <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{t('admin.messages.table.received')}:</span> {formatDate(message.created_at)}
                    </p>
                  {/* Clickable message area with conditional clamping */}
                  <p
                    className={`text-sm text-gray-700 mb-3 cursor-pointer ${expandedMessages.has(message.id) ? 'whitespace-pre-wrap' : 'line-clamp-1'}`}
                    onClick={() => toggleMessageExpansion(message.id)}
                  >
                    {message.message}
                  </p>

                   {/* Actions */}
                   <div className="flex flex-wrap gap-2 justify-end border-t pt-3 mt-3">
                     <button onClick={() => handleView(message)} className="text-sm text-indigo-600 hover:text-indigo-900">{t('common.view')}</button>
                     {message.status === 'unread' ? (
                        <button onClick={() => handleStatusChange(message.id, 'read')} className="text-sm text-green-600 hover:text-green-900">{t('admin.messages.actions.mark_read')}</button>
                     ) : (
                        <button onClick={() => handleStatusChange(message.id, 'unread')} className="text-sm text-yellow-600 hover:text-yellow-900">{t('admin.messages.actions.mark_unread')}</button>
                     )}
                     {message.status !== 'archived' && (
                       <button onClick={() => handleStatusChange(message.id, 'archived')} className="text-sm text-blue-600 hover:text-blue-900">{t('admin.messages.actions.archive')}</button>
                     )}
                     <button onClick={() => handleDelete(message.id)} className="text-sm text-red-600 hover:text-red-900">{t('common.delete')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="inline w-4 h-4 mr-1" />
            {t('common.previous')}
          </button>
          <span className="text-sm text-gray-700">
            {t('common.pagination', { currentPage, totalPages })}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
            <ChevronRight className="inline w-4 h-4 ml-1" />
          </button>
        </div>
      )}


      {/*  ModalView Message */}
      {selectedMessage && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={t('admin.messages.view_modal.title')}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('admin.messages.table.from')}</p>
              <p className="text-lg text-gray-900">{selectedMessage.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('admin.messages.table.email')}</p>
              <p className="text-lg text-gray-900">{selectedMessage.email || t('common.not_available')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('admin.messages.table.phone')}</p>
              <p className="text-lg text-gray-900">{selectedMessage.phone || t('common.not_available')}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">{t('admin.messages.table.received')}</p>
              <p className="text-lg text-gray-900">{formatDate(selectedMessage.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('admin.messages.table.message')}</p>
              {/* Add a scrollable container for the message */}
              <div className="max-h-60 overflow-y-auto border rounded p-2 mt-1 bg-gray-50">
                <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminMessages;
