from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Order, DigitalAccessToken, OrderItem
from .utils import make_token

def ensure_digital_tokens_for_paid_order(order: Order):
    if order.status != Order.PAID:
        return

    items = OrderItem.objects.filter(order=order).select_related("product")
    for it in items:
        p = it.product
        if p.type == "DIGITAL":
            DigitalAccessToken.objects.get_or_create(
                order=order,
                product=p,
                defaults={"token": make_token(48)}
            )

@receiver(post_save, sender=Order)
def create_digital_tokens_on_paid(sender, instance: Order, created, **kwargs):
    # whenever order is saved as PAID, ensure tokens exist
    ensure_digital_tokens_for_paid_order(instance)
