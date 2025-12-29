from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    
    # Public
    path('bootstrap/', views.public_bootstrap),
    path('products/', views.public_products),
    path('products/<int:pk>/', views.public_product_detail),
    path('blog/', views.public_blog_list),
    path('blog/<slug:slug>/', views.public_blog_detail),
    path('newsletter/subscribe/', views.subscribe_newsletter),
    path('contact/', views.contact_submit),
    path('orders/', views.create_order),
    
    # Admin - Dashboard
    path('admin/dashboard/', views.admin_dashboard),
    
    # Admin - Profile
    path('admin/profile/me/', views.admin_profile_me),
    path('admin/profile/update/', views.admin_profile_update),
    path('admin/profile/change-password/', views.admin_change_password),
    
    # Admin - Settings
    path('admin/settings/', views.admin_settings),
    path('admin/settings/reset-visits/', views.admin_reset_visits),
    
    # Admin - Notifications
    path('admin/notifications/', views.admin_notifications),
    path('admin/notifications/<int:pk>/', views.notification_detail),
    path('admin/notifications/<int:pk>/mark-read/', views.admin_notification_mark_read),
    path('admin/notifications/mark-all-read/', views.admin_notifications_mark_all_read),
    
    # Admin - Products
    path('admin/products/', views.admin_products),
    path('admin/products/create/', views.admin_product_create),
    path('admin/products/<int:pk>/', views.admin_product_detail),
    
    # Admin - Blog
    path('admin/blog/', views.admin_blog_list),
    path('admin/blog/create/', views.admin_blog_create),
    path('admin/blog/<int:pk>/', views.admin_blog_detail),
    
    # Admin - Orders
    path('admin/orders/', views.admin_orders),
    path('admin/orders/<int:pk>/mark-paid/', views.admin_mark_paid),
    
    # Admin - Newsletter
    path('admin/newsletter/', views.admin_newsletter),
    path('admin/newsletter/send-test/', views.admin_send_test_email),
    path('admin/newsletter/send/', views.admin_send_newsletter),
    path('admin/newsletter/campaigns/', views.admin_email_campaigns),
    
    # Admin - Contacts
    path('admin/contacts/', views.admin_contacts),
    path('admin/contacts/<int:pk>/mark-read/', views.admin_contact_mark_read),
    
    # Admin - Reports
    path('admin/reports/sales/', views.sales_report),
    path('admin/reports/products/', views.products_report),
    
    # Digital Download
    path('download/<str:token>/', views.download_digital),
    
    # MoMo
    path('momo/initiate/', views.momo_initiate),
    path('momo/status/<str:reference_id>/', views.momo_status),
    path('momo/callback/', views.momo_callback),
]
