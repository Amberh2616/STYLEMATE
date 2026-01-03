"""
使用 rembg 批量去背商品圖片
"""
import time
from pathlib import Path
from io import BytesIO
from PIL import Image
from django.core.management.base import BaseCommand
from django.conf import settings
from rembg import remove
from products.models import Product


class Command(BaseCommand):
    help = '使用 rembg 批量去背商品圖片'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='限制處理數量（0=全部）',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='強制重新處理已有去背圖的商品',
        )
        parser.add_argument(
            '--product-id',
            type=int,
            help='只處理指定 ID 的商品',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        force = options['force']
        product_id = options['product_id']

        # 建立輸出目錄
        nobg_dir = settings.MEDIA_ROOT / 'products' / 'nobg'
        nobg_dir.mkdir(parents=True, exist_ok=True)

        # 取得待處理商品
        if product_id:
            products = Product.objects.filter(id=product_id)
        elif force:
            products = Product.objects.exclude(image='')
        else:
            products = Product.objects.filter(image_nobg='').exclude(image='')

        if limit > 0:
            products = products[:limit]

        total = products.count()
        if total == 0:
            self.stdout.write(self.style.WARNING('沒有需要處理的商品'))
            return

        self.stdout.write(f'準備處理 {total} 張圖片...')
        self.stdout.write(f'預估時間: {total * 4} - {total * 6} 秒')
        self.stdout.write('')

        success = 0
        failed = 0
        start_time = time.time()

        for i, product in enumerate(products, 1):
            try:
                self._process_product(product, nobg_dir, i, total)
                success += 1
            except Exception as e:
                self.stderr.write(f'  [{i}/{total}] 錯誤 {product.name}: {e}')
                failed += 1

        elapsed = time.time() - start_time
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'完成! 成功: {success}, 失敗: {failed}, 耗時: {elapsed:.1f} 秒'
        ))

    def _process_product(self, product, nobg_dir, index, total):
        """處理單個商品圖片"""
        src_path = settings.MEDIA_ROOT / product.image.name

        if not src_path.exists():
            raise FileNotFoundError(f'原圖不存在: {src_path}')

        # 輸出檔名（改為 PNG）
        output_name = src_path.stem + '.png'
        output_path = nobg_dir / output_name

        start = time.time()

        # 讀取並去背
        with Image.open(src_path) as img:
            # 確保是 RGB 模式
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # 使用 rembg 去背
            output = remove(img)

            # 儲存為 PNG（保留透明度）
            output.save(output_path, 'PNG')

        elapsed = time.time() - start

        # 更新資料庫
        product.image_nobg = f'products/nobg/{output_name}'
        product.save(update_fields=['image_nobg'])

        self.stdout.write(
            f'  [{index}/{total}] {product.name[:30]:30} - {elapsed:.1f}s'
        )
