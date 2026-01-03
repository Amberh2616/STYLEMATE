"""
為商品填充電商資料（描述、成分、洗滌說明等）
"""
import random
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = '為商品填充示例電商資料'

    # 商品描述模板
    DESCRIPTIONS = {
        'dress': [
            '優雅的設計展現女性魅力，適合各種場合穿著。精緻的剪裁修飾身形，讓你成為焦點。',
            '浪漫的款式設計，展現甜美氣質。舒適的面料讓你整天都能優雅自在。',
            '經典設計與時尚元素完美結合，打造都會女性的知性魅力。',
            '飄逸的裙擺設計，營造優雅浪漫的氛圍。無論約會或上班都是絕佳選擇。',
        ],
        'top': [
            '百搭款式，輕鬆打造多種風格。舒適親膚的面料，讓你整天都感到舒適。',
            '精緻的細節設計，展現品味與質感。適合各種場合搭配。',
            '簡約而不簡單的設計，是衣櫃必備的基本款。',
            '時尚的剪裁展現俐落風格，讓你輕鬆展現自信魅力。',
        ],
        'pants': [
            '修身剪裁完美修飾腿型，打造纖細的視覺效果。舒適有彈性，久坐也不會有壓迫感。',
            '高腰設計拉長腿部線條，讓比例更加完美。百搭的款式適合各種上衣搭配。',
            '經典直筒版型，展現俐落專業形象。優質面料不易皺摺。',
        ],
        'shorts': [
            '夏日必備的清爽款式，舒適透氣。搭配簡單的上衣就能輕鬆出門。',
            '時尚的版型設計，讓你的雙腿看起來更修長。適合休閒或運動場合。',
        ],
        'skirt': [
            '飄逸的裙擺展現女性柔美，優雅的設計適合各種場合。',
            '經典的款式設計，是衣櫃中不可或缺的單品。搭配性極高。',
            '甜美的設計風格，展現青春活力。舒適的面料讓你整天都能輕鬆自在。',
        ],
        'two-piece': [
            '精心搭配的套裝組合，省去搭配的煩惱。整體造型更加協調有型。',
            '上下身完美搭配，展現專業又不失時尚的形象。也可分開穿搭創造不同風格。',
        ],
        'jacket': [
            '時尚與實用兼具的外套，為你的穿搭增添層次感。適合微涼天氣穿著。',
            '經典的外套款式，百搭各種內搭。優質面料保暖又有型。',
            '俐落的剪裁展現專業形象，是上班族的最佳選擇。',
        ],
    }

    # 成分模板
    COMPOSITIONS = {
        'dress': ['95%聚酯纖維 5%氨綸', '100%棉', '80%棉 20%聚酯纖維', '92%聚酯纖維 8%氨綸'],
        'top': ['100%棉', '95%棉 5%氨綸', '80%聚酯纖維 20%棉', '70%棉 30%聚酯纖維'],
        'pants': ['98%棉 2%氨綸', '95%聚酯纖維 5%氨綸', '100%亞麻', '70%棉 28%聚酯纖維 2%氨綸'],
        'shorts': ['100%棉', '98%棉 2%氨綸', '95%聚酯纖維 5%氨綸'],
        'skirt': ['100%聚酯纖維', '95%聚酯纖維 5%氨綸', '80%棉 20%聚酯纖維'],
        'two-piece': ['95%聚酯纖維 5%氨綸', '80%棉 20%聚酯纖維'],
        'jacket': ['100%聚酯纖維', '80%棉 20%聚酯纖維', '100%丹寧棉'],
    }

    # 洗滌說明
    CARE_INSTRUCTIONS = [
        '• 建議手洗或使用洗衣袋機洗\n• 水溫不超過30°C\n• 不可漂白\n• 低溫烘乾或自然晾乾\n• 中低溫熨燙',
        '• 可機洗，請使用冷水\n• 深淺色分開洗滌\n• 不可使用漂白劑\n• 建議自然風乾\n• 如需熨燙請使用中低溫',
        '• 手洗為佳\n• 請勿浸泡過久\n• 陰涼處晾乾\n• 避免陽光直射\n• 收納時請摺疊整齊',
    ]

    # 尺寸資訊
    SIZE_INFO = '''尺寸表（單位：公分）
S：胸圍 84-88，腰圍 64-68，臀圍 90-94
M：胸圍 88-92，腰圍 68-72，臀圍 94-98
L：胸圍 92-96，腰圍 72-76，臀圍 98-102
XL：胸圍 96-100，腰圍 76-80，臀圍 102-106

💡 建議參考平時穿著尺寸選購
💡 因測量方式不同，誤差1-3公分屬正常範圍'''

    def handle(self, *args, **options):
        products = Product.objects.all()
        total = products.count()

        self.stdout.write(f'準備為 {total} 個商品填充資料...')

        updated = 0
        for product in products:
            category = product.category or 'dress'

            # 隨機選擇描述
            descriptions = self.DESCRIPTIONS.get(category, self.DESCRIPTIONS['dress'])
            product.description = random.choice(descriptions)

            # 隨機選擇成分
            compositions = self.COMPOSITIONS.get(category, self.COMPOSITIONS['dress'])
            product.composition = random.choice(compositions)

            # 隨機選擇洗滌說明
            product.care_instructions = random.choice(self.CARE_INSTRUCTIONS)

            # 尺寸資訊
            product.size_info = self.SIZE_INFO

            # 生成 SKU
            if not product.sku:
                product.sku = f'{category.upper()[:3]}-{product.id:04d}'

            # 設定庫存（隨機 5-50）
            if product.stock == 0:
                product.stock = random.randint(5, 50)

            # 設定原價（比售價高 10-30%）
            if not product.original_price:
                markup = random.choice([110, 115, 120, 125, 130])
                product.original_price = int(float(product.price) * markup / 100 / 10) * 10  # 整十

            product.save()
            updated += 1

            if updated % 10 == 0:
                self.stdout.write(f'  已處理 {updated}/{total}')

        self.stdout.write(self.style.SUCCESS(f'完成！已更新 {updated} 個商品'))
