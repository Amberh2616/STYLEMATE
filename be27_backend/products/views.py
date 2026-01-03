from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """商品 API ViewSet"""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'tags', 'colors']
    ordering_fields = ['price', 'created_at', 'id']
    ordering = ['id']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """按分類獲取商品"""
        category = request.query_params.get('category', None)
        if category:
            products = self.queryset.filter(category=category)
        else:
            products = self.queryset.none()
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def without_nobg(self, request):
        """獲取尚未去背的商品"""
        products = self.queryset.filter(image_nobg='')
        serializer = ProductListSerializer(products, many=True)
        return Response({
            'count': products.count(),
            'products': serializer.data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """獲取商品統計"""
        total = self.queryset.count()
        with_nobg = self.queryset.exclude(image_nobg='').count()
        return Response({
            'total': total,
            'with_nobg': with_nobg,
            'without_nobg': total - with_nobg,
            'categories': {
                cat[0]: self.queryset.filter(category=cat[0]).count()
                for cat in Product.CATEGORY_CHOICES
            }
        })

    @action(detail=False, methods=['get'])
    def ai_search(self, request):
        """AI 推薦搜尋 - 支援多關鍵字搜尋 tags, colors, style, occasion"""
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 10))

        if not query:
            return Response({'error': '請提供搜尋關鍵字 ?q=xxx'}, status=400)

        # 分割關鍵字
        keywords = [k.strip() for k in query.replace(',', ' ').split() if k.strip()]

        products = self.queryset.filter(is_active=True)
        matched = []

        for product in products:
            score = 0
            # 搜尋 tags
            for tag in product.tags:
                for kw in keywords:
                    if kw in tag:
                        score += 2
            # 搜尋 colors
            for color in product.colors:
                for kw in keywords:
                    if kw in color:
                        score += 1
            # 搜尋 style
            if product.style:
                for kw in keywords:
                    if kw in product.style:
                        score += 1
            # 搜尋 occasion
            for occ in product.occasion:
                for kw in keywords:
                    if kw in occ:
                        score += 1
            # 搜尋 name
            for kw in keywords:
                if kw.lower() in product.name.lower():
                    score += 1

            if score > 0:
                matched.append((score, product))

        # 按分數排序
        matched.sort(key=lambda x: x[0], reverse=True)
        top_products = [p for _, p in matched[:limit]]

        serializer = ProductListSerializer(top_products, many=True, context={'request': request})
        return Response({
            'count': len(top_products),
            'query': query,
            'keywords': keywords,
            'results': serializer.data
        })
