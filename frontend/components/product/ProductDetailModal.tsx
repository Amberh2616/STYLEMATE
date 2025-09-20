'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { ProductDetail } from '../../types/product-detail';
import SizeChart from './SizeChart';
import MaterialInfo from './MaterialInfo';

interface ProductDetailModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showMaterialInfo, setShowMaterialInfo] = useState(false);

  if (!product) return null;

  const currentVariant = product.variants[selectedVariant];
  const availableSizes = Object.keys(currentVariant.stock).filter(
    size => currentVariant.stock[size] > 0
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all">
                
                {/* 關閉按鈕 */}
                <div className="absolute right-4 top-4 z-10">
                  <button
                    onClick={onClose}
                    className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-50"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                <div className="flex">
                  {/* 左側 - 產品圖片 */}
                  <div className="w-1/2 p-6">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={currentVariant.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 小圖縮略圖 */}
                    <div className="flex mt-4 space-x-2">
                      {currentVariant.images.map((image, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 cursor-pointer">
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右側 - 產品資訊 */}
                  <div className="w-1/2 p-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </Dialog.Title>
                    
                    <div className="text-3xl font-bold text-rose-600 mb-4">
                      NT$ {product.price.toLocaleString()}
                    </div>

                    {/* 顏色選擇 */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        顏色：{currentVariant.colorName}
                      </h4>
                      <div className="flex space-x-2">
                        {product.variants.map((variant, index) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(index)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              index === selectedVariant 
                                ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-800' 
                                : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: variant.colorCode || variant.color }}
                          >
                            <span className="sr-only">{variant.colorName}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 尺寸選擇 */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700">尺寸</h4>
                        <button
                          onClick={() => setShowSizeChart(true)}
                          className="text-sm text-rose-600 hover:text-rose-700 underline"
                        >
                          尺寸表
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                          const isAvailable = availableSizes.includes(size);
                          const isSelected = selectedSize === size;
                          
                          return (
                            <button
                              key={size}
                              onClick={() => isAvailable && setSelectedSize(size)}
                              disabled={!isAvailable}
                              className={`
                                py-2 px-3 border rounded-lg text-sm font-medium
                                ${isSelected 
                                  ? 'bg-gray-900 text-white border-gray-900' 
                                  : isAvailable 
                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                }
                              `}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 材質資訊按鈕 */}
                    <div className="mb-6">
                      <button
                        onClick={() => setShowMaterialInfo(true)}
                        className="text-sm text-rose-600 hover:text-rose-700 underline"
                      >
                        📏 查看詳細尺寸與材質資訊
                      </button>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="space-y-3">
                      <button 
                        disabled={!selectedSize}
                        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <ShoppingBagIcon className="h-5 w-5" />
                        <span>加入購物車</span>
                      </button>
                      
                      <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2">
                        <HeartIcon className="h-5 w-5" />
                        <span>加入收藏</span>
                      </button>
                    </div>

                    {/* 產品詳情 */}
                    <div className="mt-6 text-sm text-gray-600">
                      <p><strong>商品編號：</strong>{product.productDetails.sku}</p>
                      <p><strong>材質：</strong>{product.materialInfo.composition}</p>
                      {product.productDetails.modelInfo && (
                        <p><strong>模特兒資訊：</strong>{product.productDetails.modelInfo}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 尺寸表 Modal */}
                <SizeChart
                  isOpen={showSizeChart}
                  onClose={() => setShowSizeChart(false)}
                  product={product}
                />

                {/* 材質資訊 Modal */}
                <MaterialInfo
                  isOpen={showMaterialInfo}
                  onClose={() => setShowMaterialInfo(false)}
                  product={product}
                />

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}