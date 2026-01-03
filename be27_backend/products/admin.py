from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """商品管理後台"""

    list_display = [
        'id', 'sku', 'name', 'price', 'original_price', 'stock',
        'category', 'is_active', 'image_preview', 'nobg_preview', 'updated_at'
    ]
    list_filter = ['category', 'style', 'is_active', 'season']
    search_fields = ['name', 'sku', 'description', 'tags', 'colors']
    list_editable = ['name', 'price', 'stock', 'is_active']
    list_per_page = 20

    fieldsets = [
        ('基本資訊', {
            'fields': ['name', 'sku', ('price', 'original_price'), 'category', 'style', ('stock', 'is_active')]
        }),
        ('商品描述', {
            'fields': ['description', 'composition', 'care_instructions', 'size_info'],
        }),
        ('圖片', {
            'fields': ['image', 'image_nobg'],
            'description': '原始圖片用於 Chat 推薦，去背圖片用於白板拖拽'
        }),
        ('標籤與屬性', {
            'fields': ['tags', 'colors', 'occasion', 'season'],
            'classes': ['collapse']
        }),
        ('詳細規格', {
            'fields': ['material', 'sleeve', 'length', 'neckline', 'fit', 'color_temperature'],
            'classes': ['collapse']
        }),
    ]

    readonly_fields = ['created_at', 'updated_at']

    def image_preview(self, obj):
        """顯示原圖預覽"""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = '原圖'

    def nobg_preview(self, obj):
        """顯示去背圖預覽"""
        if obj.image_nobg:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px; background: #f0f0f0;" />',
                obj.image_nobg.url
            )
        return mark_safe('<span style="color: orange;">✗</span>')
    nobg_preview.short_description = '去背'

    def nobg_status(self, obj):
        """顯示去背狀態"""
        if obj.has_nobg_image:
            return mark_safe('<span style="color: green;">✓ 已去背</span>')
        return mark_safe('<span style="color: orange;">✗ 待處理</span>')
    nobg_status.short_description = '去背'

    actions = ['generate_nobg_images']

    @admin.action(description='批量生成去背圖片')
    def generate_nobg_images(self, request, queryset):
        """批量去背功能（稍後實作）"""
        count = queryset.filter(image_nobg='').count()
        self.message_user(request, f'已選擇 {count} 個商品待去背處理')
