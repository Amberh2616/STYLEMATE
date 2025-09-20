'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProductDetail } from '../../types/product-detail';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
}

export default function SizeChart({ isOpen, onClose, product }: SizeChartProps) {
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    📏 尺寸對照表
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* 尺寸表 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">尺寸</th>
                        {product.category === 'dress' || product.category === 'top' ? (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">胸圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">腰圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">衣長 (cm)</th>
                            {product.category === 'dress' && (
                              <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">臀圍 (cm)</th>
                            )}
                          </>
                        ) : product.category === 'pants' || product.category === 'shorts' ? (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">腰圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">臀圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">褲長 (cm)</th>
                          </>
                        ) : (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">胸圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">腰圍 (cm)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">長度 (cm)</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizes.map((sizeInfo) => (
                        <tr key={sizeInfo.size}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{sizeInfo.size}</td>
                          <td className="border border-gray-300 px-4 py-2">{sizeInfo.measurements.bust || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">{sizeInfo.measurements.waist || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {sizeInfo.measurements.length || sizeInfo.measurements.inseam || '-'}
                          </td>
                          {product.category === 'dress' && (
                            <td className="border border-gray-300 px-4 py-2">{sizeInfo.measurements.hip || '-'}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 測量說明 */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">📐 測量方法：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>胸圍：</strong>沿胸部最豐滿處水平測量</li>
                    <li>• <strong>腰圍：</strong>沿腰部最細處水平測量</li>
                    <li>• <strong>臀圍：</strong>沿臀部最豐滿處水平測量</li>
                    <li>• <strong>衣長：</strong>從肩點到衣服下擺的長度</li>
                  </ul>
                </div>

                {/* 模特兒資訊 */}
                {product.productDetails.modelInfo && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">👤 模特兒參考：</h4>
                    <p className="text-sm text-gray-600">{product.productDetails.modelInfo}</p>
                  </div>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}