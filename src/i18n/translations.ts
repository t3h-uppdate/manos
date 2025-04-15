export const translations = {
  en: {
    navigation: {
      home: 'Home',
      about: 'About Us',
      contact: 'Contact Us',
      findUs: 'Find Us'
    },
    home: {
      welcome: 'Welcome to Manos Barber Shop',
      subtitle: 'Where Style Meets Tradition'
    },
    contact: {
      title: 'Contact Us',
      hours: 'Salon Hours',
      phone: 'Phone',
      email: 'Email',
      form: {
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        message: 'Message',
        submit: 'Send Message'
      }
    },
    footer: {
      followUs: 'Follow Us'
    },
    common: { // Added common keys
      loading: 'Loading...',
      actions: 'Actions',
      not_applicable: 'N/A',
      edit: 'Edit',
      delete: 'Delete',
      loading_indicator: '...', // Added for dashboard counts
      error_indicator: 'Error',   // Added for dashboard counts
      previous: 'Previous', // Added for pagination
      next: 'Next',         // Added for pagination
      pagination: 'Page {{currentPage}} of {{totalPages}}', // Added for pagination
      cancel: 'Cancel',      // Added for modals
      view: 'View',          // Added for messages
      saving: 'Saving...',   // Added for settings save button
      save_settings: 'Save Settings', // Added for settings save button
      days: { // Added for settings operating hours
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      }
    },
    admin: { // Added admin section
      bookings: {
        title: 'Manage Bookings',
        add_button: 'Add New Booking',
        no_bookings: 'No bookings found.',
        confirm_delete: 'Are you sure you want to delete this booking?',
        edit_modal_title: 'Edit Booking',
        add_modal_title: 'Add New Booking',
        table: {
          customer: 'Customer',
          message_needs: 'Message / Needs',
          start_time: 'Start Time',
          end_time: 'End Time',
          status: 'Status'
        },
        notifications: {
          add_success: 'Booking added successfully!',
          update_success: 'Booking updated successfully!',
          delete_success: 'Booking deleted successfully!'
        },
        errors: {
          fetch: 'Failed to fetch booking data.',
          delete: 'Failed to delete booking.'
        }
      },
      calendar: { // Added calendar section
        title: 'Booking Calendar',
        event: {
          default_service: 'Service',
          default_customer: 'Customer',
          default_staff: 'Staff'
        },
        errors: {
          fetch: 'Failed to fetch data for calendar.',
          parse_hours: 'Error parsing operating hours.', // Optional, but good to have
        },
        warnings: {
          settings_missing: 'Operating hours setting not found.' // Optional, but good to have
        }
      },
      customers: { // Added customers section
        title: 'Manage Customers',
        add_button: 'Add New Customer',
        no_customers: 'No customers found.',
        confirm_delete: 'Are you sure you want to delete this customer? This may also delete related bookings.',
        edit_modal_title: 'Edit Customer',
        add_modal_title: 'Add New Customer',
        table: {
          name: 'Name',
          email: 'Email',
          phone: 'Phone',
          joined: 'Joined'
        },
        notifications: {
          add_success: 'Customer added successfully!',
          update_success: 'Customer updated successfully!',
          delete_success: 'Customer deleted successfully!'
        },
        errors: {
          fetch: 'Failed to fetch customer data.',
          delete: 'Failed to delete customer.'
        }
      },
      dashboard: { // Added dashboard section
        title: 'Dashboard',
        card: {
          bookings_today: "Today's Bookings",
          total_customers: 'Total Customers',
          new_messages: 'New Messages'
        },
        errors: {
          fetch: 'Failed to fetch summary data.'
        }
      },
      inventory: { // Added inventory section
        title: 'Inventory Management',
        add_button: 'Add New Product',
        search_placeholder: 'Search by name, brand, category...',
        no_products: 'No products found.',
        no_search_results: 'No products match your search.',
        edit_modal_title: 'Edit Product',
        add_modal_title: 'Add New Product',
        delete_modal_title: 'Confirm Deletion',
        confirm_delete: 'Are you sure you want to delete the product "{{name}}"? This action cannot be undone.',
        table: {
          name: 'Name',
          brand: 'Brand',
          category: 'Category',
          sale_price: 'Sale Price',
          quantity: 'Quantity',
          reorder_level: 'Reorder Level'
        },
        notifications: {
          // Add/Update success handled in form component? If not, add here.
          // add_success: 'Product added successfully!',
          // update_success: 'Product updated successfully!',
          delete_success: 'Product "{{name}}" deleted successfully!'
        },
        errors: {
          load: 'Failed to load products.',
          delete: 'Failed to delete product "{{name}}".',
          invalid_id: 'Cannot delete product: Invalid ID.'
        }
      },
      messages: { // Added messages section
        title: 'Messages',
        no_messages: 'No messages found.',
        table: {
          from: 'From',
          email: 'Email',
          snippet: 'Message Snippet',
          received: 'Received',
          status: 'Status'
        },
        status: { // Message statuses
          unread: 'Unread',
          read: 'Read',
          archived: 'Archived'
        },
        actions: {
          mark_read: 'Mark Read',
          mark_unread: 'Mark Unread'
          // Add delete confirmation later if needed
        },
        notifications: {
          status_updated: 'Message status updated to {{status}}.'
        },
        errors: {
          fetch: 'Failed to fetch messages.',
          update_status: 'Failed to update message status.'
          // Add delete error later if needed
        }
      },
      settings: { // Added settings section
        title: 'Salon Settings',
        labels: {
          salon_name: 'Salon Name',
          phone: 'Phone Number',
          address: 'Address'
        },
        operating_hours: {
          title: 'Operating Hours',
          start_time: 'Start Time',
          end_time: 'End Time'
        },
        notifications: {
          update_success: 'Settings updated successfully!'
        },
        errors: {
          load: 'Failed to load settings.',
          parse_hours: 'Failed to parse operating hours setting. Using defaults.',
          stringify_hours: 'Failed to prepare operating hours for saving.',
          save: 'Failed to save settings.'
        }
      },
      forms: { // Added forms section
        booking: {
          labels: {
            customer: 'Customer',
            start_time: 'Start Time',
            end_time: 'End Time',
            status: 'Status',
            notes: 'Notes',
            message_needs: 'Message / Needs'
          },
          placeholders: {
            notes: 'Optional notes about the booking...',
            message_needs: 'Optional message from customer or admin notes...'
          },
          select_customer: 'Select Customer',
          status_options: {
            scheduled: 'Scheduled',
            completed: 'Completed',
            cancelled: 'Cancelled',
            no_show: 'No Show'
          },
          buttons: {
            add: 'Add Booking',
            update: 'Update Booking'
          },
          errors: {
            load_customers: 'Failed to load customer data for the form.',
            load_failed: 'Failed to load form data.', // Generic message for component display
            required_fields: 'Please fill in all required fields (Customer, Start Time, End Time).',
            invalid_datetime: 'Invalid start or end time format.',
            add: 'Failed to add booking.',
            update: 'Failed to update booking.'
          }
        },
        customer: { // Added customer form section
          labels: {
            name: 'Customer Name',
            email: 'Email Address',
            phone: 'Phone Number'
          },
          placeholders: {
            email: 'you@example.com',
            phone: 'e.g., 555-123-4567'
          },
          buttons: {
            add: 'Add Customer',
            update: 'Update Customer'
          },
          errors: {
            name_required: 'Customer name is required.',
            email_exists: 'A customer with this email already exists.',
            add: 'Failed to add customer.',
            update: 'Failed to update customer.'
          }
        },
        product: { // Added product form section
          labels: {
            name: 'Name',
            description: 'Description',
            brand: 'Brand',
            category: 'Category',
            purchase_price: 'Purchase Price ($)',
            sale_price: 'Sale Price ($)',
            quantity: 'Quantity on Hand',
            reorder_level: 'Reorder Level'
          },
          buttons: {
            add: 'Add Product',
            update: 'Update Product'
          },
          notifications: {
            add_success: 'Product "{{name}}" added successfully!',
            update_success: 'Product "{{name}}" updated successfully!'
          },
          errors: {
            required_fields: 'Please fill in required fields (Name, Sale Price >= 0, Quantity >= 0).',
            add: 'Failed to add product.',
            update: 'Failed to update product.'
          }
        }
      },
      sidebar: { // Added sidebar section
        title: 'Salon Admin',
        dashboard: 'Dashboard',
        calendar: 'Calendar',
        bookings: 'Bookings',
        customers: 'Customers',
        inventory: 'Inventory',
        messages: 'Messages',
        settings: 'Settings'
      }
      // Add other admin sections here later
    }
  },
  ar: {
    navigation: {
      home: 'الرئيسية',
      about: 'من نحن',
      contact: 'اتصل بنا',
      findUs: 'موقعنا'
    },
    home: {
      welcome: 'مرحباً بكم في صالون مانوس',
      subtitle: 'حيث يلتقي الأسلوب بالتقاليد'
    },
    contact: {
      title: 'اتصل بنا',
      hours: 'ساعات العمل',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      form: {
        name: 'الاسم',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        submit: 'إرسال الرسالة'
      }
    },
    footer: {
      followUs: 'تابعنا'
    },
    common: { // Added common keys
      loading: 'جار التحميل...',
      actions: 'الإجراءات',
      not_applicable: 'غير متاح',
      edit: 'تعديل',
      delete: 'حذف',
      loading_indicator: '...', // Added for dashboard counts
      error_indicator: 'خطأ',   // Added for dashboard counts
      previous: 'السابق', // Added for pagination
      next: 'التالي',         // Added for pagination
      pagination: 'صفحة {{currentPage}} من {{totalPages}}', // Added for pagination
      cancel: 'إلغاء',      // Added for modals
      view: 'عرض',          // Added for messages
      saving: 'جار الحفظ...',   // Added for settings save button
      save_settings: 'حفظ الإعدادات', // Added for settings save button
      days: { // Added for settings operating hours
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد'
      }
    },
    admin: { // Added admin section
      bookings: {
        title: 'إدارة الحجوزات',
        add_button: 'إضافة حجز جديد',
        no_bookings: 'لم يتم العثور على حجوزات.',
        confirm_delete: 'هل أنت متأكد أنك تريد حذف هذا الحجز؟',
        edit_modal_title: 'تعديل الحجز',
        add_modal_title: 'إضافة حجز جديد',
        table: {
          customer: 'العميل',
          message_needs: 'الرسالة / الاحتياجات',
          start_time: 'وقت البدء',
          end_time: 'وقت الانتهاء',
          status: 'الحالة'
        },
        notifications: {
          add_success: 'تمت إضافة الحجز بنجاح!',
          update_success: 'تم تحديث الحجز بنجاح!',
          delete_success: 'تم حذف الحجز بنجاح!'
        },
        errors: {
          fetch: 'فشل في جلب بيانات الحجز.',
          delete: 'فشل في حذف الحجز.'
        }
      },
      calendar: { // Added calendar section
        title: 'تقويم الحجوزات',
        event: {
          default_service: 'الخدمة',
          default_customer: 'العميل',
          default_staff: 'الموظف'
        },
        errors: {
          fetch: 'فشل في جلب بيانات التقويم.',
          parse_hours: 'خطأ في تحليل ساعات العمل.', // Optional, but good to have
        },
        warnings: {
          settings_missing: 'لم يتم العثور على إعداد ساعات العمل.' // Optional, but good to have
        }
      },
      customers: { // Added customers section
        title: 'إدارة العملاء',
        add_button: 'إضافة عميل جديد',
        no_customers: 'لم يتم العثور على عملاء.',
        confirm_delete: 'هل أنت متأكد أنك تريد حذف هذا العميل؟ قد يؤدي هذا أيضًا إلى حذف الحجوزات ذات الصلة.',
        edit_modal_title: 'تعديل العميل',
        add_modal_title: 'إضافة عميل جديد',
        table: {
          name: 'الاسم',
          email: 'البريد الإلكتروني',
          phone: 'الهاتف',
          joined: 'تاريخ الانضمام'
        },
        notifications: {
          add_success: 'تمت إضافة العميل بنجاح!',
          update_success: 'تم تحديث العميل بنجاح!',
          delete_success: 'تم حذف العميل بنجاح!'
        },
        errors: {
          fetch: 'فشل في جلب بيانات العملاء.',
          delete: 'فشل في حذف العميل.'
        }
      },
      dashboard: { // Added dashboard section
        title: 'لوحة التحكم',
        card: {
          bookings_today: "حجوزات اليوم",
          total_customers: 'إجمالي العملاء',
          new_messages: 'رسائل جديدة'
        },
        errors: {
          fetch: 'فشل في جلب بيانات الملخص.'
        }
      },
      inventory: { // Added inventory section
        title: 'إدارة المخزون',
        add_button: 'إضافة منتج جديد',
        search_placeholder: 'البحث بالاسم، العلامة التجارية، الفئة...',
        no_products: 'لم يتم العثور على منتجات.',
        no_search_results: 'لا توجد منتجات تطابق بحثك.',
        edit_modal_title: 'تعديل المنتج',
        add_modal_title: 'إضافة منتج جديد',
        delete_modal_title: 'تأكيد الحذف',
        confirm_delete: 'هل أنت متأكد أنك تريد حذف المنتج "{{name}}؟ لا يمكن التراجع عن هذا الإجراء.',
        table: {
          name: 'الاسم',
          brand: 'العلامة التجارية',
          category: 'الفئة',
          sale_price: 'سعر البيع',
          quantity: 'الكمية',
          reorder_level: 'مستوى إعادة الطلب'
        },
        notifications: {
          // Add/Update success handled in form component? If not, add here.
          // add_success: 'تمت إضافة المنتج بنجاح!',
          // update_success: 'تم تحديث المنتج بنجاح!',
          delete_success: 'تم حذف المنتج "{{name}}" بنجاح!'
        },
        errors: {
          load: 'فشل في تحميل المنتجات.',
          delete: 'فشل في حذف المنتج "{{name}}".',
          invalid_id: 'لا يمكن حذف المنتج: معرف غير صالح.'
        }
      },
      messages: { // Added messages section
        title: 'الرسائل',
        no_messages: 'لم يتم العثور على رسائل.',
        table: {
          from: 'من',
          email: 'البريد الإلكتروني',
          snippet: 'مقتطف الرسالة',
          received: 'تاريخ الاستلام',
          status: 'الحالة'
        },
        status: { // Message statuses
          unread: 'غير مقروءة',
          read: 'مقروءة',
          archived: 'مؤرشفة'
        },
        actions: {
          mark_read: 'وضع علامة كمقروءة',
          mark_unread: 'وضع علامة كغير مقروءة'
          // Add delete confirmation later if needed
        },
        notifications: {
          status_updated: 'تم تحديث حالة الرسالة إلى {{status}}.'
        },
        errors: {
          fetch: 'فشل في جلب الرسائل.',
          update_status: 'فشل في تحديث حالة الرسالة.'
          // Add delete error later if needed
        }
      },
      settings: { // Added settings section
        title: 'إعدادات الصالون',
        labels: {
          salon_name: 'اسم الصالون',
          phone: 'رقم الهاتف',
          address: 'العنوان'
        },
        operating_hours: {
          title: 'ساعات العمل',
          start_time: 'وقت البدء',
          end_time: 'وقت الانتهاء'
        },
        notifications: {
          update_success: 'تم تحديث الإعدادات بنجاح!'
        },
        errors: {
          load: 'فشل في تحميل الإعدادات.',
          parse_hours: 'فشل في تحليل إعداد ساعات العمل. يتم استخدام الإعدادات الافتراضية.',
          stringify_hours: 'فشل في تحضير ساعات العمل للحفظ.',
          save: 'فشل في حفظ الإعدادات.'
        }
      },
      forms: { // Added forms section
        booking: {
          labels: {
            customer: 'العميل',
            start_time: 'وقت البدء',
            end_time: 'وقت الانتهاء',
            status: 'الحالة',
            notes: 'ملاحظات',
            message_needs: 'الرسالة / الاحتياجات'
          },
          placeholders: {
            notes: 'ملاحظات اختيارية حول الحجز...',
            message_needs: 'رسالة اختيارية من العميل أو ملاحظات إدارية...'
          },
          select_customer: 'اختر العميل',
          status_options: {
            scheduled: 'مجدول',
            completed: 'مكتمل',
            cancelled: 'ملغى',
            no_show: 'لم يحضر'
          },
          buttons: {
            add: 'إضافة حجز',
            update: 'تحديث الحجز'
          },
          errors: {
            load_customers: 'فشل في تحميل بيانات العملاء للنموذج.',
            load_failed: 'فشل في تحميل بيانات النموذج.', // Generic message for component display
            required_fields: 'يرجى ملء جميع الحقول المطلوبة (العميل، وقت البدء، وقت الانتهاء).',
            invalid_datetime: 'تنسيق وقت البدء أو الانتهاء غير صالح.',
            add: 'فشل في إضافة الحجز.',
            update: 'فشل في تحديث الحجز.'
          }
        },
        customer: { // Added customer form section
          labels: {
            name: 'اسم العميل',
            email: 'عنوان البريد الإلكتروني',
            phone: 'رقم الهاتف'
          },
          placeholders: {
            email: 'you@example.com',
            phone: 'مثال: 555-123-4567'
          },
          buttons: {
            add: 'إضافة عميل',
            update: 'تحديث العميل'
          },
          errors: {
            name_required: 'اسم العميل مطلوب.',
            email_exists: 'يوجد عميل بهذا البريد الإلكتروني بالفعل.',
            add: 'فشل في إضافة العميل.',
            update: 'فشل في تحديث العميل.'
          }
        },
        product: { // Added product form section
          labels: {
            name: 'الاسم',
            description: 'الوصف',
            brand: 'العلامة التجارية',
            category: 'الفئة',
            purchase_price: 'سعر الشراء ($)',
            sale_price: 'سعر البيع ($)',
            quantity: 'الكمية المتوفرة',
            reorder_level: 'مستوى إعادة الطلب'
          },
          buttons: {
            add: 'إضافة منتج',
            update: 'تحديث المنتج'
          },
          notifications: {
            add_success: 'تمت إضافة المنتج "{{name}}" بنجاح!',
            update_success: 'تم تحديث المنتج "{{name}}" بنجاح!'
          },
          errors: {
            required_fields: 'يرجى ملء الحقول المطلوبة (الاسم، سعر البيع >= 0، الكمية >= 0).',
            add: 'فشل في إضافة المنتج.',
            update: 'فشل في تحديث المنتج.'
          }
        }
      },
      sidebar: { // Added sidebar section
        title: 'إدارة الصالون',
        dashboard: 'لوحة التحكم',
        calendar: 'التقويم',
        bookings: 'الحجوزات',
        customers: 'العملاء',
        inventory: 'المخزون',
        messages: 'الرسائل',
        settings: 'الإعدادات'
      }
      // Add other admin sections here later
    }
  }
};
