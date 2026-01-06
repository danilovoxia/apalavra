import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Share2, 
  Clock, 
  Book, 
  Users, 
  Smartphone, 
  Monitor,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Copy,
  Image,
  Trophy,
  Flame,
  Award
} from 'lucide-react';
import { useShareAnalytics, ShareStats } from '@/contexts/ShareAnalyticsContext';
import { useGamification, BADGE_DEFINITIONS } from '@/contexts/GamificationContext';

// Simple bar chart component
const SimpleBarChart: React.FC<{ 
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}> = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-600 truncate" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#06b6d4'
              }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-gray-700 text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple line chart component for hourly data
const HourlyChart: React.FC<{ data: Record<number, number> }> = ({ data }) => {
  const max = Math.max(...Object.values(data), 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="relative h-40">
      <div className="absolute inset-0 flex items-end justify-between gap-1">
        {hours.map(hour => (
          <div 
            key={hour}
            className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t transition-all duration-300 hover:from-cyan-600 hover:to-cyan-400"
            style={{ height: `${(data[hour] / max) * 100}%`, minHeight: data[hour] > 0 ? '4px' : '0' }}
            title={`${hour}h: ${data[hour]} compartilhamentos`}
          />
        ))}
      </div>
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
};

// Daily trend chart
const DailyTrendChart: React.FC<{ data: Record<string, number>; days: number }> = ({ data, days }) => {
  const sortedDays = Object.keys(data).sort();
  const recentDays = sortedDays.slice(-days);
  const max = Math.max(...recentDays.map(d => data[d] || 0), 1);
  
  if (recentDays.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400">
        Sem dados para exibir
      </div>
    );
  }
  
  return (
    <div className="relative h-32">
      <div className="absolute inset-0 flex items-end gap-1">
        {recentDays.map((day, index) => (
          <div 
            key={day}
            className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t transition-all duration-300 hover:from-purple-600 hover:to-purple-400"
            style={{ height: `${((data[day] || 0) / max) * 100}%`, minHeight: data[day] > 0 ? '4px' : '0' }}
            title={`${new Date(day).toLocaleDateString('pt-BR')}: ${data[day] || 0} compartilhamentos`}
          />
        ))}
      </div>
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
        <span>{recentDays[0] ? new Date(recentDays[0]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}</span>
        <span>{recentDays[recentDays.length - 1] ? new Date(recentDays[recentDays.length - 1]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}</span>
      </div>
    </div>
  );
};

// Pie chart component
const PieChart: React.FC<{ 
  data: { label: string; value: number; color: string }[];
}> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400">
        Sem dados
      </div>
    );
  }
  
  let currentAngle = 0;
  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: ((item.value / total) * 100).toFixed(1)
    };
    currentAngle += angle;
    return segment;
  });
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => {
            const startRad = (segment.startAngle * Math.PI) / 180;
            const endRad = (segment.endAngle * Math.PI) / 180;
            const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-600">{segment.label}</span>
            <span className="text-gray-400 ml-auto">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat card component
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { getStats, syncPending, isLoading } = useShareAnalytics();
  const [period, setPeriod] = useState<7 | 14 | 30 | 90>(30);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Safely try to use gamification context
  let gamificationStats = { totalShares: 0, currentStreak: 0, longestStreak: 0, unlockedBadges: [] as any[], impactScore: 0 };
  try {
    const gamification = useGamification();
    gamificationStats = gamification.stats;
  } catch (e) {
    // Gamification context not available
  }
  
  const stats: ShareStats = useMemo(() => {
    return getStats(period);
  }, [getStats, period, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Prepare channel data for pie chart
  const channelData = useMemo(() => [
    { label: 'WhatsApp', value: stats.sharesByChannel['whatsapp'] || 0, color: '#25D366' },
    { label: 'Copiar', value: stats.sharesByChannel['copy'] || 0, color: '#6366f1' },
    { label: 'Nativo', value: stats.sharesByChannel['native_share'] || 0, color: '#f59e0b' },
    { label: 'Download', value: stats.sharesByChannel['download'] || 0, color: '#ec4899' },
  ].filter(d => d.value > 0), [stats.sharesByChannel]);
  
  // Prepare device data for pie chart
  const deviceData = useMemo(() => [
    { label: 'Mobile', value: stats.sharesByDevice['mobile'] || 0, color: '#06b6d4' },
    { label: 'Desktop', value: stats.sharesByDevice['desktop'] || 0, color: '#8b5cf6' },
  ].filter(d => d.value > 0), [stats.sharesByDevice]);
  
  // Prepare top verses data
  const topVersesData = useMemo(() => 
    stats.topVerses.slice(0, 8).map(v => ({
      label: v.reference.length > 15 ? v.reference.substring(0, 15) + '...' : v.reference,
      value: v.count,
      color: '#06b6d4'
    }))
  , [stats.topVerses]);
  
  // Find peak hour
  const peakHour = useMemo(() => {
    let maxHour = 0;
    let maxCount = 0;
    Object.entries(stats.sharesByHour).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = parseInt(hour);
      }
    });
    return { hour: maxHour, count: maxCount };
  }, [stats.sharesByHour]);
  
  // Calculate share rate (shares per day)
  const shareRate = useMemo(() => {
    const daysWithData = Object.keys(stats.sharesByDay).length || 1;
    return (stats.totalShares / daysWithData).toFixed(1);
  }, [stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
          <span className="text-gray-600">Carregando analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-500" />
                  Analytics de Compartilhamento
                </h1>
                <p className="text-sm text-gray-500">
                  Métricas de crescimento viral
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {syncPending > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  {syncPending} pendentes
                </span>
              )}
              
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Period selector */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Período:</span>
          <div className="flex gap-1">
            {([7, 14, 30, 90] as const).map(days => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === days
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total de Compartilhamentos"
            value={stats.totalShares}
            icon={<Share2 className="w-5 h-5 text-white" />}
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            title="Taxa Diária"
            value={`${shareRate}/dia`}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="Média de compartilhamentos"
          />
          <StatCard
            title="Horário de Pico"
            value={`${peakHour.hour}h`}
            icon={<Clock className="w-5 h-5 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle={`${peakHour.count} compartilhamentos`}
          />
          <StatCard
            title="Usuários Únicos"
            value={stats.uniqueUsers}
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            subtitle="Que compartilharam"
          />
        </div>

        {/* Gamification Stats */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 shadow-sm border border-amber-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Gamificação
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600">Conquistas</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {gamificationStats.unlockedBadges.length}/{BADGE_DEFINITIONS.length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Sequência Atual</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {gamificationStats.currentStreak} dias
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Maior Sequência</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {gamificationStats.longestStreak} dias
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <span className="text-sm text-gray-600">Pontuação</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {gamificationStats.impactScore} pts
              </p>
            </div>
          </div>
          
          {/* Unlocked badges */}
          {gamificationStats.unlockedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-100">
              <p className="text-sm text-gray-600 mb-2">Conquistas desbloqueadas:</p>
              <div className="flex flex-wrap gap-2">
                {gamificationStats.unlockedBadges.map((badge: any) => (
                  <div 
                    key={badge.id}
                    className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-amber-200"
                    title={badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Charts row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Channel distribution */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-500" />
              Por Canal
            </h3>
            {channelData.length > 0 ? (
              <PieChart data={channelData} />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Sem dados de compartilhamento
              </div>
            )}
          </div>
          
          {/* Device distribution */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              Por Dispositivo
            </h3>
            {deviceData.length > 0 ? (
              <PieChart data={deviceData} />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Sem dados de dispositivo
              </div>
            )}
          </div>
        </div>
        
        {/* Charts row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* With/without image */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-cyan-500" />
              Com vs Sem Imagem
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Com card</span>
                  <span className="font-semibold text-cyan-600">{stats.sharesWithImage}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
                    style={{ 
                      width: `${stats.totalShares > 0 ? (stats.sharesWithImage / stats.totalShares) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Só texto</span>
                  <span className="font-semibold text-purple-600">{stats.sharesWithoutImage}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                    style={{ 
                      width: `${stats.totalShares > 0 ? (stats.sharesWithoutImage / stats.totalShares) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Hourly distribution */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              Por Hora do Dia
            </h3>
            <HourlyChart data={stats.sharesByHour} />
          </div>
        </div>
        
        {/* Daily trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            Tendência Diária
          </h3>
          <DailyTrendChart data={stats.sharesByDay} days={period} />
        </div>
        
        {/* Top verses */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Book className="w-4 h-4 text-cyan-500" />
            Versículos Mais Compartilhados
          </h3>
          {topVersesData.length > 0 ? (
            <SimpleBarChart data={topVersesData} />
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              Nenhum versículo compartilhado ainda
            </div>
          )}
        </div>
        
        {/* Info footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Os dados são armazenados localmente e sincronizados quando há conexão.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
