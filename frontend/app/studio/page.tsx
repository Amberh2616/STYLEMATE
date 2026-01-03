'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  SparklesIcon,
  InformationCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  Square2StackIcon,
  PlusIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  DocumentDuplicateIcon,
  CameraIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { DjangoProduct, fetchProducts, getImageUrl } from '@/lib/api/django'
import { useRecommendStore, RecommendedProduct } from '@/store/recommendStore'

// 工具模式
type ToolMode = 'select' | 'marquee'

// 白板上的商品項目
interface CanvasItem {
  id: string
  product: DjangoProduct
  x: number
  y: number
  scale: number
  zIndex: number
  selected: boolean
}

// LOOK 組合
interface Look {
  id: string
  name: string
  items: CanvasItem[]
  createdAt: Date
}

// 框選矩形
interface MarqueeRect {
  startX: number
  startY: number
  endX: number
  endY: number
}

// 商品詳情 Modal
function ProductDetailModal({
  product,
  onClose,
}: {
  product: DjangoProduct
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 價格 */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-pink-600">
              NT${parseInt(product.price).toLocaleString()}
            </span>
            {product.original_price && (
              <span className="text-gray-400 line-through">
                NT${parseInt(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* SKU & 庫存 */}
          <div className="flex gap-4 text-sm text-gray-600">
            {product.sku && <span>商品編號：{product.sku}</span>}
            <span>庫存：{product.stock} 件</span>
          </div>

          {/* 商品描述 */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">商品描述</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* 成分 */}
          {product.composition && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">成分</h3>
              <p className="text-gray-600">{product.composition}</p>
            </div>
          )}

          {/* 洗滌說明 */}
          {product.care_instructions && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">洗滌說明</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.care_instructions}</p>
            </div>
          )}

          {/* 尺寸資訊 */}
          {product.size_info && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">尺寸資訊</h3>
              <p className="text-gray-600 whitespace-pre-line text-sm">{product.size_info}</p>
            </div>
          )}

          {/* 標籤 */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">標籤</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 商品卡片（商品列表用）
function ProductCard({
  product,
  onAddToCanvas,
  onShowDetail,
}: {
  product: DjangoProduct
  onAddToCanvas: (product: DjangoProduct) => void
  onShowDetail: (product: DjangoProduct) => void
}) {
  const imageUrl = getImageUrl(product.image_nobg || product.image)

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      {/* 圖片 */}
      <div
        className="aspect-square bg-gray-50 rounded-t-xl overflow-hidden cursor-pointer"
        onClick={() => onAddToCanvas(product)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
          }}
        />
      </div>

      {/* 資訊 */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-pink-600 font-bold">
              ${parseInt(product.price).toLocaleString()}
            </span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">
                ${parseInt(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShowDetail(product)
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full"
            title="商品內容"
          >
            <InformationCircleIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 白板上可拖拽的商品
function DraggableItem({
  item,
  onMove,
  onSelect,
  onRemove,
  isSelected,
  onDragStart,
  onDragEnd,
}: {
  item: CanvasItem
  onMove: (id: string, x: number, y: number) => void
  onSelect: (id: string, isMultiSelect: boolean) => void
  onRemove: (id: string) => void
  isSelected: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const imageUrl = getImageUrl(item.product.image_nobg)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    // 支援 Ctrl/Cmd 多選
    const isMultiSelect = e.ctrlKey || e.metaKey
    onSelect(item.id, isMultiSelect)
    setIsDragging(true)
    onDragStart?.()

    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById('whiteboard-canvas')
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()
      const newX = e.clientX - canvasRect.left - dragOffset.x
      const newY = e.clientY - canvasRect.top - dragOffset.y

      onMove(item.id, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onDragEnd?.()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, item.id, onMove])

  return (
    <div
      ref={ref}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-pink-500 ring-offset-2' : ''
      } ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: item.x,
        top: item.y,
        zIndex: item.zIndex,
        transform: `scale(${item.scale})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        <img
          src={imageUrl}
          alt={item.product.name}
          className="max-w-[200px] max-h-[250px] object-contain pointer-events-none"
          draggable={false}
        />

        {/* 刪除按鈕 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* 商品名稱標籤 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {item.product.name}
        </div>
      </div>
    </div>
  )
}

export default function StudioPage() {
  // === 從 Chat 頁面帶過來的推薦商品 ===
  const {
    recommendedProducts: storeProducts,
    sourcePrompt,
    clearRecommendedProducts
  } = useRecommendStore()

  // AI 對話狀態
  const [promptInput, setPromptInput] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [recommendedProducts, setRecommendedProducts] = useState<DjangoProduct[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [fromChatPage, setFromChatPage] = useState(false)

  // 商品列表（備用：全部商品）
  const [products, setProducts] = useState<DjangoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showAllProducts, setShowAllProducts] = useState(false)

  // 白板項目
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [nextZIndex, setNextZIndex] = useState(1)

  // 工具模式與框選
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null)
  const [isMarqueeActive, setIsMarqueeActive] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // LOOK 組合
  const [looks, setLooks] = useState<Look[]>([])
  const [dragOverLookId, setDragOverLookId] = useState<string | null>(null)

  // UI 狀態
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [detailProduct, setDetailProduct] = useState<DjangoProduct | null>(null)

  // 試穿彈窗狀態
  const [tryOnModalOpen, setTryOnModalOpen] = useState(false)
  const [tryOnLook, setTryOnLook] = useState<Look | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [tryOnResult, setTryOnResult] = useState<string | null>(null)
  const [isTryOnLoading, setIsTryOnLoading] = useState(false)
  const [tryOnError, setTryOnError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 分類列表
  const categories = [
    { value: '', label: '全部' },
    { value: 'top', label: '上衣' },
    { value: 'bottom', label: '下身' },
    { value: 'dress', label: '洋裝' },
    { value: 'two-piece', label: '套裝' },
    { value: 'jacket', label: '外套' },
  ]

  // === 從 Chat 頁面載入推薦商品 ===
  useEffect(() => {
    if (storeProducts && storeProducts.length > 0) {
      // 將 store 商品轉換為 DjangoProduct 格式
      const convertedProducts: DjangoProduct[] = storeProducts.map((p: RecommendedProduct) => ({
        id: p.id,
        name: p.name,
        sku: null,
        price: p.price,
        original_price: null,
        category: p.category,
        description: '',
        composition: '',
        care_instructions: '',
        size_info: '',
        stock: 1,
        is_active: true,
        image: p.image,
        image_nobg: p.image_nobg,
        tags: p.tags,
        colors: p.colors,
        occasion: [],
        season: [],
        style: p.style,
        material: '',
        sleeve: '',
        length: '',
        neckline: '',
        fit: '',
        color_temperature: '',
        created_at: '',
        updated_at: ''
      }))
      setRecommendedProducts(convertedProducts)
      setFromChatPage(true)
      setAiMessage(`✨ 從 BE 27 對話帶入 ${convertedProducts.length} 件推薦商品\n\n點擊商品即可加入白板搭配！`)
      console.log('📦 從 Chat 頁面載入推薦商品:', convertedProducts.length, '件')
    }
  }, [storeProducts])

  // 載入商品
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const response = await fetchProducts({
          category: selectedCategory || undefined,
          is_active: true,
          page_size: 100,
        })
        setProducts(response.results)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [selectedCategory])

  // 篩選商品
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 新增商品到白板
  const addToCanvas = useCallback(
    (product: DjangoProduct) => {
      const newItem: CanvasItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        scale: 1,
        zIndex: nextZIndex,
        selected: false,
      }
      setCanvasItems((prev) => [...prev, newItem])
      setNextZIndex((prev) => prev + 1)
      setSelectedItemIds([newItem.id])
    },
    [nextZIndex]
  )

  // 移動商品
  const moveItem = useCallback((id: string, x: number, y: number) => {
    setCanvasItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    )
  }, [])

  // 選擇商品（支援多選）
  const selectItem = useCallback(
    (id: string, isMultiSelect: boolean = false) => {
      if (isMultiSelect) {
        // 多選模式：切換選中狀態
        setSelectedItemIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
      } else {
        // 單選模式
        setSelectedItemIds([id])
      }
      setCanvasItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, zIndex: nextZIndex } : item
        )
      )
      setNextZIndex((prev) => prev + 1)
    },
    [nextZIndex]
  )

  // 清除選取
  const clearSelection = useCallback(() => {
    setSelectedItemIds([])
  }, [])

  // 移除商品
  const removeItem = useCallback((id: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedItemIds((prev) => prev.filter((i) => i !== id))
  }, [])

  // 框選開始
  const handleMarqueeStart = useCallback((e: React.MouseEvent) => {
    if (toolMode !== 'marquee') return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMarquee({ startX: x, startY: y, endX: x, endY: y })
    setIsMarqueeActive(true)
    setSelectedItemIds([])
  }, [toolMode])

  // 框選移動
  const handleMarqueeMove = useCallback((e: React.MouseEvent) => {
    if (!isMarqueeActive || !marquee) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMarquee((prev) => prev ? { ...prev, endX: x, endY: y } : null)
  }, [isMarqueeActive, marquee])

  // 框選結束
  const handleMarqueeEnd = useCallback(() => {
    if (!isMarqueeActive || !marquee) return

    // 計算框選範圍
    const minX = Math.min(marquee.startX, marquee.endX)
    const maxX = Math.max(marquee.startX, marquee.endX)
    const minY = Math.min(marquee.startY, marquee.endY)
    const maxY = Math.max(marquee.startY, marquee.endY)

    // 找出與框選範圍相交的商品（只要有部分重疊就選中）
    const selectedIds = canvasItems
      .filter((item) => {
        const itemLeft = item.x
        const itemRight = item.x + 200  // 商品寬度
        const itemTop = item.y
        const itemBottom = item.y + 250  // 商品高度

        // 檢查矩形是否相交
        const intersects = !(
          itemRight < minX ||
          itemLeft > maxX ||
          itemBottom < minY ||
          itemTop > maxY
        )
        return intersects
      })
      .map((item) => item.id)

    console.log('框選結果:', selectedIds.length, '件商品')
    setSelectedItemIds(selectedIds)
    setMarquee(null)
    setIsMarqueeActive(false)
  }, [isMarqueeActive, marquee, canvasItems])

  // 新增 LOOK
  const createLook = useCallback(() => {
    const newLook: Look = {
      id: `look-${Date.now()}`,
      name: `LOOK ${looks.length + 1}`,
      items: [],
      createdAt: new Date(),
    }
    setLooks((prev) => [...prev, newLook])
  }, [looks.length])

  // 將選中商品加入 LOOK
  const addItemsToLook = useCallback((lookId: string, itemIds: string[]) => {
    const itemsToAdd = canvasItems.filter((item) => itemIds.includes(item.id))

    setLooks((prev) =>
      prev.map((look) =>
        look.id === lookId
          ? { ...look, items: [...look.items, ...itemsToAdd] }
          : look
      )
    )

    // 從白板移除已加入 LOOK 的商品
    setCanvasItems((prev) => prev.filter((item) => !itemIds.includes(item.id)))
    setSelectedItemIds([])
  }, [canvasItems])

  // 從 LOOK 移除商品
  const removeItemFromLook = useCallback((lookId: string, itemId: string) => {
    setLooks((prev) =>
      prev.map((look) =>
        look.id === lookId
          ? { ...look, items: look.items.filter((item) => item.id !== itemId) }
          : look
      )
    )
  }, [])

  // 刪除 LOOK
  const deleteLook = useCallback((lookId: string) => {
    setLooks((prev) => prev.filter((look) => look.id !== lookId))
  }, [])

  // 處理拖拽到 LOOK 區域
  const handleDropToLook = useCallback((lookId: string) => {
    if (selectedItemIds.length > 0) {
      addItemsToLook(lookId, selectedItemIds)
    }
    setDragOverLookId(null)
  }, [selectedItemIds, addItemsToLook])

  // ===== 功能列操作 =====

  // 放大選中商品
  const scaleUp = useCallback(() => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        selectedItemIds.includes(item.id)
          ? { ...item, scale: Math.min(item.scale + 0.2, 3) }
          : item
      )
    )
  }, [selectedItemIds])

  // 縮小選中商品
  const scaleDown = useCallback(() => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        selectedItemIds.includes(item.id)
          ? { ...item, scale: Math.max(item.scale - 0.2, 0.3) }
          : item
      )
    )
  }, [selectedItemIds])

  // 複製選中商品
  const duplicateItems = useCallback(() => {
    const itemsToCopy = canvasItems.filter((item) =>
      selectedItemIds.includes(item.id)
    )
    const newItems = itemsToCopy.map((item) => ({
      ...item,
      id: `${item.product.id}-${Date.now()}-${Math.random()}`,
      x: item.x + 30,
      y: item.y + 30,
      zIndex: nextZIndex,
    }))
    setCanvasItems((prev) => [...prev, ...newItems])
    setNextZIndex((prev) => prev + newItems.length)
    setSelectedItemIds(newItems.map((item) => item.id))
  }, [canvasItems, selectedItemIds, nextZIndex])

  // 刪除選中商品
  const deleteSelectedItems = useCallback(() => {
    setCanvasItems((prev) =>
      prev.filter((item) => !selectedItemIds.includes(item.id))
    )
    setSelectedItemIds([])
  }, [selectedItemIds])

  // 截圖功能
  const captureCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const html2canvas = (await import('html2canvas')).default
      const result = await html2canvas(canvas, {
        backgroundColor: '#f3f4f6',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `look-${Date.now()}.png`
      link.href = result.toDataURL()
      link.click()
    } catch (error) {
      console.error('截圖失敗:', error)
      alert('截圖失敗，請重試')
    }
  }, [])

  // ===== 試穿彈窗功能 =====

  // 開啟試穿彈窗
  const openTryOnModal = useCallback((look: Look) => {
    setTryOnLook(look)
    setTryOnModalOpen(true)
    setUserPhoto(null)
    setTryOnResult(null)
    setTryOnError(null)
  }, [])

  // 關閉試穿彈窗
  const closeTryOnModal = useCallback(() => {
    setTryOnModalOpen(false)
    setTryOnLook(null)
    setUserPhoto(null)
    setTryOnResult(null)
    setTryOnError(null)
  }, [])

  // 處理照片上傳
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setUserPhoto(base64)
    }
    reader.readAsDataURL(file)
  }, [])

  // 執行試穿（支援多件商品 - 兩步試穿）
  const executeTryOn = useCallback(async () => {
    if (!userPhoto || !tryOnLook || tryOnLook.items.length === 0) return

    setIsTryOnLoading(true)
    setTryOnError(null)

    try {
      const items = tryOnLook.items

      if (items.length === 1) {
        // === 單件試穿 ===
        const garmentUrl = getImageUrl(items[0].product.image_nobg || items[0].product.image)
        console.log('👗 單件試穿:', items[0].product.name)

        const response = await fetch('/api/tryon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personImageUrl: userPhoto,
            garmentImageUrl: garmentUrl,
            customRequest: '',
            keepOtherItems: true,
          }),
        })

        const data = await response.json()
        if (data.url) {
          setTryOnResult(data.url)
          console.log('✅ 單件試穿成功')
        } else {
          throw new Error(data.error || data.message || '試穿失敗')
        }
      } else {
        // === 多件試穿（兩步：上衣 → 下身）===
        console.log(`👕👖 開始兩步試穿 (${items.length} 件商品)...`)

        // 找出上衣和下身
        const topItem = items.find(i => ['top', 'jacket', 'two-piece'].includes(i.product.category)) || items[0]
        const bottomItem = items.find(i => i.product.category === 'bottom') || items.find(i => i !== topItem)

        // Step 1: 試穿上衣
        const topUrl = getImageUrl(topItem.product.image_nobg || topItem.product.image)
        console.log(`👕 Step 1: 試穿上衣 (${topItem.product.name})`)

        const topResponse = await fetch('/api/tryon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personImageUrl: userPhoto,
            garmentImageUrl: topUrl,
            customRequest: 'only top',
            keepOtherItems: true,
          }),
        })
        const topResult = await topResponse.json()

        if (!topResult.url) {
          throw new Error(topResult.error || '上衣試穿失敗')
        }
        console.log('✅ Step 1 完成')

        // Step 2: 用上衣結果再試穿下身
        if (bottomItem && bottomItem !== topItem) {
          const bottomUrl = getImageUrl(bottomItem.product.image_nobg || bottomItem.product.image)
          console.log(`👖 Step 2: 試穿下身 (${bottomItem.product.name})`)

          const bottomResponse = await fetch('/api/tryon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personImageUrl: topResult.url,  // 用上一步的結果圖
              garmentImageUrl: bottomUrl,
              customRequest: 'only bottom',
              keepOtherItems: true,
            }),
          })
          const bottomResult = await bottomResponse.json()

          if (bottomResult.url) {
            setTryOnResult(bottomResult.url)
            console.log('✅ 兩步試穿完成！')
          } else {
            setTryOnResult(topResult.url)
            console.log('⚠️ 下身試穿失敗，顯示上衣結果')
          }
        } else {
          setTryOnResult(topResult.url)
          console.log('✅ 只有上衣，試穿完成')
        }
      }
    } catch (error: any) {
      console.error('❌ 試穿錯誤:', error)
      setTryOnError(error.message || '試穿服務暫時不可用')
    } finally {
      setIsTryOnLoading(false)
    }
  }, [userPhoto, tryOnLook])

  // 下載試穿結果
  const downloadTryOnResult = useCallback(() => {
    if (!tryOnResult) return

    const link = document.createElement('a')
    link.download = `tryon-${Date.now()}.png`
    link.href = tryOnResult
    link.click()
  }, [tryOnResult])

  // 將試穿結果加入白板
  const addTryOnResultToCanvas = useCallback(() => {
    if (!tryOnResult || !tryOnLook) return

    // 建立一個虛擬商品來放試穿結果圖（使用負數 ID 避免與真實商品衝突）
    const tryOnProduct: DjangoProduct = {
      id: -Date.now(),
      name: `${tryOnLook.name} 試穿效果`,
      sku: null,
      price: '0',
      original_price: null,
      category: 'tryon-result',
      description: '',
      composition: '',
      care_instructions: '',
      size_info: '',
      stock: 1,
      is_active: true,
      image: tryOnResult,
      image_nobg: tryOnResult,
      tags: ['試穿結果'],
      colors: [],
      occasion: [],
      season: [],
      style: '',
      material: '',
      sleeve: '',
      length: '',
      neckline: '',
      fit: '',
      color_temperature: '',
      created_at: '',
      updated_at: ''
    }

    const newItem: CanvasItem = {
      id: `tryon-${Date.now()}`,
      product: tryOnProduct,
      x: 300 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      scale: 0.8,
      zIndex: nextZIndex,
      selected: false,
    }

    setCanvasItems((prev) => [...prev, newItem])
    setNextZIndex((prev) => prev + 1)
    closeTryOnModal()
  }, [tryOnResult, tryOnLook, nextZIndex, closeTryOnModal])

  // 計算總價
  const totalPrice = canvasItems.reduce(
    (sum, item) => sum + parseInt(item.product.price),
    0
  )

  // 清空白板
  const clearCanvas = () => {
    setCanvasItems([])
    setSelectedItemIds([])
  }

  // AI 推薦搜尋
  const handleAiSearch = async () => {
    if (!promptInput.trim() || isAiLoading) return

    setIsAiLoading(true)
    setAiMessage('')
    setHasSearched(true)

    try {
      const response = await fetch('/api/studio/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptInput }),
      })

      const data = await response.json()

      if (data.success) {
        setAiMessage(data.message || '')
        setRecommendedProducts(data.products || [])
        console.log(`✅ AI 推薦 ${data.count} 件商品`)
      } else {
        setAiMessage(data.error || '搜尋失敗，請重試')
        setRecommendedProducts([])
      }
    } catch (error) {
      console.error('AI 搜尋錯誤:', error)
      setAiMessage('網路錯誤，請檢查連線')
      setRecommendedProducts([])
    } finally {
      setIsAiLoading(false)
    }
  }

  // 處理 Enter 鍵
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAiSearch()
    }
  }

  // 顯示的商品列表
  const displayProducts = showAllProducts ? filteredProducts : recommendedProducts

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-pink-500" />
          <h1 className="text-xl font-bold">BE 27 穿搭工作室</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            白板上有 {canvasItems.length} 件商品
          </span>
          {canvasItems.length > 0 && (
            <button
              onClick={clearCanvas}
              className="text-sm text-red-500 hover:text-red-600"
            >
              清空白板
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側面板 - AI 對話 + 推薦商品 */}
        <div
          className={`bg-white border-r transition-all duration-300 flex flex-col ${
            leftPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          {leftPanelOpen && (
            <>
              {/* AI 對話輸入區 */}
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-pink-500" />
                  <span className="font-medium text-gray-700">AI 穿搭推薦</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="例：約會穿搭、甜美洋裝..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isAiLoading}
                    className="w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleAiSearch}
                    disabled={isAiLoading || !promptInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAiLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* AI 回覆 */}
                {aiMessage && (
                  <div className="bg-pink-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {aiMessage}
                  </div>
                )}

                {/* 切換顯示模式 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAllProducts(false)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                      !showAllProducts
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    AI 推薦 ({recommendedProducts.length})
                  </button>
                  <button
                    onClick={() => setShowAllProducts(true)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                      showAllProducts
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    全部商品
                  </button>
                </div>

                {/* 分類篩選（僅全部商品模式） */}
                {showAllProducts && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedCategory === cat.value
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 商品列表 */}
              <div className="flex-1 overflow-y-auto p-4">
                {(showAllProducts ? loading : isAiLoading) ? (
                  <div className="text-center py-8 text-gray-500">
                    {isAiLoading ? '🔍 AI 搜尋中...' : '載入中...'}
                  </div>
                ) : displayProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {!hasSearched && !showAllProducts ? (
                      <>
                        <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>輸入穿搭需求</p>
                        <p className="text-xs mt-1">AI 會為你推薦商品</p>
                      </>
                    ) : (
                      <p>沒有找到商品</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {displayProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCanvas={addToCanvas}
                        onShowDetail={setDetailProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 左側面板切換按鈕 */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-r-lg p-2 shadow-md hover:bg-gray-50"
          style={{ left: leftPanelOpen ? '320px' : '0' }}
        >
          {leftPanelOpen ? (
            <ChevronLeftIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </button>

        {/* 中間白板區域 */}
        <div
          ref={canvasRef}
          id="whiteboard-canvas"
          className={`flex-1 relative overflow-hidden ${
            toolMode === 'marquee' ? 'cursor-crosshair' : ''
          }`}
          style={{
            backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          onClick={() => {
            if (toolMode === 'select') clearSelection()
          }}
          onMouseDown={handleMarqueeStart}
          onMouseMove={handleMarqueeMove}
          onMouseUp={handleMarqueeEnd}
          onMouseLeave={handleMarqueeEnd}
        >
          {/* 工具欄 */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-lg p-2 flex gap-1 flex-wrap justify-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* 基本工具 */}
            <button
              onClick={() => setToolMode('select')}
              className={`p-2 rounded-lg transition-colors ${
                toolMode === 'select'
                  ? 'bg-pink-100 text-pink-600'
                  : 'hover:bg-gray-100'
              }`}
              title="選取工具"
            >
              <CursorArrowRaysIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setToolMode('marquee')}
              className={`p-2 rounded-lg transition-colors ${
                toolMode === 'marquee'
                  ? 'bg-pink-100 text-pink-600'
                  : 'hover:bg-gray-100'
              }`}
              title="框選工具"
            >
              <Square2StackIcon className="w-5 h-5" />
            </button>

            <div className="w-px bg-gray-200 mx-1" />

            {/* 建立 LOOK - 需要選中商品 */}
            <button
              onClick={() => {
                if (selectedItemIds.length === 0) return
                const newLookId = `look-${Date.now()}`
                const itemsToAdd = canvasItems.filter((item) =>
                  selectedItemIds.includes(item.id)
                )
                const newLook: Look = {
                  id: newLookId,
                  name: `LOOK ${looks.length + 1}`,
                  items: itemsToAdd,
                  createdAt: new Date(),
                }
                setLooks((prev) => [...prev, newLook])
                setSelectedItemIds([])
              }}
              disabled={selectedItemIds.length === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                selectedItemIds.length > 0
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="建立 LOOK"
            >
              <PlusIcon className="w-4 h-4" />
              LOOK {selectedItemIds.length > 0 && `(${selectedItemIds.length})`}
            </button>

            <div className="w-px bg-gray-200 mx-1" />

            {/* 縮放 */}
            <button
              onClick={scaleUp}
              disabled={selectedItemIds.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                selectedItemIds.length > 0
                  ? 'hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="放大"
            >
              <MagnifyingGlassPlusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={scaleDown}
              disabled={selectedItemIds.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                selectedItemIds.length > 0
                  ? 'hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="縮小"
            >
              <MagnifyingGlassMinusIcon className="w-5 h-5" />
            </button>

            {/* 複製 */}
            <button
              onClick={duplicateItems}
              disabled={selectedItemIds.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                selectedItemIds.length > 0
                  ? 'hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="複製"
            >
              <DocumentDuplicateIcon className="w-5 h-5" />
            </button>

            <div className="w-px bg-gray-200 mx-1" />

            {/* 截圖 - 始終可用 */}
            <button
              onClick={captureCanvas}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="截圖"
            >
              <CameraIcon className="w-5 h-5" />
            </button>

            {/* 繪圖（暫時顯示提示） */}
            <button
              onClick={() => alert('繪圖功能開發中...')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              title="繪圖（開發中）"
            >
              <PencilIcon className="w-5 h-5" />
            </button>

            <div className="w-px bg-gray-200 mx-1" />

            {/* 刪除 */}
            <button
              onClick={deleteSelectedItems}
              disabled={selectedItemIds.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                selectedItemIds.length > 0
                  ? 'hover:bg-red-100 text-red-500'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="刪除"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 空白提示 */}
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <HandRaisedIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">點擊左側商品加入白板</p>
                <p className="text-sm mt-2">使用框選工具圈選後拖入右側 LOOK</p>
              </div>
            </div>
          )}

          {/* 商品列表 */}
          {canvasItems.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onMove={moveItem}
              onSelect={selectItem}
              onRemove={removeItem}
              isSelected={selectedItemIds.includes(item.id)}
            />
          ))}

          {/* 框選視覺效果 */}
          {marquee && isMarqueeActive && (
            <div
              className="absolute border-2 border-pink-500 bg-pink-500/10 pointer-events-none"
              style={{
                left: Math.min(marquee.startX, marquee.endX),
                top: Math.min(marquee.startY, marquee.endY),
                width: Math.abs(marquee.endX - marquee.startX),
                height: Math.abs(marquee.endY - marquee.startY),
              }}
            />
          )}

          {/* 選中數量提示 */}
          {selectedItemIds.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              已選中 {selectedItemIds.length} 件商品 - 點擊上方「建立 LOOK」按鈕
            </div>
          )}
        </div>

        {/* 右側面板切換按鈕 */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-l-lg p-2 shadow-md hover:bg-gray-50"
          style={{ right: rightPanelOpen ? '320px' : '0' }}
        >
          {rightPanelOpen ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>

        {/* 右側面板 - LOOK 組合 */}
        <div
          className={`bg-white border-l transition-all duration-300 flex flex-col ${
            rightPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          {rightPanelOpen && (
            <>
              <div className="p-4 border-b">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Square2StackIcon className="w-5 h-5" />
                  LOOK 組合
                </h2>
                <p className="text-xs text-gray-500 mt-1">框選白板商品後點「建立 LOOK」</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* LOOK 列表 */}
                {looks.map((look) => {
                  const lookTotal = look.items.reduce(
                    (sum, item) => sum + parseInt(item.product.price),
                    0
                  )
                  return (
                    <div
                      key={look.id}
                      className={`border-2 rounded-xl p-3 transition-colors ${
                        dragOverLookId === look.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOverLookId(look.id)
                      }}
                      onDragLeave={() => setDragOverLookId(null)}
                      onDrop={() => handleDropToLook(look.id)}
                    >
                      {/* LOOK 標題 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-pink-600">{look.name}</span>
                        <button
                          onClick={() => deleteLook(look.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* LOOK 商品 */}
                      {look.items.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                          拖入商品到這裡
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {look.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <img
                                src={getImageUrl(item.product.image_nobg || item.product.image)}
                                alt={item.product.name}
                                className="w-10 h-10 object-contain bg-white rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-pink-600 text-sm font-bold">
                                  ${parseInt(item.product.price).toLocaleString()}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItemFromLook(look.id, item.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <XMarkIcon className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          ))}

                          {/* LOOK 總價與操作 */}
                          <div className="pt-2 border-t mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">小計</span>
                              <span className="font-bold text-pink-600">
                                NT${lookTotal.toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => openTryOnModal(look)}
                              className="w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 flex items-center justify-center gap-1"
                            >
                              <SparklesIcon className="w-4 h-4" />
                              試穿這套
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* 空白提示 */}
                {looks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Square2StackIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">尚未建立 LOOK</p>
                    <p className="text-xs mt-2">
                      1. 在白板上擺放商品<br />
                      2. 用框選工具圈選<br />
                      3. 點擊「建立 LOOK」
                    </p>
                  </div>
                )}
              </div>

              {/* 總覽 */}
              {looks.length > 0 && looks.some((l) => l.items.length > 0) && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">
                      共 {looks.length} 套 LOOK
                    </span>
                    <span className="text-xl font-bold text-pink-600">
                      NT$
                      {looks
                        .reduce(
                          (sum, look) =>
                            sum +
                            look.items.reduce(
                              (s, item) => s + parseInt(item.product.price),
                              0
                            ),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5" />
                    全部加入購物車
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 商品詳情 Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

      {/* 隱藏的檔案輸入（放在最外層避免事件干擾） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* 試穿彈窗 Modal */}
      {tryOnModalOpen && tryOnLook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 標題列 */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-pink-500" />
                試穿 {tryOnLook.name}
              </h2>
              <button
                onClick={closeTryOnModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* 內容區 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* LOOK 商品預覽 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">搭配商品</h3>
                <div className="flex gap-3 flex-wrap">
                  {tryOnLook.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <img
                        src={getImageUrl(item.product.image_nobg || item.product.image)}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain bg-white rounded"
                      />
                      <div className="text-xs">
                        <p className="font-medium truncate max-w-[100px]">{item.product.name}</p>
                        <p className="text-pink-600">${parseInt(item.product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 雙欄：上傳照片 + 試穿結果 */}
              <div className="grid grid-cols-2 gap-6">
                {/* 左側：上傳照片 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-600">你的照片</h3>
                  <div
                    className={`aspect-[3/4] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                      userPhoto
                        ? 'border-pink-300 bg-pink-50'
                        : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="你的照片"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">點擊上傳照片</p>
                      </div>
                    )}
                  </div>
                  {userPhoto && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      重新選擇照片
                    </button>
                  )}
                </div>

                {/* 右側：試穿結果 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-600">試穿效果</h3>
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    {isTryOnLoading ? (
                      <div className="text-center text-gray-400">
                        <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm">AI 試穿生成中...</p>
                        <p className="text-xs text-gray-400 mt-1">約需 10-20 秒</p>
                      </div>
                    ) : tryOnResult ? (
                      <img
                        src={tryOnResult}
                        alt="試穿結果"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : tryOnError ? (
                      <div className="text-center text-red-400 p-4">
                        <XMarkIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">{tryOnError}</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">上傳照片後</p>
                        <p className="text-sm">點擊「開始試穿」</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作列 */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              {!tryOnResult ? (
                <>
                  <button
                    onClick={closeTryOnModal}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100"
                  >
                    取消
                  </button>
                  <button
                    onClick={executeTryOn}
                    disabled={!userPhoto || isTryOnLoading}
                    className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                      userPhoto && !isTryOnLoading
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <SparklesIcon className="w-5 h-5" />
                    開始試穿
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={downloadTryOnResult}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    下載圖片
                  </button>
                  <button
                    onClick={addTryOnResultToCanvas}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    加入白板
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
