import React from 'react'
import { LuTrendingUpDown } from "react-icons/lu";


const Authlayout = ({children}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-12 relative">

      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-700 to-rose-700 rounded-full flex items-center justify-center text-white">
                <LuTrendingUpDown className="text-xl" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-bold text-gray-900">Expensa</div>
              <div className="text-xs text-gray-500">Smart Expense Tracker</div>
            </div>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">Secure · Fast · Insightful</div>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-16 flex flex-col justify-center">
          <div className="mb-4">
            {/* Intentionally left small to avoid duplicating header */}
          </div>

          <div className="mt-2 transition-all duration-300 w-full min-h-120 md:min-h-130 flex items-center overflow-y-auto">
            <div className="w-full">
              {children}
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-400">© {new Date().getFullYear()} Expensa</div>
        </div>

        <div className="hidden md:flex items-center justify-center bg-linear-to-br from-orange-700 to-rose-700 p-8 text-white">
          <div className="w-full max-w-md text-white">
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <div className="text-sm">Track Your Income & Expenses</div>
              <div className="text-2xl font-semibold mt-2">$430,000</div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm mb-3">All Transactions</div>
              <div className="h-36 rounded-lg flex items-end gap-3 p-2">
                <div className="flex-1 h-full flex items-end">
                  <div className="bg-white/80 w-full rounded-t h-12" />
                </div>
                <div className="flex-1 h-full flex items-end">
                  <div className="bg-white/70 w-full rounded-t h-20" />
                </div>
                <div className="flex-1 h-full flex items-end">
                  <div className="bg-white/60 w-full rounded-t h-28" />
                </div>
                <div className="flex-1 h-full flex items-end">
                  <div className="bg-white/50 w-full rounded-t h-16" />
                </div>
                <div className="flex-1 h-full flex items-end">
                  <div className="bg-white/70 w-full rounded-t h-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Authlayout