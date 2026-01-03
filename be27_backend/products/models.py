from django.db import models


class Product(models.Model):
    """商品模型 - 支援雙圖片系統"""

    CATEGORY_CHOICES = [
        ('dress', '洋裝'),
        ('top', '上衣'),
        ('pants', '長褲'),
        ('shorts', '短褲'),
        ('skirt', '裙子'),
        ('two-piece', '套裝'),
        ('jacket', '外套'),
    ]

    STYLE_CHOICES = [
        ('elegant', '優雅'),
        ('casual', '休閒'),
        ('sexy', '性感'),
        ('sweet', '甜美'),
        ('cool', '酷帥'),
    ]

    # 基本資訊
    name = models.CharField('商品名稱', max_length=200)
    sku = models.CharField('商品編號', max_length=50, blank=True, unique=True, null=True)
    price = models.DecimalField('售價', max_digits=10, decimal_places=0)
    original_price = models.DecimalField('原價', max_digits=10, decimal_places=0, blank=True, null=True)
    category = models.CharField('分類', max_length=50, choices=CATEGORY_CHOICES)

    # 商品描述
    description = models.TextField('商品描述', blank=True, help_text='商品特色與賣點')
    composition = models.CharField('成分', max_length=200, blank=True, help_text='例如：95%棉 5%氨綸')
    care_instructions = models.TextField('洗滌說明', blank=True, help_text='例如：手洗、不可烘乾')
    size_info = models.TextField('尺寸資訊', blank=True, help_text='尺寸表或尺寸建議')

    # 庫存與狀態
    stock = models.PositiveIntegerField('庫存數量', default=0)
    is_active = models.BooleanField('上架中', default=True)

    # 雙圖片系統
    image = models.ImageField('原始圖片', upload_to='products/original/', blank=True)
    image_nobg = models.ImageField('去背圖片', upload_to='products/nobg/', blank=True)

    # 標籤與屬性（JSON 欄位）
    tags = models.JSONField('標籤', default=list, blank=True)
    colors = models.JSONField('顏色', default=list, blank=True)
    occasion = models.JSONField('場合', default=list, blank=True)
    season = models.JSONField('季節', default=list, blank=True)

    # 文字屬性
    style = models.CharField('風格', max_length=50, choices=STYLE_CHOICES, blank=True)
    material = models.CharField('材質', max_length=100, blank=True)
    sleeve = models.CharField('袖長', max_length=50, blank=True)
    length = models.CharField('長度', max_length=100, blank=True)
    neckline = models.CharField('領型', max_length=50, blank=True)
    fit = models.CharField('版型', max_length=50, blank=True)
    color_temperature = models.CharField('色溫', max_length=50, blank=True)

    # 時間戳記
    created_at = models.DateTimeField('建立時間', auto_now_add=True)
    updated_at = models.DateTimeField('更新時間', auto_now=True)

    class Meta:
        verbose_name = '商品'
        verbose_name_plural = '商品'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} (NT${self.price})"

    @property
    def has_nobg_image(self):
        """檢查是否有去背圖片"""
        return bool(self.image_nobg)
