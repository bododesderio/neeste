from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.db.models import Sum, Count, Q, Avg, F
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

from .momo import request_to_pay, get_request_status
from .models import *
from .serializers import *
from .permissions import IsAdminUserOrSuper
from .utils import compute_order_total, ensure_digital_tokens_for_paid_order

@api_view(["GET"])
@permission_classes([AllowAny])
def public_bootstrap(request):
    settings_obj = SiteSettings.objects.first()
    products = Product.objects.filter(is_active=True).order_by("created_at")
    if settings_obj and hasattr(settings_obj, 'visit_tracking_enabled') and settings_obj.visit_tracking_enabled:
        today = timezone.now().date()
        visit, created = SiteVisit.objects.get_or_create(date=today)
        if not created:
            visit.count += 1
            visit.save()
    return Response({
        "settings": SiteSettingsSerializer(settings_obj, context={"request": request}).data if settings_obj else {},
        "products": ProductSerializer(products, many=True, context={"request": request}).data
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def public_products(request):
    product_type = request.GET.get("type", "").upper()
    qs = Product.objects.filter(is_active=True)
    if product_type in ["PHYSICAL", "DIGITAL"]:
        qs = qs.filter(type=product_type)
    return Response(ProductSerializer(qs.order_by("created_at"), many=True, context={"request": request}).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def public_product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk, is_active=True)
    return Response(ProductSerializer(product, context={"request": request}).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def public_blog_list(request):
    posts = BlogPost.objects.filter(status=BlogPost.PUBLISHED).order_by("-published_at")
    return Response(BlogPostListSerializer(posts, many=True, context={"request": request}).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def public_blog_detail(request, slug):
    post = get_object_or_404(BlogPost, slug=slug, status=BlogPost.PUBLISHED)
    post.views += 1
    post.save(update_fields=["views"])
    return Response(BlogPostDetailSerializer(post, context={"request": request}).data)

@api_view(["POST"])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    email = (request.data.get("email") or "").strip().lower()
    if not email:
        return Response({"detail": "Email is required"}, status=400)
    obj, created = NewsletterSubscriber.objects.get_or_create(email=email)
    if created and hasattr(Notification, 'NEWSLETTER_SUBSCRIPTION'):
        Notification.objects.create(type=Notification.NEWSLETTER_SUBSCRIPTION, title="New Newsletter Subscriber", message=f"{email} subscribed", link="/admin/newsletter")
    return Response({"ok": True, "created": created})

@api_view(["POST"])
@permission_classes([AllowAny])
def contact_submit(request):
    serializer = ContactSubmissionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    contact = serializer.save()
    if hasattr(Notification, 'CONTACT_SUBMISSION'):
        Notification.objects.create(type=Notification.CONTACT_SUBMISSION, title="New Contact", message=f"{contact.name}: {contact.subject or 'No subject'}", link="/admin/contacts")
    return Response({"ok": True, "message": "Message sent!"}, status=201)

@api_view(["POST"])
@permission_classes([AllowAny])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    order = Order.objects.create(full_name=data["full_name"], phone=data["phone"], email=data.get("email", ""), address=data.get("address", ""))
    for item in data["items"]:
        product = get_object_or_404(Product, id=item["product"], is_active=True)
        qty = max(int(item.get("qty", 1)), 1)
        OrderItem.objects.create(order=order, product=product, qty=qty, unit_price=product.price)
    order.total_amount = compute_order_total(order)
    order.save()
    if hasattr(Notification, 'NEW_ORDER'):
        Notification.objects.create(type=Notification.NEW_ORDER, title=f"New Order #{order.reference}", message=f"{order.full_name} - {order.total_amount:,.0f} UGX", link="/admin/orders")
    return Response(OrderSerializer(order).data, status=201)

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_dashboard(request):
    total_revenue = Order.objects.filter(status=Order.PAID).aggregate(total=Sum("total_amount"))["total"] or 0
    total_orders = Order.objects.count()
    paid_orders = Order.objects.filter(status=Order.PAID).count()
    pending_orders = Order.objects.filter(status=Order.CREATED).count()
    product_sales = OrderItem.objects.filter(order__status=Order.PAID).values("product__name").annotate(quantity_sold=Sum("qty"), revenue=Sum("unit_price")).order_by("-revenue")
    recent_orders = Order.objects.order_by("-created_at")[:10]
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    visits = SiteVisit.objects.filter(date__gte=thirty_days_ago).order_by("date")
    visits_data = [{"date": str(v.date), "count": v.count} for v in visits]
    return Response({
        "revenue": {"total": float(total_revenue), "currency": "UGX"},
        "orders": {"total": total_orders, "paid": paid_orders, "pending": pending_orders},
        "product_sales": list(product_sales),
        "recent_orders": OrderSerializer(recent_orders, many=True).data,
        "site_visits": {"total": sum(v["count"] for v in visits_data), "data": visits_data},
        "blog": {"total": BlogPost.objects.count(), "published": BlogPost.objects.filter(status=BlogPost.PUBLISHED).count()},
        "contacts": {"unread": ContactSubmission.objects.filter(read=False).count()}
    })

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_profile_me(request):
    u = request.user
    return Response({"id": u.id, "username": u.username, "email": u.email, "first_name": u.first_name, "last_name": u.last_name, "is_staff": u.is_staff, "is_superuser": u.is_superuser})

@api_view(["PUT"])
@permission_classes([IsAdminUserOrSuper])
def admin_profile_update(request):
    u = request.user
    u.username = request.data.get("username", u.username)
    u.email = request.data.get("email", u.email)
    u.first_name = request.data.get("first_name", u.first_name)
    u.last_name = request.data.get("last_name", u.last_name)
    try:
        u.save()
        return Response({"id": u.id, "username": u.username, "email": u.email, "first_name": u.first_name, "last_name": u.last_name})
    except Exception as e:
        return Response({"detail": str(e)}, status=400)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_change_password(request):
    u = request.user
    current = request.data.get("current_password")
    new = request.data.get("new_password")
    if not current or not new:
        return Response({"detail": "Both passwords required"}, status=400)
    if not u.check_password(current):
        return Response({"detail": "Current password incorrect"}, status=400)
    u.set_password(new)
    u.save()
    return Response({"detail": "Password changed"})

@api_view(["GET", "PUT"])
@permission_classes([IsAdminUserOrSuper])
@parser_classes([MultiPartParser, FormParser])
def admin_settings(request):
    obj = SiteSettings.objects.first() or SiteSettings.objects.create()
    if request.method == "GET":
        return Response(SiteSettingsSerializer(obj, context={"request": request}).data)
    serializer = SiteSettingsSerializer(obj, data=request.data, partial=True, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_reset_visits(request):
    count = SiteVisit.objects.count()
    SiteVisit.objects.all().delete()
    return Response({"ok": True, "message": f"Reset {count} records"})

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_notifications(request):
    qs = Notification.objects.all()[:50]
    unread = Notification.objects.filter(read=False).count()
    return Response({"results": NotificationSerializer(qs, many=True).data, "unread_count": unread})

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdminUserOrSuper])
def notification_detail(request, pk):
    try:
        n = Notification.objects.get(id=pk)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(NotificationSerializer(n).data)
    elif request.method == 'PATCH':
        s = NotificationSerializer(n, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
    elif request.method == 'DELETE':
        n.delete()
        return Response(status=204)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_notification_mark_read(request, pk):
    n = get_object_or_404(Notification, pk=pk)
    n.read = True
    n.save()
    return Response(NotificationSerializer(n).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_notifications_mark_all_read(request):
    Notification.objects.filter(read=False).update(read=True)
    return Response({"detail": "All marked read"})

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_products(request):
    return Response(ProductSerializer(Product.objects.all().order_by("-created_at"), many=True, context={"request": request}).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
@parser_classes([MultiPartParser, FormParser])
def admin_product_create(request):
    s = ProductSerializer(data=request.data, context={"request": request})
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=201)

@api_view(["PUT", "DELETE"])
@permission_classes([IsAdminUserOrSuper])
@parser_classes([MultiPartParser, FormParser])
def admin_product_detail(request, pk):
    p = get_object_or_404(Product, pk=pk)
    if request.method == "DELETE":
        p.delete()
        return Response(status=204)
    s = ProductSerializer(p, data=request.data, partial=True, context={"request": request})
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_blog_list(request):
    return Response(BlogPostListSerializer(BlogPost.objects.all().order_by("-created_at"), many=True, context={"request": request}).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
@parser_classes([MultiPartParser, FormParser])
def admin_blog_create(request):
    s = BlogPostDetailSerializer(data=request.data, context={"request": request})
    s.is_valid(raise_exception=True)
    if s.validated_data.get("status") == BlogPost.PUBLISHED:
        s.save(published_at=timezone.now())
    else:
        s.save()
    return Response(s.data, status=201)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAdminUserOrSuper])
@parser_classes([MultiPartParser, FormParser])
def admin_blog_detail(request, pk):
    post = get_object_or_404(BlogPost, pk=pk)
    if request.method == "GET":
        return Response(BlogPostDetailSerializer(post, context={"request": request}).data)
    elif request.method == "DELETE":
        post.delete()
        return Response(status=204)
    else:
        was_draft = post.status == BlogPost.DRAFT
        s = BlogPostDetailSerializer(post, data=request.data, partial=True, context={"request": request})
        s.is_valid(raise_exception=True)
        if was_draft and s.validated_data.get("status") == BlogPost.PUBLISHED:
            s.save(published_at=timezone.now())
        else:
            s.save()
        return Response(s.data)

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_orders(request):
    return Response(OrderSerializer(Order.objects.prefetch_related("items__product").order_by("-created_at"), many=True).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_mark_paid(request, pk):
    o = get_object_or_404(Order, pk=pk)
    o.status = Order.PAID
    o.save()
    ensure_digital_tokens_for_paid_order(o)
    return Response(OrderSerializer(o).data)

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_newsletter(request):
    return Response(NewsletterSerializer(NewsletterSubscriber.objects.order_by("-created_at"), many=True).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_send_test_email(request):
    subject = request.data.get("subject", "Test")
    content = request.data.get("content", "")
    email = request.user.email
    if not email:
        return Response({"detail": "No email"}, status=400)
    s = SiteSettings.objects.first()
    if not s or not hasattr(s, 'email_host_user') or not s.email_host_user:
        return Response({"detail": "Not configured"}, status=400)
    try:
        msg = EmailMultiAlternatives(subject, strip_tags(content), f"{s.email_from_name} <{s.email_from_email}>", [email])
        msg.attach_alternative(f"<html><body>{content}</body></html>", "text/html")
        msg.send()
        return Response({"detail": f"Sent to {email}"})
    except Exception as e:
        return Response({"detail": str(e)}, status=400)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_send_newsletter(request):
    subject = request.data.get("subject", "")
    content = request.data.get("content", "")
    ids = request.data.get("recipient_ids", [])
    if not subject or not content:
        return Response({"detail": "Missing fields"}, status=400)
    s = SiteSettings.objects.first()
    if not s or not hasattr(s, 'email_host_user') or not s.email_host_user:
        return Response({"detail": "Not configured"}, status=400)
    subs = NewsletterSubscriber.objects.filter(id__in=ids) if ids else NewsletterSubscriber.objects.all()
    if not subs.exists():
        return Response({"detail": "No subscribers"}, status=400)
    sent = 0
    for sub in subs:
        try:
            msg = EmailMultiAlternatives(subject, strip_tags(content), f"{s.email_from_name} <{s.email_from_email}>", [sub.email])
            msg.attach_alternative(f"<html><body>{content}</body></html>", "text/html")
            msg.send()
            sent += 1
        except:
            pass
    EmailCampaign.objects.create(subject=subject, content=content, recipients_count=sent, sent_by=request.user)
    return Response({"detail": f"Sent to {sent}"})

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_email_campaigns(request):
    return Response(EmailCampaignSerializer(EmailCampaign.objects.order_by("-sent_at"), many=True).data)

@api_view(["GET"])
@permission_classes([IsAdminUserOrSuper])
def admin_contacts(request):
    return Response(ContactSubmissionSerializer(ContactSubmission.objects.order_by("-created_at"), many=True).data)

@api_view(["POST"])
@permission_classes([IsAdminUserOrSuper])
def admin_contact_mark_read(request, pk):
    c = get_object_or_404(ContactSubmission, pk=pk)
    c.read = True
    c.save()
    return Response(ContactSubmissionSerializer(c).data)

@api_view(['GET'])
@permission_classes([IsAdminUserOrSuper])
def sales_report(request):
    days = int(request.GET.get('days', '30'))
    start_str = request.GET.get('start_date')
    end_str = request.GET.get('end_date')
    if start_str and end_str:
        start = datetime.strptime(start_str, '%Y-%m-%d')
        end = datetime.strptime(end_str, '%Y-%m-%d')
    else:
        end = timezone.now()
        start = end - timedelta(days=days)
    orders = Order.objects.filter(created_at__gte=start, created_at__lte=end)
    total = orders.count()
    paid = orders.filter(status=Order.PAID).count()
    pending = orders.filter(status=Order.CREATED).count()
    revenue = orders.filter(status=Order.PAID).aggregate(t=Sum('total_amount'))['t'] or 0
    avg = orders.filter(status=Order.PAID).aggregate(a=Avg('total_amount'))['a'] or 0
    daily = []
    d = start.date()
    while d <= end.date():
        day_orders = orders.filter(created_at__date=d, status=Order.PAID)
        dr = day_orders.aggregate(t=Sum('total_amount'))['t'] or 0
        dc = day_orders.count()
        daily.append({'date': d.isoformat(), 'total_revenue': float(dr), 'order_count': dc, 'avg_order_value': float(dr/dc if dc else 0)})
        d += timedelta(days=1)
    return Response({'total_revenue': float(revenue), 'total_orders': total, 'paid_orders': paid, 'pending_orders': pending, 'avg_order_value': float(avg), 'conversion_rate': 0, 'daily_revenue': daily, 'period': {'start': start.date().isoformat(), 'end': end.date().isoformat()}})

@api_view(['GET'])
@permission_classes([IsAdminUserOrSuper])
def products_report(request):
    days = int(request.GET.get('days', '30'))
    start_str = request.GET.get('start_date')
    end_str = request.GET.get('end_date')
    if start_str and end_str:
        start = datetime.strptime(start_str, '%Y-%m-%d')
        end = datetime.strptime(end_str, '%Y-%m-%d')
    else:
        end = timezone.now()
        start = end - timedelta(days=days)
    items = OrderItem.objects.filter(order__created_at__gte=start, order__created_at__lte=end, order__status=Order.PAID)
    stats = items.values('product__id', 'product__name', 'product__product_type').annotate(quantity_sold=Sum('qty'), total_revenue=Sum(F('qty') * F('unit_price'))).order_by('-total_revenue')
    total_qty = items.aggregate(t=Sum('qty'))['t'] or 0
    total_rev = items.aggregate(t=Sum(F('qty') * F('unit_price')))['t'] or 0
    products = [{'product_id': s['product__id'], 'name': s['product__name'], 'product_type': s['product__product_type'], 'quantity_sold': s['quantity_sold'], 'total_revenue': float(s['total_revenue'])} for s in stats]
    return Response({'total_quantity_sold': total_qty, 'total_product_revenue': float(total_rev), 'top_products': products, 'period': {'start': start.date().isoformat(), 'end': end.date().isoformat()}})

@api_view(["GET"])
@permission_classes([AllowAny])
def download_digital(request, token):
    tok = get_object_or_404(DigitalAccessToken, token=token)
    if tok.order.status != Order.PAID:
        raise Http404()
    if not tok.product.file:
        raise Http404()
    return FileResponse(tok.product.file.open("rb"), as_attachment=True, filename=tok.product.file.name.split("/")[-1])

@api_view(["POST"])
@permission_classes([AllowAny])
def momo_initiate(request):
    oid = request.data.get("order_id")
    payer = (request.data.get("payer_msisdn") or "").strip()
    if not oid or not payer:
        return Response({"detail": "Missing fields"}, status=400)
    o = get_object_or_404(Order, id=oid)
    ref = request_to_pay(str(o.total_amount), "UGX", payer, o.reference, f"Pay {o.reference}", "Neesté Order")
    o.momo_reference_id = ref
    o.momo_status = "PENDING"
    o.save()
    return Response({"order_id": o.id, "reference_id": ref, "status": "PENDING"})

@api_view(["GET"])
@permission_classes([AllowAny])
def momo_status(request, reference_id):
    o = get_object_or_404(Order, momo_reference_id=reference_id)
    data = get_request_status(reference_id)
    st = (data.get("status") or "").upper()
    o.momo_status = st
    if data.get("financialTransactionId"):
        o.momo_financial_transaction_id = str(data["financialTransactionId"])
    if st == "SUCCESSFUL" and o.status != Order.PAID:
        o.status = Order.PAID
        o.save()
        ensure_digital_tokens_for_paid_order(o)
        if hasattr(Notification, 'PAYMENT_RECEIVED'):
            Notification.objects.create(type=Notification.PAYMENT_RECEIVED, title=f"Payment - Order #{o.reference}", message=f"{o.total_amount:,.0f} UGX from {o.full_name}", link="/admin/orders")
    links = []
    if o.status == Order.PAID:
        for t in DigitalAccessToken.objects.filter(order=o).select_related("product"):
            links.append({"product": t.product.name, "url": request.build_absolute_uri(f"/api/download/{t.token}/")})
    return Response({"order_id": o.id, "order_status": o.status, "momo_status": st, "download_links": links})

@api_view(["POST"])
@permission_classes([AllowAny])
def momo_callback(request):
    # Proper handling
    ref = request.data.get("referenceId") or request.headers.get("X-Reference-Id")
    if ref:
        try:
            order = Order.objects.get(momo_reference_id=ref)
            data = get_request_status(ref)
            st = data.get("status", "").upper()
            order.momo_status = st
            if data.get("financialTransactionId"):
                order.momo_financial_transaction_id = data.get("financialTransactionId", "")
            if st == "SUCCESSFUL" and order.status != Order.PAID:
                order.status = Order.PAID
                order.save()
                ensure_digital_tokens_for_paid_order(order)
                if hasattr(Notification, 'PAYMENT_RECEIVED'):
                    Notification.objects.create(type=Notification.PAYMENT_RECEIVED, title=f"Payment - Order #{order.reference}", message=f"{order.total_amount:,.0f} UGX from {order.full_name}", link="/admin/orders")
        except Order.DoesNotExist:
            pass
    return Response({"status": "OK"}, status=200)