'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Download, Sparkles, Beef, Droplets, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { FinancialRecord, Farm, Crop } from '@/types'
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils'
import { getCattleFinancialSummary, getMilkRecords, getFeedExpenses, addMilkRecord, addFeedExpense, deleteMilkRecord, deleteFeedExpense } from '@/lib/cattleService'
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

const containerVariants = { animate: { transition: { staggerChildren: 0.1 } } }
const cardVariants = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const COLORS = ['#1a7a4a', '#2ecc71', '#f39c12', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22']

export default function FinancePage() {
  const { user, supabase: db } = useAuth()
  const userId = user?.id || ''
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    record_type: 'expenditure', category: 'seeds', amount: '', quantity: '', unit: '',
    description: '', record_date: '', payment_method: '', crop_id: '',
  })

  // Cattle financial state
  const [cattleFinancial, setCattleFinancial] = useState({ totalMilkIncome: 0, totalFeedExpense: 0, totalHealthExpense: 0, netProfit: 0 })
  const [milkRecords, setMilkRecords] = useState<any[]>([])
  const [feedExpenses, setFeedExpenses] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showAddMilk, setShowAddMilk] = useState(false)
  const [showAddFeed, setShowAddFeed] = useState(false)
  const [milkForm, setMilkForm] = useState({ date: '', cattle_id: '', tag_id: '', morning_yield: 0, evening_yield: 0, milk_price_per_litre: 35 })
  const [feedForm, setFeedForm] = useState({ date: '', feed_type: '', quantity_kg: 0, cost_per_kg: 0, total_cost: 0, supplier: '' })

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (farms.length > 0 && !selectedFarm) setSelectedFarm(farms[0].id) }, [farms])
  useEffect(() => { if (userId) loadCattleFinancials() }, [userId, selectedMonth, selectedYear])

  async function loadCattleFinancials() {
    if (!userId) return
    try {
      const summary = await getCattleFinancialSummary(db, userId, selectedMonth, selectedYear)
      setCattleFinancial(summary)

      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`

      const milk = await getMilkRecords(db, userId, startDate, endDate)
      setMilkRecords(milk)

      const feed = await getFeedExpenses(db, userId, selectedMonth, selectedYear)
      setFeedExpenses(feed)
    } catch (error) {
      console.error('Error loading cattle financials:', error)
    }
  }

  async function handleAddMilkRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !milkForm.date || (!milkForm.morning_yield && !milkForm.evening_yield)) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      await addMilkRecord(db, {
        user_id: userId, date: milkForm.date, cattle_id: milkForm.cattle_id as any,
        tag_id: milkForm.tag_id, morning_yield: milkForm.morning_yield,
        evening_yield: milkForm.evening_yield, milk_price_per_litre: milkForm.milk_price_per_litre,
      })
      toast.success('Milk record added!')
      setShowAddMilk(false)
      setMilkForm({ date: '', cattle_id: '', tag_id: '', morning_yield: 0, evening_yield: 0, milk_price_per_litre: 35 })
      loadCattleFinancials()
    } catch (error) {
      toast.error('Failed to add milk record')
    }
  }

  async function handleAddFeedExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !feedForm.date || !feedForm.feed_type || !feedForm.total_cost) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      await addFeedExpense(db, {
        user_id: userId, date: feedForm.date, feed_type: feedForm.feed_type,
        quantity_kg: feedForm.quantity_kg, cost_per_kg: feedForm.cost_per_kg,
        total_cost: feedForm.total_cost, supplier: feedForm.supplier,
      })
      toast.success('Feed expense added!')
      setShowAddFeed(false)
      setFeedForm({ date: '', feed_type: '', quantity_kg: 0, cost_per_kg: 0, total_cost: 0, supplier: '' })
      loadCattleFinancials()
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  async function handleDeleteMilk(id: string) {
    if (!confirm('Delete this record?')) return
    try { await deleteMilkRecord(db, id); toast.success('Deleted'); loadCattleFinancials() }
    catch (error) { toast.error('Failed to delete') }
  }

  async function handleDeleteFeed(id: string) {
    if (!confirm('Delete this expense?')) return
    try { await deleteFeedExpense(db, id); toast.success('Deleted'); loadCattleFinancials() }
    catch (error) { toast.error('Failed to delete') }
  }

  async function loadData() {
    try {
      const [recordsRes, farmsRes, cropsRes] = await Promise.all([
        supabase.from('financial_records').select('*').order('record_date', { ascending: false }).limit(100),
        supabase.from('farms').select('*'),
        supabase.from('crops').select('*'),
      ])
      if (recordsRes.data) setRecords(recordsRes.data)
      if (farmsRes.data) setFarms(farmsRes.data)
      if (cropsRes.data) setCrops(cropsRes.data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const farmRecords = records.filter((r) => r.farm_id === selectedFarm)
  const totalIncome = farmRecords.filter((r) => r.record_type === 'income').reduce((sum, r) => sum + Number(r.amount), 0)
  const totalExpenditure = farmRecords.filter((r) => r.record_type === 'expenditure').reduce((sum, r) => sum + Number(r.amount), 0)
  const netProfit = totalIncome - totalExpenditure
  const roi = totalExpenditure > 0 ? ((netProfit / totalExpenditure) * 100).toFixed(1) : '0'

  const expenseByCategory = farmRecords.filter((r) => r.record_type === 'expenditure').reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.amount)
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  const monthlyData = farmRecords.reduce((acc, r) => {
    const month = new Date(r.record_date).toLocaleDateString('en', { month: 'short' })
    if (!acc[month]) acc[month] = { month, income: 0, expenditure: 0 }
    if (r.record_type === 'income') acc[month].income += Number(r.amount)
    else acc[month].expenditure += Number(r.amount)
    return acc
  }, {} as Record<string, { month: string; income: number; expenditure: number }>)
  const monthlyChartData = Object.values(monthlyData)

  const categoryChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const crop = crops.find((c) => c.id === formData.crop_id)
      const { error } = await supabase.from('financial_records').insert({
        farm_id: crop?.farm_id || selectedFarm || '',
        crop_id: formData.crop_id || null,
        record_type: formData.record_type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        unit: formData.unit || null,
        description: formData.description || null,
        record_date: formData.record_date,
        payment_method: formData.payment_method || null,
      })
      if (error) throw error
      toast.success('Transaction added!')
      setShowForm(false)
      loadData()
    } catch (error: unknown) { toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`) }
  }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">Financial Center</h2>
          <p className="text-sm text-gray-500 mt-1">Complete farm P&L and financial tracking</p>
        </div>
        <div className="flex gap-2">
          <motion.button className="btn-secondary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Add Transaction
          </motion.button>
        </div>
      </div>

      <div className="flex gap-2">
        {farms.map((farm) => (
          <button key={farm.id} onClick={() => setSelectedFarm(farm.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedFarm === farm.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {farm.name}
          </button>
        ))}
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-3"><DollarSign className="w-5 h-5 text-green-500" /><span className="text-sm text-subtle">Total Income</span></div>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-3"><TrendingDown className="w-5 h-5 text-red-500" /><span className="text-sm text-subtle">Total Expenditure</span></div>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalExpenditure)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-primary" /><span className="text-sm text-subtle">Net Profit</span></div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>{formatCurrency(netProfit)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-3"><PieChart className="w-5 h-5 text-accent" /><span className="text-sm text-subtle">ROI</span></div>
          <p className="text-2xl font-bold text-accent mt-2">{roi}%</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" variants={cardVariants}>
          <h3 className="font-semibold text-dark mb-4">Expenditure Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6" variants={cardVariants}>
          <h3 className="font-semibold text-dark mb-4">Monthly Income vs Expenditure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
              <Legend />
              <Bar dataKey="income" fill="#1a7a4a" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenditure" fill="#e74c3c" radius={[4, 4, 0, 0]} name="Expenditure" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Comparison */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">Expense by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#9ca3af' }} width={100} />
            <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
            <Bar dataKey="amount" fill="#f39c12" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Per-Plot Financial Cards */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">Per-Plot Financial Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {farms.map((farm) => {
            const farmRecs = records.filter((r) => r.farm_id === farm.id)
            const fIncome = farmRecs.filter((r) => r.record_type === 'income').reduce((s, r) => s + Number(r.amount), 0)
            const fExpense = farmRecs.filter((r) => r.record_type === 'expenditure').reduce((s, r) => s + Number(r.amount), 0)
            const fProfit = fIncome - fExpense
            const fRoi = fExpense > 0 ? ((fProfit / fExpense) * 100).toFixed(1) : '0'

            return (
              <div key={farm.id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-dark">{farm.name}</h4>
                  <span className="text-xs text-gray-500">{farm.plot_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Income</p>
                    <p className="font-semibold text-green-600">{formatCurrency(fIncome)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expenditure</p>
                    <p className="font-semibold text-red-600">{formatCurrency(fExpense)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Profit</p>
                    <p className={`font-semibold ${fProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(fProfit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ROI</p>
                    <p className="font-semibold text-accent">{fRoi}%</p>
                  </div>
                </div>
                {/* Expense breakdown */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Expense Breakdown:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {['seeds', 'fertilizer', 'irrigation', 'spray', 'labor'].map((cat) => {
                      const catTotal = farmRecs.filter((r) => r.record_type === 'expenditure' && r.category === cat).reduce((s, r) => s + Number(r.amount), 0)
                      return (
                        <div key={cat}>
                          <p className="text-gray-400 capitalize">{cat}</p>
                          <p className="font-medium">{formatCurrency(catTotal)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {farmRecords.slice(0, 20).map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{formatDate(r.record_date)}</td>
                  <td className="py-3 px-4"><span className={`badge ${r.record_type === 'income' ? 'badge-green' : 'badge-red'}`}>{r.record_type}</span></td>
                  <td className="py-3 px-4 capitalize">{r.category}</td>
                  <td className="py-3 px-4 text-gray-600">{r.description || '—'}</td>
                  <td className={`py-3 px-4 font-semibold ${r.record_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {r.record_type === 'income' ? '+' : '-'}{formatCurrency(Number(r.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Projections */}
      <motion.div className="glass-card-dark p-6 text-white" variants={cardVariants}>
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-semibold">AI Financial Projections</h3></div>
        <div className="space-y-3">
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Based on current growth rates and market prices, projected end-of-season income is {formatCurrency(totalIncome * 1.8)}. Adding 2 more irrigation cycles could increase yield by 12%.</p>
            <p className="text-xs text-accent mt-2 font-medium">Confidence: 82%</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Your fertilizer expenditure is 15% higher than the regional average. Consider switching to organic alternatives for 20% cost savings.</p>
            <button className="mt-2 text-xs text-accent hover:text-amber-400 font-medium">View optimization →</button>
          </div>
        </div>
      </motion.div>

      {/* ======================================== */}
      {/* CATTLE FINANCIALS SECTION                */}
      {/* ======================================== */}
      <motion.div className="space-y-6" variants={containerVariants} initial="initial" animate="animate">
        <div className="flex items-center gap-3 mb-2">
          <Beef className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-dark">Cattle Financials</h2>
          {/* Month Selector */}
          <div className="flex gap-2 ml-4">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="select-field text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="select-field text-sm">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Cattle KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600"><Droplets className="w-5 h-5" /></div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-dark">₹{cattleFinancial.totalMilkIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Milk Income</p>
            </div>
          </motion.div>
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600"><Package className="w-5 h-5" /></div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-dark">₹{(cattleFinancial.totalFeedExpense + cattleFinancial.totalHealthExpense).toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Feed & Health Expenses</p>
            </div>
          </motion.div>
          <motion.div className="glass-card p-5" variants={cardVariants}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${cattleFinancial.netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className={`text-2xl font-bold ${cattleFinancial.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{cattleFinancial.netProfit.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Net Profit</p>
            </div>
          </motion.div>
        </div>

        {/* Milk Income Table */}
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark text-lg">Milk Production Income Log</h3>
            <motion.button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddMilk(true)}>
              <Plus className="w-4 h-4" /> Add Record
            </motion.button>
          </div>
          {milkRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No milk records this month</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Date', 'Tag ID', 'Morning (L)', 'Evening (L)', 'Total (L)', 'Price/L', 'Income (₹)', 'Action'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {milkRecords.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{m.tag_id || '--'}</td>
                      <td className="py-2 px-2">{m.morning_yield}</td>
                      <td className="py-2 px-2">{m.evening_yield}</td>
                      <td className="py-2 px-2 font-medium">{Number(m.total_yield || 0).toFixed(2)}</td>
                      <td className="py-2 px-2">₹{m.milk_price_per_litre}</td>
                      <td className="py-2 px-2 text-green-600 font-medium">₹{Number(m.total_income || 0).toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <button className="text-red-400 hover:text-red-500" onClick={() => handleDeleteMilk(m.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Monthly Total:</span>
            <span className="text-lg font-bold text-green-600">₹{cattleFinancial.totalMilkIncome.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Feed Expense Table */}
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark text-lg">Cattle Expense Log</h3>
            <motion.button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddFeed(true)}>
              <Plus className="w-4 h-4" /> Add Expense
            </motion.button>
          </div>
          {feedExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No feed expenses this month</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Date', 'Type', 'Item', 'Qty (Kg)', 'Rate', 'Total (₹)', 'Supplier', 'Action'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feedExpenses.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">{new Date(f.date).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{f.feed_type}</td>
                      <td className="py-2 px-2">{f.feed_type}</td>
                      <td className="py-2 px-2">{f.quantity_kg || '--'}</td>
                      <td className="py-2 px-2">₹{f.cost_per_kg || '--'}</td>
                      <td className="py-2 px-2 text-red-600 font-medium">₹{f.total_cost.toFixed(2)}</td>
                      <td className="py-2 px-2">{f.supplier || '--'}</td>
                      <td className="py-2 px-2">
                        <button className="text-red-400 hover:text-red-500" onClick={() => handleDeleteFeed(f.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Monthly Total:</span>
            <span className="text-lg font-bold text-red-600">₹{cattleFinancial.totalFeedExpense.toFixed(2)}</span>
          </div>
        </motion.div>
      </motion.div>

      {showForm && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="bg-white rounded-2xl w-full max-w-lg m-4 p-6 max-h-[90vh] overflow-y-auto" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-xl font-bold text-dark mb-6">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="select-field" value={formData.record_type} onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}>
                    <option value="income">Income</option>
                    <option value="expenditure">Expenditure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="select-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="labor">Labor</option>
                    <option value="spray">Spray</option>
                    <option value="harvest">Harvest</option>
                    <option value="sale">Sale</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" required className="input-field" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required className="input-field" value={formData.record_date} onChange={(e) => setFormData({ ...formData, record_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className="input-field" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Transaction details" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Transaction</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add Milk Record Modal */}
      {showAddMilk && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddMilk(false)}>
          <motion.div className="glass-card p-6 w-full max-w-md mx-4" initial={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Add Milk Record</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowAddMilk(false)}>×</button>
            </div>
            <form onSubmit={handleAddMilkRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Date</label>
                <input type="date" required value={milkForm.date} onChange={(e) => setMilkForm({ ...milkForm, date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Tag ID</label>
                <input type="text" value={milkForm.tag_id} onChange={(e) => setMilkForm({ ...milkForm, tag_id: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., A-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Morning (L)</label>
                  <input type="number" step="0.1" value={milkForm.morning_yield} onChange={(e) => setMilkForm({ ...milkForm, morning_yield: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Evening (L)</label>
                  <input type="number" step="0.1" value={milkForm.evening_yield} onChange={(e) => setMilkForm({ ...milkForm, evening_yield: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Price per Litre (₹)</label>
                <input type="number" value={milkForm.milk_price_per_litre} onChange={(e) => setMilkForm({ ...milkForm, milk_price_per_litre: parseFloat(e.target.value) || 35 })} className="input-field w-full px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5 font-medium">Add Record</button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add Feed Expense Modal */}
      {showAddFeed && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddFeed(false)}>
          <motion.div className="glass-card p-6 w-full max-w-md mx-4" initial={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Add Feed Expense</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowAddFeed(false)}>×</button>
            </div>
            <form onSubmit={handleAddFeedExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Date</label>
                <input type="date" required value={feedForm.date} onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Feed Type</label>
                <input type="text" required value={feedForm.feed_type} onChange={(e) => setFeedForm({ ...feedForm, feed_type: e.target.value })} className="input-field w-full px-3 py-2 text-sm" placeholder="e.g., Green Fodder" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Quantity (Kg)</label>
                  <input type="number" value={feedForm.quantity_kg} onChange={(e) => setFeedForm({ ...feedForm, quantity_kg: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Cost per Kg (₹)</label>
                  <input type="number" value={feedForm.cost_per_kg} onChange={(e) => setFeedForm({ ...feedForm, cost_per_kg: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Total Cost (₹)</label>
                <input type="number" required value={feedForm.total_cost} onChange={(e) => setFeedForm({ ...feedForm, total_cost: parseFloat(e.target.value) || 0 })} className="input-field w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Supplier</label>
                <input type="text" value={feedForm.supplier} onChange={(e) => setFeedForm({ ...feedForm, supplier: e.target.value })} className="input-field w-full px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5 font-medium">Add Expense</button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

