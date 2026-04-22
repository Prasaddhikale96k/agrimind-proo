'use client';

import { useState } from 'react';
import { LMLivestock } from '@/lib/livestock-management/lm.types';
import LMStatusBadge from './LMStatusBadge';
import { getAnimalEmoji, formatLMDate } from '@/lib/livestock-management/lm.helpers';
import { LM_ANIMAL_TYPES } from '@/lib/livestock-management/lm.constants';

interface Props {
  livestock: LMLivestock[];
  isLoading: boolean;
  onEdit: (animal: LMLivestock) => void;
  onDelete: (id: string) => void;
  onAddHealth: (animal: LMLivestock) => void;
  onAddMilk: (animal: LMLivestock) => void;
}

export default function LMHerdTable({
  livestock, isLoading, onEdit, onDelete, onAddHealth, onAddMilk
}: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = livestock.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
      || a.breed?.toLowerCase().includes(search.toLowerCase())
      || a.tag_number?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} 
              className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white 
      overflow-hidden shadow-sm">

      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 
              text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, breed, tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border 
                border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 
              rounded-xl text-gray-700 text-sm focus:outline-none"
          >
            <option value="all">All Types</option>
            {LM_ANIMAL_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 
              rounded-xl text-gray-700 text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="sick">Sick</option>
            <option value="pregnant">Pregnant</option>
            <option value="sold">Sold</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>

        <p className="text-gray-500 text-xs mt-3">
          Showing {filtered.length} of {livestock.length} animals
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🐾</div>
          <p className="font-medium">No livestock found</p>
          <p className="text-xs mt-1">
            {livestock.length === 0 
              ? 'Add your first animal to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Animal', 'Type / Breed', 'Health', 'Status',
                  'Milk Cap.', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs 
                    font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(animal => (
                <tr key={animal.id}
                  className="hover:bg-gray-50 transition-colors group">

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 
                        border border-gray-200 flex items-center 
                        justify-center text-xl flex-shrink-0">
                        {getAnimalEmoji(animal.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {animal.name}
                        </div>
                        {animal.tag_number && (
                          <div className="text-gray-500 text-xs">
                            #{animal.tag_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-gray-900 text-sm capitalize">
                      {animal.type}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {animal.breed || 'Unknown breed'}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <LMStatusBadge 
                      variant="health" 
                      status={animal.health_status} 
                      size="sm" 
                    />
                  </td>

                  <td className="px-4 py-4">
                    <LMStatusBadge 
                      variant="status" 
                      status={animal.status} 
                      size="sm" 
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-cyan-700 font-semibold text-sm">
                      {animal.milk_capacity 
                        ? `${animal.milk_capacity}L` 
                        : '—'
                      }
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-gray-400 text-xs">
                      {formatLMDate(animal.updated_at)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 
                      opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onAddMilk(animal)}
                        title="Add Milk Entry"
                        className="p-1.5 rounded-lg bg-cyan-50 
                          hover:bg-cyan-100 text-cyan-700 text-sm"
                      >
                        🥛
                      </button>
                      <button
                        onClick={() => onAddHealth(animal)}
                        title="Add Health Record"
                        className="p-1.5 rounded-lg bg-emerald-50 
                          hover:bg-emerald-100 text-emerald-700 text-sm"
                      >
                        🏥
                      </button>
                      <button
                        onClick={() => onEdit(animal)}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-blue-50 
                          hover:bg-blue-100 text-blue-700 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(
                            `Delete ${animal.name}? This cannot be undone.`
                          )) onDelete(animal.id);
                        }}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-red-50 
                          hover:bg-red-100 text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}