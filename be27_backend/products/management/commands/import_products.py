"""
從 frontend/lib/products.ts 匯入商品到 Django
"""
import json
import re
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from products.models import Product


class Command(BaseCommand):
    help = '從 products.ts 匯入 79 個商品'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='只顯示會匯入什麼，不實際執行',
        )
        parser.add_argument(
            '--copy-images',
            action='store_true',
            help='複製圖片到 media 目錄',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        copy_images = options['copy_images']

        # 找到 products.ts 檔案
        base_dir = Path(settings.BASE_DIR).parent
        products_file = base_dir / 'frontend' / 'lib' / 'products.ts'

        if not products_file.exists():
            self.stderr.write(f'找不到檔案: {products_file}')
            return

        self.stdout.write(f'讀取 {products_file}')

        # 解析 TypeScript 檔案
        content = products_file.read_text(encoding='utf-8')

        # 提取 JSON 陣列部分
        match = re.search(r'export const products: Product\[\] = (\[[\s\S]*\]);', content)
        if not match:
            self.stderr.write('無法解析 products.ts')
            return

        json_str = match.group(1)

        # 處理 TypeScript 語法轉換為 JSON
        # 移除尾隨逗號
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)

        try:
            products_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            self.stderr.write(f'JSON 解析錯誤: {e}')
            return

        self.stdout.write(f'找到 {len(products_data)} 個商品')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN 模式 - 不實際匯入'))

        # 匯入商品
        created = 0
        updated = 0

        for item in products_data:
            product_data = {
                'name': item.get('name', ''),
                'price': item.get('price', 0),
                'category': item.get('category', 'dress'),
                'style': item.get('style', ''),
                'tags': item.get('tags', []),
                'colors': item.get('colors', []),
                'occasion': item.get('occasion', []),
                'season': item.get('season', []),
                'material': item.get('material', ''),
                'sleeve': item.get('sleeve', ''),
                'length': item.get('length', ''),
                'neckline': item.get('neckline', ''),
                'fit': item.get('fit', ''),
                'color_temperature': item.get('color_temperature', ''),
            }

            if dry_run:
                self.stdout.write(f"  [{item['id']}] {item['name']} - NT${item['price']}")
                continue

            # 使用 id 作為主鍵
            product, is_created = Product.objects.update_or_create(
                id=item['id'],
                defaults=product_data
            )

            if is_created:
                created += 1
            else:
                updated += 1

            # 複製圖片
            if copy_images and item.get('image'):
                self._copy_image(base_dir, item['image'], product)

        if not dry_run:
            self.stdout.write(self.style.SUCCESS(
                f'匯入完成: {created} 新增, {updated} 更新'
            ))

    def _copy_image(self, base_dir, image_path, product):
        """複製圖片到 media 目錄"""
        # 原始圖片路徑: /images/products/dress/xxx.jpg
        src_path = base_dir / 'frontend' / 'public' / image_path.lstrip('/')

        if not src_path.exists():
            self.stderr.write(f'  圖片不存在: {src_path}')
            return

        # 目標路徑
        dest_dir = settings.MEDIA_ROOT / 'products' / 'original'
        dest_dir.mkdir(parents=True, exist_ok=True)

        dest_path = dest_dir / src_path.name

        if not dest_path.exists():
            shutil.copy2(src_path, dest_path)
            self.stdout.write(f'  複製圖片: {src_path.name}')

        # 更新資料庫
        product.image = f'products/original/{src_path.name}'
        product.save(update_fields=['image'])
