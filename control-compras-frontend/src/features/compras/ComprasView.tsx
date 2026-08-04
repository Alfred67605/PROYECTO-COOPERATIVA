import { useState } from 'react';
import { ComprasHistorial } from './ComprasHistorial';
import { ComprasAnalisisCategorias } from './ComprasAnalisisCategorias';
import { ShoppingCart, PieChart } from 'lucide-react';

export const ComprasView = () => {
  const [activeTab, setActiveTab] = useState<'historial' | 'analisis'>('historial');

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-obsidian-900/60 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-white shadow-glow-copper'
              : 'text-mining-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart size={16} />
          <span>Historial de Compras</span>
        </button>

        <button
          onClick={() => setActiveTab('analisis')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analisis'
              ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-white shadow-glow-copper'
              : 'text-mining-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <PieChart size={16} />
          <span>Análisis por Categorías y Materiales</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'historial' ? <ComprasHistorial /> : <ComprasAnalisisCategorias />}
    </div>
  );
};
