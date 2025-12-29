from django.db import models
from django.utils.crypto import get_random_string
from django.utils.text import slugify


class SiteSettings(models.Model):
    site_title = models.CharField(max_length=120, default="Neesté")
    tagline = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to="logo/", blank=True, null=True)
    favicon = models.ImageField(upload_to="favicon/", blank=True, null=True, help_text="Website favicon (32x32 or 64x64 pixels)")
    
    hero_title = models.CharField(max_length=255, blank=True)
    hero_subtitle = models.CharField(max_length=255, blank=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    
    # Contact page content
    contact_description = models.TextField(blank=True, help_text="Description for contact page")
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    
    # Enhanced Theme Colors
    primary_color = models.CharField(max_length=7, default="#fbbf24", help_text="Primary brand color (hex code)")
    secondary_color = models.CharField(max_length=7, default="#0b1220", help_text="Background color (hex code)")
    text_color = models.CharField(max_length=7, default="#ffffff", help_text="Main text color (hex code)")
    text_secondary_color = models.CharField(max_length=7, default="#94a3b8", help_text="Secondary/muted text color (hex code)")
    button_bg_color = models.CharField(max_length=7, default="#fbbf24", help_text="Button background color (hex code)")
    button_text_color = models.CharField(max_length=7, default="#000000", help_text="Button text color (hex code)")
    link_color = models.CharField(max_length=7, default="#fbbf24", help_text="Link color (hex code)")
    link_hover_color = models.CharField(max_length=7, default="#f59e0b", help_text="Link hover color (hex code)")
    success_color = models.CharField(max_length=7, default="#10b981", help_text="Success/positive color (hex code)")
    error_color = models.CharField(max_length=7, default="#ef4444", help_text="Error/danger color (hex code)")
    warning_color = models.CharField(max_length=7, default="#f59e0b", help_text="Warning/alert color (hex code)")
    border_color = models.CharField(max_length=7, default="#334155", help_text="Border/divider color (hex code)")
    
    # Site Analytics
    visit_tracking_enabled = models.BooleanField(default=False, help_text="Enable visit tracking (turn on when site goes live)")
    
    # Email Configuration
    email_host = models.CharField(max_length=100, default="smtp.gmail.com", blank=True)
    email_port = models.IntegerField(default=587)
    email_use_tls = models.BooleanField(default=True)
    email_host_user = models.EmailField(blank=True)
    email_host_password = models.CharField(max_length=200, blank=True)
    email_from_email = models.EmailField(blank=True)
    email_from_name = models.CharField(max_length=100, default="Neesté", blank=True)
    
    theme = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.site_title


class Product(models.Model):
    PHYSICAL = "PHYSICAL"
    DIGITAL = "DIGITAL"

    PRODUCT_TYPES = (
        (PHYSICAL, "Physical"),
        (DIGITAL, "Digital"),
    )

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    currency = models.CharField(max_length=10, default="UGX")
    type = models.CharField(max_length=20, choices=PRODUCT_TYPES)
    file = models.FileField(upload_to="digital/", blank=True, null=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    
    STATUS_CHOICES = (
        (DRAFT, "Draft"),
        (PUBLISHED, "Published"),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    featured_image = models.ImageField(upload_to="blog/", blank=True, null=True)
    excerpt = models.TextField(max_length=300, blank=True, help_text="Short description for listings")
    content = models.TextField(help_text="Rich text content")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Tracking
    views = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Order(models.Model):
    CREATED = "CREATED"
    PAID = "PAID"

    STATUS_CHOICES = (
        (CREATED, "Created"),
        (PAID, "Paid"),
    )

    reference = models.CharField(max_length=20, unique=True, editable=False)
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=CREATED)

    momo_reference_id = models.CharField(max_length=64, blank=True)
    momo_status = models.CharField(max_length=32, blank=True)
    momo_financial_transaction_id = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = get_random_string(10).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.reference


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=0)

    def __str__(self):
        return f"{self.product.name} x{self.qty}"


class DigitalAccessToken(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} ({self.token})"


class SiteVisit(models.Model):
    """Track unique site visits per day"""
    date = models.DateField(auto_now_add=True)
    count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ["-date"]
        unique_together = ["date"]
    
    def __str__(self):
        return f"{self.date}: {self.count} visits"


class ContactSubmission(models.Model):
    """Store contact form submissions"""
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.name} - {self.subject or 'No subject'}"


class Notification(models.Model):
    """Admin notifications for important events"""
    
    # Notification types
    NEW_ORDER = "NEW_ORDER"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    CONTACT_SUBMISSION = "CONTACT_SUBMISSION"
    NEWSLETTER_SUBSCRIPTION = "NEWSLETTER_SUBSCRIPTION"
    
    TYPE_CHOICES = (
        (NEW_ORDER, "New Order"),
        (PAYMENT_RECEIVED, "Payment Received"),
        (CONTACT_SUBMISSION, "Contact Submission"),
        (NEWSLETTER_SUBSCRIPTION, "Newsletter Subscription"),
    )
    
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=200, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.title}"


class EmailCampaign(models.Model):
    """Track sent email campaigns"""
    subject = models.CharField(max_length=200)
    content = models.TextField()
    recipients_count = models.IntegerField(default=0)
    sent_at = models.DateTimeField(auto_now_add=True)
    sent_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, related_name='email_campaigns')
    
    class Meta:
        ordering = ["-sent_at"]
    
    def __str__(self):
        return f"{self.subject} - {self.sent_at.strftime('%Y-%m-%d')}"
