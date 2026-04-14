'use client'

import { motion } from 'framer-motion'

export default function Step2Quantity({
  quantity,
  setQuantity,
  quantityUnit,
  setQuantityUnit,
  grade,
  setGrade,
  moisture,
  setMoisture,
  selectedCrop,
  onNext,
  onBack,
}: any) {
  const quantityKg = quantityUnit === 'quintals' ? quantity * 100 : quantity
  const quantityQuintals = quantityUnit === 'quintals' ? quantity : quantity / 100
  const minPrice = selectedCrop ? Math.round(selectedCrop.avgPrice * 0.8) : 0
  const maxPrice = selectedCrop ? Math.round(selectedCrop.avgPrice * 1.2) : 0
  const gradeMultiplier = grade === 'A' ? 1.1 : grade === 'C' ? 0.85 : 1

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Kitni Fasal Bechni Hai? 📦</h2>
        <p className="text-gray-500 mt-2">Enter quantity and quality</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Matra) | मात्रा
            </label>
            <div className="flex gap-2 mb-3">
              {(['quintals', 'kg'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setQuantityUnit(unit)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quantityUnit === unit ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {unit === 'quintals' ? 'Quintals (q)' : 'Kilograms (kg)'}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              min={1}
            />
            <p className="text-center text-sm text-gray-500 mt-2">
              = {quantityUnit === 'quintals' ? `${quantityKg.toLocaleString('en-IN')} kg` : `${quantityQuintals.toFixed(1)} quintals`}
            </p>
            <div className="flex gap-2 mt-3">
              {[10, 50, 100, 500].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantityUnit('quintals') || setQuantity(q)}
                  className="flex-1 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-green-100 hover:text-green-700 transition-colors"
                >
                  {q}q
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade | गुणवत्ता</label>
            <div className="space-y-2">
              {[
                { grade: 'A' as const, label: 'A Grade - Premium', desc: 'Clean, uniform, no damage', impact: '+8-12% above average', color: 'yellow' },
                { grade: 'B' as const, label: 'B Grade - Standard', desc: 'Minor blemishes acceptable', impact: 'Average market price', color: 'green' },
                { grade: 'C' as const, label: 'C Grade - Commercial', desc: 'Processing grade', impact: '-10-20% below average', color: 'orange' },
              ].map((g) => (
                <button
                  key={g.grade}
                  onClick={() => setGrade(g.grade)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                    grade === g.grade
                      ? `border-${g.color}-500 bg-${g.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium">{g.label}</p>
                  <p className="text-xs text-gray-500">{g.desc}</p>
                  <p className="text-xs text-green-600 mt-1">{g.impact}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Moisture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moisture Content | नमी: {moisture}%
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span className={moisture <= 14 ? 'text-green-600' : moisture <= 20 ? 'text-yellow-600' : 'text-red-600'}>
                {moisture <= 14 ? 'Ideal ✓' : moisture <= 20 ? 'Acceptable' : 'Price Penalty ⚠'}
              </span>
              <span>30%</span>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div>
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">📊 Your Crop Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Crop</span>
                <span className="font-medium">{selectedCrop?.name} (Grade {grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium">{quantityQuintals.toFixed(1)} quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="font-medium">{quantityKg.toLocaleString('en-IN')} kg</span>
              </div>
              <hr />
              <div>
                <p className="text-gray-500 mb-2">Estimated Value Range:</p>
                <p className="text-xs text-gray-400">
                  Min: ₹{Math.round(minPrice * gradeMultiplier * quantityQuintals).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">
                  Max: ₹{Math.round(maxPrice * gradeMultiplier * quantityQuintals).toLocaleString('en-IN')}
                </p>
                <p className="text-sm font-bold text-green-600 mt-1">
                  Average: ₹{Math.round(selectedCrop?.avgPrice * gradeMultiplier * quantityQuintals).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl mt-4">
                <p className="text-xs text-green-700">
                  🤖 Grade {grade} {selectedCrop?.name?.toLowerCase()}s {grade === 'A' ? 'command premium prices at export houses.' : grade === 'C' ? 'are best for processing buyers.' : 'fetch standard market rates.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!quantity || quantity <= 0}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agla Step →
        </button>
      </div>
    </div>
  )
}
