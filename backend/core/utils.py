from django.utils.crypto import get_random_string
from decimal import Decimal


def make_token(length: int = 48) -> str:
    """Generate a random token string."""
    return get_random_string(length)


def compute_order_total(order):
    """
    Calculate the total amount for an order based on its items.
    
    Args:
        order: Order instance
        
    Returns:
        Decimal: Total amount
    """
    from .models import OrderItem
    
    total = Decimal('0')
    items = OrderItem.objects.filter(order=order)
    
    for item in items:
        total += item.unit_price * item.qty
    
    return total


def ensure_digital_tokens_for_paid_order(order):
    """
    Create digital access tokens for all digital products in a paid order.
    
    Args:
        order: Order instance that has been paid
    """
    from .models import DigitalAccessToken, Product, OrderItem
    
    # Get all items in this order
    items = OrderItem.objects.filter(order=order).select_related('product')
    
    for item in items:
        # Only create tokens for digital products
        if item.product.type == Product.DIGITAL:
            # Check if token already exists
            existing = DigitalAccessToken.objects.filter(
                order=order,
                product=item.product
            ).first()
            
            if not existing:
                # Create new token
                DigitalAccessToken.objects.create(
                    order=order,
                    product=item.product,
                    token=make_token(48)
                )