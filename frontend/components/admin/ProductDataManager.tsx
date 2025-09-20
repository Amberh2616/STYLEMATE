'use client';

import { useState } from 'react';
import { STANDARD_SIZES, MATERIAL_PRESETS, ProductDetail } from '../../types/product-detail';

export default function ProductDataManager() {
  const [productData, setProductData] = useState<Partial<ProductDetail>>({
    name: '',
    price: 0,
    category: 'dress',
    variants: [],
    sizes: [],
    materialInfo: MATERIAL_PRESETS['100% Cotton']
  });

  const [currentStep, setCurrentStep] = useState(1);

  // 自動套用標準尺寸
  const applyStandardSizes = () => {
    const category = productData.category?.toUpperCase() as keyof typeof STANDARD_SIZES;
    const standardSizes = STANDARD_SIZES[category] || STANDARD_SIZES.DRESS;
    
    const sizeInfos = Object.entries(standardSizes).map(([size, measurements]) => ({
      size,
      measurements,
      modelWear: `模特兒身高170cm 穿著${size}`
    }));

    setProductData(prev => ({ ...prev, sizes: sizeInfos }));
  };

  // 新增顏色變體
  const addColorVariant = () => {
    const newVariant = {
      id: `variant_${Date.now()}`,
      color: '#000000',
      colorCode: '#000000',
      colorName: '黑色',
      images: [],
      stock: { S: 10, M: 10, L: 10 }
    };
    
    setProductData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 產品資料管理工具</h1>
      
      {/* 進度指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {step}
              </div>
              <div className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 && '基本資訊'}
                {step === 2 && '顏色變體'}
                {step === 3 && '尺寸設定'}
                {step === 4 && '材質資訊'}
              </div>
              {step < 4 && <div className="flex-1 h-px bg-gray-200 mx-4"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* 步驟 1: 基本資訊 */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">基本產品資訊</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">產品名稱</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={productData.name}
              onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例：韓式優雅荷葉邊洋裝"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格 (NT$)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={productData.price}
                onChange={(e) => setProductData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">類別</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={productData.category}
                onChange={(e) => setProductData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="dress">洋裝</option>
                <option value="top">上衣</option>
                <option value="pants">褲子</option>
                <option value="skirt">裙子</option>
                <option value="two-piece">套裝</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 步驟 2: 顏色變體 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">顏色與庫存設定</h2>
            <button
              onClick={addColorVariant}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + 新增顏色
            </button>
          </div>

          <div className="space-y-4">
            {productData.variants?.map((variant, index) => (
              <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">顏色名稱</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={variant.colorName}
                      placeholder="例：櫻花粉"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">色碼</label>
                    <input
                      type="color"
                      className="w-full h-8 border border-gray-300 rounded"
                      value={variant.colorCode}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">庫存設定</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <div key={size} className="text-center">
                        <label className="block text-xs text-gray-600 mb-1">{size}</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                          defaultValue={variant.stock[size] || 0}
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 步驟 3: 尺寸設定 */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">尺寸設定</h2>
            <button
              onClick={applyStandardSizes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              套用標準尺寸
            </button>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">💡 建議流程：</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. 點擊「套用標準尺寸」獲得基礎模板</li>
              <li>2. 根據實際商品測量修正數值</li>
              <li>3. 添加模特兒穿著建議</li>
            </ol>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">尺寸</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">胸圍 (cm)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">腰圍 (cm)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">長度 (cm)</th>
                </tr>
              </thead>
              <tbody>
                {productData.sizes?.map((sizeInfo, index) => (
                  <tr key={sizeInfo.size}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{sizeInfo.size}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input 
                        type="number" 
                        className="w-full border-0 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                        defaultValue={sizeInfo.measurements.bust}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input 
                        type="number" 
                        className="w-full border-0 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                        defaultValue={sizeInfo.measurements.waist}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input 
                        type="number" 
                        className="w-full border-0 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                        defaultValue={sizeInfo.measurements.length}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 步驟 4: 材質資訊 */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">材質與保養資訊</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">材質預設</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setProductData(prev => ({ 
                ...prev, 
                materialInfo: MATERIAL_PRESETS[e.target.value as keyof typeof MATERIAL_PRESETS]
              }))}
            >
              {Object.keys(MATERIAL_PRESETS).map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">材質成分</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={productData.materialInfo?.composition}
                  placeholder="例：95% 棉 5% 彈性纖維"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">厚薄度</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="thin">薄款</option>
                  <option value="medium">中等厚度</option>
                  <option value="thick">厚款</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">特性</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">有彈性</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">有內裡</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">洗滌說明</label>
            <div className="space-y-2">
              {productData.materialInfo?.careInstructions.map((instruction, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span className="text-sm text-gray-700">{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 導航按鈕 */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg disabled:opacity-50"
        >
          上一步
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            下一步
          </button>
        ) : (
          <button
            onClick={() => console.log('儲存產品資料:', productData)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            儲存產品
          </button>
        )}
      </div>
    </div>
  );
}