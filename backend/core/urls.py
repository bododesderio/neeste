from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/token/', TokenObtainPairView.as_view()),           # Changed to /auth/token/
    path('auth/token/refresh/', TokenRefreshView.as_view()),      # Consistent

    # Public - ADD /public/ prefix
    path('public/bootstrap/', views.public_bootstrap),
    path('public/products/', views.public_products),
    path('public/products/<int:pk>/', views.public_product_detail),
    path('public/blog/', views.public_blog_list),
    path('public/blog/<slug:slug>/', views.public_blog_detail),
    path('public/newsletter/subscribe/', views.subscribe_newsletter),
    path('public/contact/', views.contact_submit),
    path('public/orders/', views.create_order),

    # Admin
    path('admin/dashboard/', views.admin_dashboard),
    path('admin/profile/me/', views.admin_profile_me),
    path('admin/profile/update/', views.admin_profile_update),
    path('admin/profile/change-password/', views.admin_change_password),
    path('admin/settings/', views.admin_settings),
    path('admin/settings/reset-visits/', views.admin_reset_visits),
    path('admin/notifications/', views.admin_notifications),
    path('admin/notifications/<int:pk>/', views.notification_detail.as_view()),
    path('admin/notifications/<int:pk>/mark-read/', views.admin_notification_mark_read),
    path('admin/notifications/mark-all-read/', views.admin_notifications_mark_all_read),
    path('admin/products/', views.admin_products),
    path('admin/products/create/', views.admin_product_create),
    path('admin/products/<int:pk>/', views.admin_product_detail),
    path('admin/blog/', views.admin_blog_list),
    path('admin/blog/create/', views.admin_blog_create),
    path('admin/blog/<int:pk>/', views.admin_blog_detail),
    path('admin/orders/', views.admin_orders),
    path('admin/orders/<int:pk>/mark-paid/', views.admin_mark_paid),
    path('admin/newsletter/', views.admin_newsletter),
    path('admin/newsletter/send-test/', views.admin_send_test_email),
    path('admin/newsletter/send/', views.admin_send_newsletter),
    path('admin/newsletter/campaigns/', views.admin_email_campaigns),
    path('admin/contacts/', views.admin_contacts),
    path('admin/contacts/<int:pk>/mark-read/', views.admin_contact_mark_read),
    path('admin/reports/sales/', views.sales_report),
    path('admin/reports/products/', views.products_report),

    # Digital Download
    path('download/<str:token>/', views.download_digital),

    # MoMo
    path('momo/initiate/', views.momo_initiate),
    path('momo/status/<str:reference_id>/', views.momo_status),
    path('momo/callback/', views.momo_callback),
]
