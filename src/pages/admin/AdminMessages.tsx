import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Mail, Archive, Trash2, Check, RefreshCcw, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

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
  const toggleMessageView = (message: Message) => {
    setExpandedMessageId(expandedMessageId === message.id ? null : message.id);
    if (message.status === 'unread') {
      handleStatusChange(message.id, 'read');
    }
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(paginatedMessages.map(msg => msg.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      return newSelected;
    });
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'archived' | 'delete') => {
    if (selectedMessages.size === 0) return;

    if (action === 'delete' && !window.confirm(t('admin.messages.confirm_bulk_delete'))) {
      return;
    }

    const toastId = toast.loading(t('admin.messages.updating'));
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('messages')
          .delete()
          .in('id', Array.from(selectedMessages));
        if (error) throw error;
        setAllMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      } else {
        const { error } = await supabase
          .from('messages')
          .update({ status: action })
          .in('id', Array.from(selectedMessages));
        if (error) throw error;
        setAllMessages(prev => prev.map(msg => 
          selectedMessages.has(msg.id) ? { ...msg, status: action } : msg
        ));
      }
      setSelectedMessages(new Set());
      setSelectAll(false);
      toast.success(t('admin.messages.notifications.bulk_updated'), { id: toastId });
    } catch (err) {
      console.error("Error performing bulk action:", err);
      toast.error(t('admin.messages.errors.bulk_action'), { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
          />
        </div>
        
        <div className="flex items-center space-x-2 border-l pl-4">
          <button
            onClick={() => handleBulkAction('read')}
            disabled={selectedMessages.size === 0}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title={t('admin.messages.actions.mark_read')}
          >
            <Mail className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleBulkAction('unread')}
            disabled={selectedMessages.size === 0}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title={t('admin.messages.actions.mark_unread')}
          >
            <Mail className="w-5 h-5 text-gray-600 fill-current" />
          </button>
          <button
            onClick={() => handleBulkAction('archived')}
            disabled={selectedMessages.size === 0}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title={t('admin.messages.actions.archive')}
          >
            <Archive className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            disabled={selectedMessages.size === 0}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title={t('common.delete')}
          >
            <Trash2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center ml-auto space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('admin.messages.filter_options.all')}</option>
            <option value="unread">{t('admin.messages.status.unread')}</option>
            <option value="read">{t('admin.messages.status.read')}</option>
            <option value="archived">{t('admin.messages.status.archive')}</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-full"
            title={t('common.refresh')}
          >
            <RefreshCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-auto">
        {loading && <p className="p-4">{t('common.loading')}</p>}
        {error && <p className="text-red-600 bg-red-100 p-3 rounded m-4">{error}</p>}
        
        {!loading && !error && (
          <div className="divide-y divide-gray-200">
            {paginatedMessages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {filterStatus === 'all' ? t('admin.messages.no_messages') : t('admin.messages.no_filtered_messages')}
              </div>
            ) : (
              paginatedMessages.map((message) => (
                <div key={message.id}>
                  {/* Message Header */}
                  <div 
                    className={`group flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer
                      ${message.status === 'unread' ? 'font-semibold bg-white' : 'bg-gray-50'}
                      ${selectedMessages.has(message.id) ? 'bg-blue-50 hover:bg-blue-50' : ''}
                      ${expandedMessageId === message.id ? 'bg-white shadow-sm' : ''}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.checkbox-area, .action-buttons')) return;
                      toggleMessageView(message);
                    }}
                  >
                    <div className="checkbox-area flex items-center w-8">
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(message.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectMessage(message.id);
                        }}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{message.name}</span>
                          {expandedMessageId === message.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                      </div>
                      {!expandedMessageId && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="truncate">{message.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="action-buttons ml-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.status === 'unread' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(message.id, 'read');
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Check className="w-4 h-4 text-gray-600" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(message.id, 'unread');
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                          title={t('admin.messages.actions.mark_unread')}
                        >
                          <Mail className="w-4 h-4 text-gray-600 fill-current" />
                        </button>
                      )}
                      {message.status !== 'archived' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(message.id, 'archived');
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Archive className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full ml-1"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Message View */}
                  {expandedMessageId === message.id && (
                    <div className="px-12 py-6 bg-white border-b">
                      <div className="space-y-6 max-w-full">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-medium text-gray-900 truncate">{message.name}</h2>
                            <div className="mt-1 text-sm text-gray-500">
                              {message.email && (
                                <div className="flex items-center space-x-1">
                                  <span>Email:</span>
                                  <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline break-all">
                                    {message.email}
                                  </a>
                                </div>
                              )}
                              {message.phone && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <span>Phone:</span>
                                  <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                                    {message.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 flex-shrink-0 ml-4">
                            {formatDate(message.created_at)}
                          </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-700 break-words whitespace-pre-wrap overflow-x-hidden">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t bg-white px-4 py-2 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
            <ChevronRight className="inline w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
