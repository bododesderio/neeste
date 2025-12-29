from rest_framework import serializers
from .models import (
    SiteSettings,
    Product,
    BlogPost,
    NewsletterSubscriber,
    Order,
    OrderItem,
    ContactSubmission,
    Notification,
    EmailCampaign,
)


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "site_title",
            "tagline",
            "logo",
            "logo_url",
            "favicon",
            "favicon_url",
            "hero_title",
            "hero_subtitle",
            "address",
            "phone",
            "email",
            "contact_description",
            "facebook_url",
            "twitter_url",
            "instagram_url",
            "primary_color",
            "secondary_color",
            "text_color",
            "text_secondary_color",
            "button_bg_color",
            "button_text_color",
            "link_color",
            "link_hover_color",
            "success_color",
            "error_color",
            "warning_color",
            "border_color",
            "visit_tracking_enabled",
            "email_host",
            "email_port",
            "email_use_tls",
            "email_host_user",
            "email_host_password",
            "email_from_email",
            "email_from_name",
            "theme",
            "updated_at",
        ]
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.logo.url)
        return None
    
    def get_favicon_url(self, obj):
        if obj.favicon:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.favicon.url)
        return None


class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "currency",
            "type",
            "file",
            "image",
            "image_url",
            "is_active",
            "created_at",
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog list view"""
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "featured_image",
            "featured_image_url",
            "excerpt",
            "status",
            "views",
            "created_at",
            "published_at",
        ]
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
        return None


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog detail view with full content"""
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "featured_image",
            "featured_image_url",
            "excerpt",
            "content",
            "status",
            "meta_description",
            "views",
            "created_at",
            "updated_at",
            "published_at",
        ]
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
        return None


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_type = serializers.CharField(source="product.type", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_type", "qty", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "reference",
            "full_name",
            "phone",
            "email",
            "address",
            "total_amount",
            "status",
            "items",
            "created_at",
        ]


class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=30)
    email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField())
    )


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["id", "name", "email", "subject", "message", "created_at", "read"]
        read_only_fields = ["id", "created_at", "read"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class EmailCampaignSerializer(serializers.ModelSerializer):
    sent_by_username = serializers.CharField(source='sent_by.username', read_only=True)
    
    class Meta:
        model = EmailCampaign
        fields = ['id', 'subject', 'content', 'recipients_count', 'sent_at', 'sent_by', 'sent_by_username']
        read_only_fields = ['id', 'sent_at', 'sent_by']

