'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProductDetail } from '../../types/product-detail';

interface MaterialInfoProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
}

export default function MaterialInfo({ isOpen, onClose, product }: MaterialInfoProps) {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    🧵 材質與保養資訊
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* 材質成分 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 材質成分</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-lg font-medium">
                      {product.materialInfo.composition}
                    </p>
                  </div>
                </div>

                {/* 材質特性 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ 材質特性</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">厚薄度</p>
                      <p className="text-gray-600">
                        {product.materialInfo.thickness === 'thin' ? '薄款' : 
                         product.materialInfo.thickness === 'medium' ? '中等厚度' : '厚款'}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">彈性</p>
                      <p className="text-gray-600">
                        {product.materialInfo.stretch ? '有彈性' : '無彈性'}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">內裡</p>
                      <p className="text-gray-600">
                        {product.materialInfo.lining ? '有內裡' : '無內裡'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">透明度</p>
                      <p className="text-gray-600">
                        {product.materialInfo.transparency === 'opaque' ? '不透明' : 
                         product.materialInfo.transparency === 'semi' ? '半透明' : '透明'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 洗滌保養 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">🧼 洗滌保養</h3>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {product.materialInfo.careInstructions.map((instruction, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 產品詳細資訊 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 產品資訊</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-medium">商品編號：</span>
                      <span>{product.productDetails.sku}</span>
                    </div>
                    
                    {product.productDetails.brand && (
                      <div className="flex justify-between">
                        <span className="font-medium">品牌：</span>
                        <span>{product.productDetails.brand}</span>
                      </div>
                    )}
                    
                    {product.productDetails.origin && (
                      <div className="flex justify-between">
                        <span className="font-medium">產地：</span>
                        <span>{product.productDetails.origin}</span>
                      </div>
                    )}
                    
                    {product.productDetails.weight && (
                      <div className="flex justify-between">
                        <span className="font-medium">重量：</span>
                        <span>{product.productDetails.weight}g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ 注意事項：</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 首次穿著前請先清洗</li>
                    <li>• 深淺色衣物請分開洗滌</li>
                    <li>• 實際顏色可能因螢幕設定而有差異</li>
                    <li>• 尺寸測量可能有1-3cm誤差</li>
                  </ul>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}