from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """商品序列化器"""

    has_nobg_image = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'style',
            'image', 'image_nobg', 'has_nobg_image',
            'tags', 'colors', 'occasion', 'season',
            'material', 'sleeve', 'length', 'neckline', 'fit', 'color_temperature',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """商品列表序列化器（簡化版）"""

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'style',
            'image', 'image_nobg', 'tags', 'colors'
        ]
