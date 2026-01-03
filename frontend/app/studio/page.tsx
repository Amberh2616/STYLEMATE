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
} from '@heroicons/react/24/outline'
import { DjangoProduct, fetchProducts, getImageUrl } from '@/lib/api/django'

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
  // 商品列表
  const [products, setProducts] = useState<DjangoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

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

  // 分類列表
  const categories = [
    { value: '', label: '全部' },
    { value: 'top', label: '上衣' },
    { value: 'bottom', label: '下身' },
    { value: 'dress', label: '洋裝' },
    { value: 'two-piece', label: '套裝' },
    { value: 'jacket', label: '外套' },
  ]

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
        {/* 左側面板 - 商品列表 */}
        <div
          className={`bg-white border-r transition-all duration-300 flex flex-col ${
            leftPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          {leftPanelOpen && (
            <>
              {/* 搜尋與篩選 */}
              <div className="p-4 border-b space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜尋商品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 商品列表 */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">載入中...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">沒有商品</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
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
            backgroundImage:
              'radial-gradient(circle, #ddd 1px, transparent 1px)',
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
          {/* 工具欄 - 始終顯示 */}
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
                            <button className="w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 flex items-center justify-center gap-1">
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
    </div>
  )
}
