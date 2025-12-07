import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, FileText, Eye, Clock, MapPin, Monitor, LogOut, Calendar, Mail, Phone, User, Search, Download, Video, Upload, Trash2, Link as LinkIcon, Check, FileDown, FileUp, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import FloatingIcons from '../components/FloatingIcons';
import AnalyticsCard, { ChartType, SortOrder } from '../components/AnalyticsCard';
import EChartPie3D from '../components/EChartPie3D';
import EChartBar from '../components/EChartBar';
import EChartLine from '../components/EChartLine';
import ChartConfigModal from '../components/ChartConfigModal';
import { ChartConfigProvider } from '../contexts/ChartConfigContext';
import { adminService } from '../services/supabaseAdmin';

interface Stats {
  totalVisitors: number;
  totalEvents: number;
  totalRegistrations: number;
  totalPageViews: number;
  visitorsLast24h: number;
}

interface Visitor {
  id: number;
  visitor_id: string;
  first_visit: string;
  last_visit: string;
  ip_address: string;
  country: string;
  city: string;
  region: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  landing_page: string;
  total_visits: number;
  total_time_spent: number;
}

interface Registration {
  id: number;
  visitor_id: string;
  email: string;
  name: string;
  phone: string;
  registered_at: string;
  ip_address: string;
  city: string;
  country: string;
  device_type: string;
  registration_data: any;
}

interface VideoConfig {
  id: number;
  video_url: string;
  video_type: string;
  video_path?: string;
  button_delay_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  original_filename?: string;
  file_size?: number;
}

interface DemographicsData {
  ageDistribution: Array<{ age: string; count: number }>;
  genderDistribution: Array<{ gender: string; count: number }>;
  occupationDistribution: Array<{ occupation: string; count: number }>;
  educationDistribution: Array<{ education: string; count: number }>;
  topInterests: Array<{ interest: string; count: number }>;
  averageConfidence: {
    age_range: number;
    gender: number;
    occupation: number;
    education_level: number;
    interests: number;
  };
  totalProfiles: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'registrations' | 'demographics' | 'video'>('overview');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [currentVideo, setCurrentVideo] = useState<VideoConfig | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState('youtube');
  const [buttonDelay, setButtonDelay] = useState(90);
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoMessage, setVideoMessage] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'youtube' | 'upload' | 'google_drive' | 'vimeo'>('youtube');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const [chartPreferences, setChartPreferences] = useState<Record<string, { type: ChartType; sortOrder: SortOrder }>>({
    devices: { type: 'pie3d', sortOrder: 'desc' },
    browsers: { type: 'pie3d', sortOrder: 'desc' },
    os: { type: 'pie3d', sortOrder: 'desc' },
    registrationDevices: { type: 'pie3d', sortOrder: 'desc' },
    countries: { type: 'bar', sortOrder: 'desc' },
    cities: { type: 'bar', sortOrder: 'desc' },
    age: { type: 'pie3d', sortOrder: 'desc' },
    gender: { type: 'pie3d', sortOrder: 'desc' },
    occupation: { type: 'bar', sortOrder: 'desc' },
    education: { type: 'bar', sortOrder: 'desc' },
  });

  const updateChartPreference = (chartId: string, update: Partial<{ type: ChartType; sortOrder: SortOrder }>) => {
    setChartPreferences(prev => ({
      ...prev,
      [chartId]: { ...prev[chartId], ...update }
    }));
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadData(true);
    loadVideo();
    const interval = setInterval(() => loadData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    if (!adminService.isAuthenticated()) {
      navigate('/admin');
    }
  };

  const loadData = async (isInitial: boolean = false) => {
    if (!adminService.isAuthenticated()) {
      navigate('/admin');
      return;
    }

    if (isInitial) {
      setInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const [statsData, visitorsData, registrationsData, demographicsData] = await Promise.all([
        adminService.getStats(),
        adminService.getVisitors(100),
        adminService.getRegistrations(100),
        adminService.getDemographics()
      ]);

      setStats(statsData);
      setVisitors(visitorsData.visitors);
      setRegistrations(registrationsData.registrations);
      setDemographics(demographicsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const loadVideo = async () => {
    try {
      const data = await adminService.getVideoConfig();
      
      if (data.video) {
        setCurrentVideo(data.video);
        setVideoUrl(data.video.video_url);
        setVideoType(data.video.video_type);
        setButtonDelay(data.video.button_delay_seconds);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeo:', error);
    }
  };

  const handleSaveVideo = async () => {
    if (!videoUrl.trim()) {
      setVideoMessage('Por favor, insira a URL do vídeo');
      return;
    }

    setVideoSaving(true);
    setVideoMessage('');

    const effectiveVideoType = videoInputMode === 'google_drive' ? 'google_drive' : videoInputMode === 'vimeo' ? 'vimeo' : videoType;

    try {
      const result = await adminService.saveVideoConfig({
        video_url: videoUrl,
        video_type: effectiveVideoType,
        button_delay_seconds: buttonDelay
      });

      if (result.success) {
        setVideoMessage('Vídeo salvo com sucesso!');
        setCurrentVideo(result.video);
        setTimeout(() => setVideoMessage(''), 3000);
      } else {
        setVideoMessage('Erro ao salvar vídeo');
      }
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      setVideoMessage('Erro ao salvar vídeo');
    } finally {
      setVideoSaving(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!currentVideo || !confirm('Tem certeza que deseja deletar este vídeo?')) {
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('video_config')
        .update({ is_active: false })
        .eq('id', currentVideo.id);

      setCurrentVideo(null);
      setVideoUrl('');
      setVideoType('youtube');
      setButtonDelay(90);
      setSelectedFile(null);
      setVideoMessage('Vídeo deletado com sucesso!');
      setTimeout(() => setVideoMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      setVideoMessage('Erro ao deletar vídeo');
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024 * 1024;
      if (file.size > maxSize) {
        setVideoMessage('Arquivo muito grande. Máximo permitido: 2GB');
        return;
      }
      
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
      if (!allowedTypes.includes(file.type)) {
        setVideoMessage('Formato não suportado. Use MP4, WebM ou MOV');
        return;
      }
      
      setSelectedFile(file);
      setVideoMessage('');
    }
  };

  const handleUploadVideo = async () => {
    setVideoMessage('Upload de vídeo local não disponível. Use YouTube, Vimeo ou Google Drive.');
  };

  const viewVisitorDetails = async (visitorId: string) => {
    try {
      const data = await adminService.getVisitorDetails(visitorId);
      setSelectedVisitor(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    [...visitors, ...registrations].forEach(item => {
      if (item.country) locations.add(item.country);
    });
    return Array.from(locations).sort();
  }, [visitors, registrations]);

  const getUniqueDevices = useMemo(() => {
    const devices = new Set<string>();
    [...visitors, ...registrations].forEach(item => {
      if (item.device_type) devices.add(item.device_type);
    });
    return Array.from(devices).sort();
  }, [visitors, registrations]);

  const filterByDate = (dateString: string) => {
    const itemDate = new Date(dateString);
    const now = new Date();
    
    switch(dateFilter) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      case 'all':
      default:
        return true;
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(visitor => {
      const matchesDate = filterByDate(visitor.last_visit);
      const matchesLocation = locationFilter === 'all' || visitor.country === locationFilter;
      const matchesDevice = deviceFilter === 'all' || visitor.device_type === deviceFilter;
      const matchesSearch = searchTerm === '' || 
        visitor.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDate && matchesLocation && matchesDevice && matchesSearch;
    });
  }, [visitors, searchTerm, dateFilter, locationFilter, deviceFilter]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesDate = filterByDate(reg.registered_at);
      const matchesLocation = locationFilter === 'all' || reg.country === locationFilter;
      const matchesDevice = deviceFilter === 'all' || reg.device_type === deviceFilter;
      const matchesSearch = searchTerm === '' || 
        reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDate && matchesLocation && matchesDevice && matchesSearch;
    });
  }, [registrations, searchTerm, dateFilter, locationFilter, deviceFilter]);

  // Dados para gráficos - baseados nos dados filtrados
  const deviceChartData = useMemo(() => {
    const deviceCount: { [key: string]: number } = {};
    filteredVisitors.forEach(visitor => {
      const device = visitor.device_type || 'Desconhecido';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });
    return Object.entries(deviceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisitors]);

  const browserChartData = useMemo(() => {
    const browserCount: { [key: string]: number } = {};
    filteredVisitors.forEach(visitor => {
      const browser = visitor.browser || 'Desconhecido';
      browserCount[browser] = (browserCount[browser] || 0) + 1;
    });
    return Object.entries(browserCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisitors]);

  const countryChartData = useMemo(() => {
    const countryCount: { [key: string]: number } = {};
    filteredVisitors.forEach(visitor => {
      const country = visitor.country || 'Desconhecido';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    return Object.entries(countryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 países
  }, [filteredVisitors]);

  const osChartData = useMemo(() => {
    const osCount: { [key: string]: number } = {};
    filteredVisitors.forEach(visitor => {
      const os = visitor.os || 'Desconhecido';
      osCount[os] = (osCount[os] || 0) + 1;
    });
    return Object.entries(osCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisitors]);

  const cityChartData = useMemo(() => {
    const cityCount: { [key: string]: number } = {};
    filteredVisitors.forEach(visitor => {
      const city = visitor.city || 'Desconhecido';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    return Object.entries(cityCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 cidades
  }, [filteredVisitors]);

  const registrationDeviceData = useMemo(() => {
    const deviceCount: { [key: string]: number } = {};
    filteredRegistrations.forEach(reg => {
      const device = reg.device_type || 'Desconhecido';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });
    return Object.entries(deviceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRegistrations]);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRegistrations = () => {
    const exportData = filteredRegistrations.map(reg => ({
      Nome: reg.name,
      Email: reg.email,
      Telefone: reg.phone,
      Cidade: reg.city,
      País: reg.country,
      Dispositivo: reg.device_type,
      'Data Cadastro': formatDate(reg.registered_at)
    }));
    exportToCSV(exportData, 'cadastros');
  };

  const handleExportVisitors = () => {
    const exportData = filteredVisitors.map(visitor => ({
      Cidade: visitor.city,
      Região: visitor.region,
      País: visitor.country,
      Dispositivo: visitor.device_type,
      Navegador: visitor.browser,
      'Sistema Operacional': visitor.os,
      'Total Visitas': visitor.total_visits,
      'Última Visita': formatDate(visitor.last_visit)
    }));
    exportToCSV(exportData, 'visitantes');
  };

  const handleExportToWord = async () => {
    alert('Exportação para Word não disponível na versão atual. Use a exportação CSV.');
  };

  const handleImportWord = async (event: React.ChangeEvent<HTMLInputElement>) => {
    alert('Importação de Word não disponível na versão atual.');
    event.target.value = '';
  };

  const translateEventType = (eventType: string, eventData: any) => {
    switch (eventType) {
      case 'click':
        if (eventData?.text) {
          return `Clicou em "${eventData.text.substring(0, 50)}"`;
        }
        return 'Clicou na página';
      case 'scroll':
        return `Rolou a página até ${eventData?.depth || 0}%`;
      case 'visibility_change':
        return eventData?.hidden ? 'Saiu da aba' : 'Voltou para a aba';
      default:
        return eventType;
    }
  };

  const getPageName = (url: string) => {
    if (!url) return 'Página';
    if (url.includes('/registration') || url.includes('registro')) return 'Página de Cadastro';
    if (url.includes('/confirmation') || url.includes('confirmacao')) return 'Página de Confirmação';
    return 'Página Inicial';
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"></div>
      
      <FloatingIcons />

      {/* Header */}
      <div className="relative border-b border-pink-500/20 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-purple-300">Fórmula Engajamento - Dados dos Clientes</p>
                {isRefreshing && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                    <span>Atualizando...</span>
                  </div>
                )}
                {!isRefreshing && (
                  <div className="text-purple-400/60 text-xs">
                    Atualizado às {lastUpdate.toLocaleTimeString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/20"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total de Visitantes</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalVisitors}</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Hoje</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.visitorsLast24h}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Interações</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalEvents}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm font-medium">Cadastros</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalRegistrations}</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <FileText className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Páginas Vistas</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalPageViews}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Eye className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Busca e Filtros */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Barra de Busca */}
            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Filtro por Data */}
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos os períodos</option>
                  <option value="today" className="bg-gray-900">Hoje</option>
                  <option value="week" className="bg-gray-900">Últimos 7 dias</option>
                  <option value="month" className="bg-gray-900">Últimos 30 dias</option>
                </select>
              </div>
            </div>

            {/* Filtro por Localização */}
            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todas as localizações</option>
                  {getUniqueLocations.map(location => (
                    <option key={location} value={location} className="bg-gray-900">{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro por Dispositivo */}
            <div>
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
                <select
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos os dispositivos</option>
                  {getUniqueDevices.map(device => (
                    <option key={device} value={device} className="bg-gray-900">{device}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informação de resultados filtrados */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-purple-300 text-sm">
              {activeTab === 'visitors' && (
                <span>Mostrando <span className="text-pink-400 font-bold">{filteredVisitors.length}</span> de {visitors.length} visitantes</span>
              )}
              {activeTab === 'registrations' && (
                <span>Mostrando <span className="text-pink-400 font-bold">{filteredRegistrations.length}</span> de {registrations.length} cadastros</span>
              )}
            </div>
            
            {/* Botões de Exportação e Importação */}
            <div className="flex flex-wrap gap-3">
              {activeTab === 'visitors' && (
                <button
                  onClick={handleExportVisitors}
                  disabled={filteredVisitors.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              )}
              {activeTab === 'registrations' && (
                <>
                  <button
                    onClick={handleExportRegistrations}
                    disabled={filteredRegistrations.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleExportToWord}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    <FileDown className="w-4 h-4" />
                    Exportar Word
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/20 cursor-pointer">
                    <FileUp className="w-4 h-4" />
                    Importar Word
                    <input
                      type="file"
                      accept=".docx"
                      onChange={handleImportWord}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'visitors', label: 'Visitantes', icon: Users },
            { id: 'registrations', label: 'Cadastros', icon: FileText },
            { id: 'demographics', label: 'Demografia', icon: User },
            { id: 'video', label: 'Vídeo', icon: Video }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'video' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Video className="w-7 h-7 text-pink-400" />
              Gerenciamento de Vídeo da Landing Page
            </h2>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Configuração do Vídeo</h3>
                
                <div className="flex gap-2 mb-6 flex-wrap">
                  <button
                    onClick={() => setVideoInputMode('youtube')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium transition-all ${
                      videoInputMode === 'youtube'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    YouTube
                  </button>
                  <button
                    onClick={() => setVideoInputMode('vimeo')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium transition-all ${
                      videoInputMode === 'vimeo'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Vimeo
                  </button>
                  <button
                    onClick={() => setVideoInputMode('google_drive')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium transition-all ${
                      videoInputMode === 'google_drive'
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                        : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Drive
                  </button>
                  <button
                    onClick={() => setVideoInputMode('upload')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium transition-all ${
                      videoInputMode === 'upload'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-purple-500/20'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>

                <div className="space-y-4">
                  {videoInputMode === 'youtube' ? (
                    <>
                      <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                          <LinkIcon className="w-4 h-4 inline mr-2" />
                          URL do Vídeo
                        </label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                        <p className="text-purple-400 text-sm mt-2">
                          Cole a URL completa do YouTube
                        </p>
                      </div>

                      <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                          Tipo de Vídeo
                        </label>
                        <select
                          value={videoType}
                          onChange={(e) => setVideoType(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="youtube" className="bg-gray-900">YouTube</option>
                          <option value="vimeo" className="bg-gray-900">Vimeo</option>
                          <option value="direct" className="bg-gray-900">Link Direto (MP4)</option>
                        </select>
                      </div>
                    </>
                  ) : videoInputMode === 'vimeo' ? (
                    <>
                      <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                          <LinkIcon className="w-4 h-4 inline mr-2" />
                          Link do Vimeo
                        </label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://vimeo.com/123456789"
                          className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                        <p className="text-purple-400 text-sm mt-2">
                          Cole o link do vídeo do Vimeo. O vídeo iniciará automaticamente com autoplay.
                        </p>
                      </div>
                    </>
                  ) : videoInputMode === 'google_drive' ? (
                    <>
                      <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                          <LinkIcon className="w-4 h-4 inline mr-2" />
                          Link do Google Drive
                        </label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                        <p className="text-purple-400 text-sm mt-2">
                          Cole o link de compartilhamento do Google Drive. Certifique-se de que o vídeo está com permissão "Qualquer pessoa com o link".
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-purple-300 mb-2 font-medium">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Arquivo de Vídeo
                      </label>
                      <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center hover:border-pink-500/50 transition-all">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                          onChange={handleVideoFileSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                          {selectedFile ? (
                            <div className="space-y-2">
                              <Video className="w-12 h-12 text-pink-400 mx-auto" />
                              <p className="text-white font-medium">{selectedFile.name}</p>
                              <p className="text-purple-400 text-sm">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-purple-300 text-xs">Clique para trocar o arquivo</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 text-purple-400 mx-auto" />
                              <p className="text-purple-300">Clique para selecionar um vídeo</p>
                              <p className="text-purple-400 text-sm">MP4, WebM ou MOV (máx. 500MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-purple-300 mb-1">
                            <span>Enviando...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <p className="text-purple-400 text-sm mt-3">
                        O vídeo será salvo diretamente nos arquivos do app e estará disponível no deploy
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-purple-300 mb-2 font-medium">
                      Tempo para Mostrar Botão (segundos)
                    </label>
                    <input
                      type="number"
                      value={buttonDelay}
                      onChange={(e) => setButtonDelay(parseInt(e.target.value) || 90)}
                      min="0"
                      max="600"
                      className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                    <p className="text-purple-400 text-sm mt-2">
                      O botão de compra aparecerá após este tempo (padrão: 90 segundos)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  {videoInputMode === 'youtube' || videoInputMode === 'google_drive' || videoInputMode === 'vimeo' ? (
                    <button
                      onClick={handleSaveVideo}
                      disabled={videoSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {videoSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Salvar URL
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleUploadVideo}
                      disabled={videoSaving || !selectedFile}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {videoSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Enviando... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Enviar Vídeo
                        </>
                      )}
                    </button>
                  )}

                  {currentVideo && (
                    <button
                      onClick={handleDeleteVideo}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-red-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                      Deletar
                    </button>
                  )}
                </div>

                {videoMessage && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    videoMessage.includes('sucesso') 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {videoMessage.includes('sucesso') && <Check className="w-5 h-5" />}
                      <p className="font-medium">{videoMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              {currentVideo && (
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Vídeo Atual</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-medium min-w-[120px]">
                        {currentVideo.video_type === 'local' ? 'Arquivo:' : 'URL:'}
                      </span>
                      <span className="text-white break-all">
                        {currentVideo.video_type === 'local' 
                          ? (currentVideo.original_filename || currentVideo.video_url)
                          : currentVideo.video_url}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-medium min-w-[120px]">Tipo:</span>
                      <span className="text-white">
                        {currentVideo.video_type === 'local' ? 'Vídeo Local (Upload)' : currentVideo.video_type}
                      </span>
                    </div>
                    {currentVideo.file_size && (
                      <div className="flex items-start gap-3">
                        <span className="text-purple-400 font-medium min-w-[120px]">Tamanho:</span>
                        <span className="text-white">{(currentVideo.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-medium min-w-[120px]">Delay do Botão:</span>
                      <span className="text-white">{currentVideo.button_delay_seconds} segundos</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-medium min-w-[120px]">Status:</span>
                      <span className={`font-semibold ${currentVideo.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {currentVideo.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  
                  {currentVideo.video_type === 'local' && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Este vídeo está salvo nos arquivos do app e será incluído no deploy da Vercel
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">ℹ️ Informações Importantes</h3>
                <ul className="space-y-2 text-purple-300 text-sm">
                  <li>• O vídeo aparecerá na página inicial (Landing Page) do site</li>
                  <li>• <strong className="text-pink-300">Upload de Arquivo:</strong> O vídeo é salvo diretamente no app e incluído no deploy</li>
                  <li>• <strong className="text-pink-300">URL do YouTube:</strong> O player será customizado sem controles de navegação</li>
                  <li>• O botão de compra só aparecerá após o tempo configurado</li>
                  <li>• Apenas um vídeo pode estar ativo por vez</li>
                  <li>• Formatos suportados para upload: MP4, WebM, MOV (máx. 500MB)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <>
              {/* Header com estatísticas */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <User className="w-7 h-7 text-pink-400" />
                  Análise Demográfica Passiva
                </h2>
                <p className="text-purple-300 mb-6">
                  Dados coletados automaticamente através de análise comportamental, fingerprinting e geo-IP. Total de {demographics?.totalProfiles || 0} perfis analisados.
                </p>
                  
                {/* Cards de confiança */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Faixa Etária', value: demographics?.averageConfidence?.age_range || 0, key: 'age_range' },
                    { label: 'Gênero', value: demographics?.averageConfidence?.gender || 0, key: 'gender' },
                    { label: 'Ocupação', value: demographics?.averageConfidence?.occupation || 0, key: 'occupation' },
                    { label: 'Educação', value: demographics?.averageConfidence?.education_level || 0, key: 'education' },
                    { label: 'Interesses', value: demographics?.averageConfidence?.interests || 0, key: 'interests' }
                  ].map(item => {
                    const percentage = Math.round(item.value * 100);
                    const level = percentage >= 70 ? 'Alta' : percentage >= 40 ? 'Média' : 'Baixa';
                    const color = percentage >= 70 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-orange-400';
                    
                    return (
                      <div key={item.key} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                        <p className="text-purple-300 text-xs mb-1">{item.label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{percentage}%</p>
                        <p className="text-purple-400 text-xs mt-1">Confiança: {level}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

                {/* Gráficos de Faixa Etária e Gênero */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsCard 
                    title="Distribuição de Faixa Etária" 
                    subtitle={`${(demographics?.ageDistribution || []).reduce((sum, item) => sum + item.count, 0)} visitantes analisados`}
                    icon={<Users className="w-5 h-5" />}
                    accentColor="purple"
                    chartType={chartPreferences.age.type}
                    sortOrder={chartPreferences.age.sortOrder}
                    onChartTypeChange={(type) => updateChartPreference('age', { type })}
                    onSortOrderChange={(sortOrder) => updateChartPreference('age', { sortOrder })}
                  >
                    {chartPreferences.age.type === 'pie3d' && (
                      <EChartPie3D
                        data={(demographics?.ageDistribution || []).map(item => ({
                          name: item.age,
                          value: item.count
                        }))}
                        chartId="age-distribution"
                        sortOrder={chartPreferences.age.sortOrder}
                      />
                    )}
                    {chartPreferences.age.type === 'bar3d' && (
                      <EChartBar
                        data={(demographics?.ageDistribution || []).map(item => ({
                          name: item.age,
                          value: item.count
                        }))}
                        chartId="age-distribution"
                        sortOrder={chartPreferences.age.sortOrder}
                      />
                    )}
                    {chartPreferences.age.type === 'line' && (
                      <EChartLine
                        data={(demographics?.ageDistribution || []).map(item => ({
                          name: item.age,
                          value: item.count
                        }))}
                        chartId="age-distribution"
                        sortOrder={chartPreferences.age.sortOrder}
                      />
                    )}
                  </AnalyticsCard>

                  <AnalyticsCard 
                    title="Distribuição de Gênero" 
                    subtitle={`${(demographics?.genderDistribution || []).reduce((sum, item) => sum + item.count, 0)} visitantes analisados`}
                    icon={<Users className="w-5 h-5" />}
                    accentColor="pink"
                    chartType={chartPreferences.gender.type}
                    sortOrder={chartPreferences.gender.sortOrder}
                    onChartTypeChange={(type) => updateChartPreference('gender', { type })}
                    onSortOrderChange={(sortOrder) => updateChartPreference('gender', { sortOrder })}
                  >
                    {chartPreferences.gender.type === 'pie3d' && (
                      <EChartPie3D
                        data={(demographics?.genderDistribution || []).map(item => ({
                          name: item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Feminino' : item.gender,
                          value: item.count
                        }))}
                        chartId="gender-distribution"
                        sortOrder={chartPreferences.gender.sortOrder}
                      />
                    )}
                    {chartPreferences.gender.type === 'bar3d' && (
                      <EChartBar
                        data={(demographics?.genderDistribution || []).map(item => ({
                          name: item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Feminino' : item.gender,
                          value: item.count
                        }))}
                        chartId="gender-distribution"
                        sortOrder={chartPreferences.gender.sortOrder}
                      />
                    )}
                    {chartPreferences.gender.type === 'line' && (
                      <EChartLine
                        data={(demographics?.genderDistribution || []).map(item => ({
                          name: item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Feminino' : item.gender,
                          value: item.count
                        }))}
                        chartId="gender-distribution"
                        sortOrder={chartPreferences.gender.sortOrder}
                      />
                    )}
                  </AnalyticsCard>
                </div>

                {/* Gráficos de Ocupação e Educação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsCard 
                    title="Distribuição de Ocupação" 
                    subtitle={`Top ${(demographics?.occupationDistribution || []).length} ocupações identificadas`}
                    icon={<Activity className="w-5 h-5" />}
                    accentColor="blue"
                    chartType={chartPreferences.occupation.type}
                    sortOrder={chartPreferences.occupation.sortOrder}
                    onChartTypeChange={(type) => updateChartPreference('occupation', { type })}
                    onSortOrderChange={(sortOrder) => updateChartPreference('occupation', { sortOrder })}
                  >
                    {chartPreferences.occupation.type === 'pie3d' && (
                      <EChartPie3D
                        data={(demographics?.occupationDistribution || []).slice(0, 8).map(item => ({
                          name: item.occupation,
                          value: item.count
                        }))}
                        chartId="occupation-distribution"
                        sortOrder={chartPreferences.occupation.sortOrder}
                      />
                    )}
                    {chartPreferences.occupation.type === 'bar' && (
                      <EChartBar
                        data={(demographics?.occupationDistribution || []).slice(0, 8).map(item => ({
                          name: item.occupation,
                          value: item.count
                        }))}
                        chartId="occupation-distribution"
                        sortOrder={chartPreferences.occupation.sortOrder}
                      />
                    )}
                    {chartPreferences.occupation.type === 'bar3d' && (
                      <EChartBar
                        data={(demographics?.occupationDistribution || []).slice(0, 8).map(item => ({
                          name: item.occupation,
                          value: item.count
                        }))}
                        chartId="occupation-distribution"
                        sortOrder={chartPreferences.occupation.sortOrder}
                      />
                    )}
                    {chartPreferences.occupation.type === 'line' && (
                      <EChartLine
                        data={(demographics?.occupationDistribution || []).slice(0, 8).map(item => ({
                          name: item.occupation,
                          value: item.count
                        }))}
                        chartId="occupation-distribution"
                        sortOrder={chartPreferences.occupation.sortOrder}
                      />
                    )}
                  </AnalyticsCard>

                  <AnalyticsCard 
                    title="Nível de Educação" 
                    subtitle={`${(demographics?.educationDistribution || []).reduce((sum, item) => sum + item.count, 0)} visitantes analisados`}
                    icon={<Activity className="w-5 h-5" />}
                    accentColor="green"
                    chartType={chartPreferences.education.type}
                    sortOrder={chartPreferences.education.sortOrder}
                    onChartTypeChange={(type) => updateChartPreference('education', { type })}
                    onSortOrderChange={(sortOrder) => updateChartPreference('education', { sortOrder })}
                  >
                    {chartPreferences.education.type === 'pie3d' && (
                      <EChartPie3D
                        data={(demographics?.educationDistribution || []).map(item => ({
                          name: item.education,
                          value: item.count
                        }))}
                        chartId="education-distribution"
                        sortOrder={chartPreferences.education.sortOrder}
                      />
                    )}
                    {chartPreferences.education.type === 'bar' && (
                      <EChartBar
                        data={(demographics?.educationDistribution || []).map(item => ({
                          name: item.education,
                          value: item.count
                        }))}
                        chartId="education-distribution"
                        sortOrder={chartPreferences.education.sortOrder}
                      />
                    )}
                    {chartPreferences.education.type === 'bar3d' && (
                      <EChartBar
                        data={(demographics?.educationDistribution || []).map(item => ({
                          name: item.education,
                          value: item.count
                        }))}
                        chartId="education-distribution"
                        sortOrder={chartPreferences.education.sortOrder}
                      />
                    )}
                    {chartPreferences.education.type === 'line' && (
                      <EChartLine
                        data={(demographics?.educationDistribution || []).map(item => ({
                          name: item.education,
                          value: item.count
                        }))}
                        chartId="education-distribution"
                        sortOrder={chartPreferences.education.sortOrder}
                      />
                    )}
                  </AnalyticsCard>
                </div>

                {/* Top Interesses */}
                {(demographics?.topInterests || []).length > 0 && (
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                      Top 10 Interesses Identificados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {(demographics?.topInterests || []).map((item, index) => (
                        <div 
                          key={index}
                          className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20 text-center"
                        >
                          <p className="text-white font-semibold mb-1">{item.interest}</p>
                          <p className="text-pink-400 text-2xl font-bold">{item.count}</p>
                          <p className="text-purple-300 text-xs mt-1">visitantes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nota sobre privacidade */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    🔒 Privacidade e LGPD
                  </h3>
                  <ul className="space-y-2 text-purple-300 text-sm">
                    <li>• Todos os dados são coletados de forma passiva e anônima</li>
                    <li>• Sistema respeita automaticamente o Do Not Track (DNT) do navegador</li>
                    <li>• Nenhum dado pessoal identificável é armazenado sem consentimento</li>
                    <li>• Inferências são baseadas em padrões comportamentais e sinais técnicos</li>
                    <li>• Scores de confiança indicam a precisão das análises automáticas</li>
                  </ul>
                </div>
              </>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Lista de Visitantes</h2>
            <div className="space-y-4">
              {filteredVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-6 hover:border-pink-500/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <MapPin className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {visitor.city}, {visitor.country}
                          </p>
                          <p className="text-purple-300 text-sm">{visitor.region}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Dispositivo</p>
                      </div>
                      <p className="text-white font-medium">{visitor.device_type}</p>
                      <p className="text-purple-300 text-sm">{visitor.browser}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Última Visita</p>
                      </div>
                      <p className="text-white font-medium">{formatDate(visitor.last_visit)}</p>
                      <p className="text-purple-300 text-sm">{visitor.total_visits} visitas</p>
                    </div>
                  </div>

                  <button
                    onClick={() => viewVisitorDetails(visitor.visitor_id)}
                    className="mt-4 w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 border border-pink-500/30"
                  >
                    Ver Todos os Detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Pessoas Cadastradas</h2>
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-pink-500/20 rounded-xl">
                          <User className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl">{reg.name}</p>
                          <p className="text-purple-300 text-sm">{formatDate(reg.registered_at)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <p className="text-white break-all">{reg.email}</p>
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-purple-400" />
                            <p className="text-white">{reg.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm font-medium">Localização</p>
                      </div>
                      <p className="text-white font-medium mb-1">
                        {reg.city}, {reg.country}
                      </p>

                      <div className="flex items-center gap-2 mt-4">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 text-sm">Cadastrou pelo: <span className="text-white font-medium">{reg.device_type}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Visitantes Recentes</h2>
                <div className="space-y-4">
                  {visitors.slice(0, 5).map((visitor) => (
                    <div key={visitor.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-400" />
                          <span className="text-white font-medium">{visitor.city}, {visitor.country}</span>
                        </div>
                        <span className="text-purple-300 text-xs">{formatDate(visitor.last_visit)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-200">{visitor.device_type}</span>
                        </div>
                        <div className="text-purple-200">{visitor.browser}</div>
                        <div className="text-pink-300 font-medium">{visitor.total_visits} visitas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Cadastros Recentes</h2>
                <div className="space-y-4">
                  {registrations.slice(0, 5).map((reg) => (
                    <div key={reg.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-bold text-lg">{reg.name}</span>
                        <span className="text-purple-300 text-xs">{formatDate(reg.registered_at)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-200 break-all">{reg.email}</span>
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-200">{reg.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-200">{reg.city}, {reg.country}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção de Gráficos Analytics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Análise Técnica de Desenvolvedores (Analytics)
                  </h2>
                  <p className="text-purple-300 mt-2">Gráficos interativos profissionais com visualização 3D - Respeitam todos os filtros aplicados</p>
                </div>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-pink-500/50"
                >
                  <SettingsIcon className="w-5 h-5" />
                  Configurar Gráficos
                </button>
              </div>
              
              {/* Gráficos Analytics - Layout Responsivo Mobile-First */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <AnalyticsCard 
                  title="Dispositivos dos Visitantes" 
                  icon={<Monitor className="w-5 h-5" />}
                  accentColor="pink"
                  chartType={chartPreferences.devices.type}
                  sortOrder={chartPreferences.devices.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('devices', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('devices', { sortOrder })}
                >
                  {chartPreferences.devices.type === 'pie3d' && (
                    <EChartPie3D data={deviceChartData} chartId="devices" sortOrder={chartPreferences.devices.sortOrder} />
                  )}
                  {chartPreferences.devices.type === 'bar3d' && (
                    <EChartBar data={deviceChartData} chartId="devices" sortOrder={chartPreferences.devices.sortOrder} />
                  )}
                  {chartPreferences.devices.type === 'line' && (
                    <EChartLine data={deviceChartData} chartId="devices" sortOrder={chartPreferences.devices.sortOrder} />
                  )}
                </AnalyticsCard>
                
                <AnalyticsCard 
                  title="Navegadores" 
                  subtitle="Distribuição de navegadores utilizados"
                  icon={<Activity className="w-5 h-5" />}
                  accentColor="purple"
                  chartType={chartPreferences.browsers.type}
                  sortOrder={chartPreferences.browsers.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('browsers', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('browsers', { sortOrder })}
                >
                  {chartPreferences.browsers.type === 'pie3d' && (
                    <EChartPie3D data={browserChartData} chartId="browsers" sortOrder={chartPreferences.browsers.sortOrder} />
                  )}
                  {chartPreferences.browsers.type === 'bar3d' && (
                    <EChartBar data={browserChartData} chartId="browsers" sortOrder={chartPreferences.browsers.sortOrder} />
                  )}
                  {chartPreferences.browsers.type === 'line' && (
                    <EChartLine data={browserChartData} chartId="browsers" sortOrder={chartPreferences.browsers.sortOrder} />
                  )}
                </AnalyticsCard>
                
                <AnalyticsCard 
                  title="Sistemas Operacionais" 
                  subtitle="Distribuição de sistemas operacionais"
                  icon={<Monitor className="w-5 h-5" />}
                  accentColor="blue"
                  chartType={chartPreferences.os.type}
                  sortOrder={chartPreferences.os.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('os', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('os', { sortOrder })}
                >
                  {chartPreferences.os.type === 'pie3d' && (
                    <EChartPie3D data={osChartData} chartId="os" sortOrder={chartPreferences.os.sortOrder} />
                  )}
                  {chartPreferences.os.type === 'bar3d' && (
                    <EChartBar data={osChartData} chartId="os" sortOrder={chartPreferences.os.sortOrder} />
                  )}
                  {chartPreferences.os.type === 'line' && (
                    <EChartLine data={osChartData} chartId="os" sortOrder={chartPreferences.os.sortOrder} />
                  )}
                </AnalyticsCard>
                
                <AnalyticsCard 
                  title="Dispositivos nos Cadastros" 
                  subtitle="Como os usuários se cadastraram"
                  icon={<FileText className="w-5 h-5" />}
                  accentColor="green"
                  chartType={chartPreferences.registrationDevices.type}
                  sortOrder={chartPreferences.registrationDevices.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('registrationDevices', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('registrationDevices', { sortOrder })}
                >
                  {chartPreferences.registrationDevices.type === 'pie3d' && (
                    <EChartPie3D data={registrationDeviceData} chartId="registrationDevices" sortOrder={chartPreferences.registrationDevices.sortOrder} />
                  )}
                  {chartPreferences.registrationDevices.type === 'bar3d' && (
                    <EChartBar data={registrationDeviceData} chartId="registrationDevices" sortOrder={chartPreferences.registrationDevices.sortOrder} />
                  )}
                  {chartPreferences.registrationDevices.type === 'line' && (
                    <EChartLine data={registrationDeviceData} chartId="registrationDevices" sortOrder={chartPreferences.registrationDevices.sortOrder} />
                  )}
                </AnalyticsCard>
                
                <AnalyticsCard 
                  title="Top 10 Países" 
                  subtitle="Ranking de países com mais visitantes"
                  icon={<MapPin className="w-5 h-5" />}
                  accentColor="orange"
                  chartType={chartPreferences.countries.type}
                  sortOrder={chartPreferences.countries.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('countries', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('countries', { sortOrder })}
                >
                  {chartPreferences.countries.type === 'pie3d' && (
                    <EChartPie3D data={countryChartData} chartId="countries" sortOrder={chartPreferences.countries.sortOrder} />
                  )}
                  {chartPreferences.countries.type === 'bar' && (
                    <EChartBar data={countryChartData} chartId="countries" sortOrder={chartPreferences.countries.sortOrder} />
                  )}
                  {chartPreferences.countries.type === 'bar3d' && (
                    <EChartBar data={countryChartData} chartId="countries" sortOrder={chartPreferences.countries.sortOrder} />
                  )}
                  {chartPreferences.countries.type === 'line' && (
                    <EChartLine data={countryChartData} chartId="countries" sortOrder={chartPreferences.countries.sortOrder} />
                  )}
                </AnalyticsCard>
                
                <AnalyticsCard 
                  title="Top 10 Cidades" 
                  subtitle="Ranking de cidades com mais visitantes"
                  icon={<MapPin className="w-5 h-5" />}
                  accentColor="pink"
                  chartType={chartPreferences.cities.type}
                  sortOrder={chartPreferences.cities.sortOrder}
                  onChartTypeChange={(type) => updateChartPreference('cities', { type })}
                  onSortOrderChange={(sortOrder) => updateChartPreference('cities', { sortOrder })}
                >
                  {chartPreferences.cities.type === 'pie3d' && (
                    <EChartPie3D data={cityChartData} chartId="cities" sortOrder={chartPreferences.cities.sortOrder} />
                  )}
                  {chartPreferences.cities.type === 'bar' && (
                    <EChartBar data={cityChartData} chartId="cities" sortOrder={chartPreferences.cities.sortOrder} />
                  )}
                  {chartPreferences.cities.type === 'bar3d' && (
                    <EChartBar data={cityChartData} chartId="cities" sortOrder={chartPreferences.cities.sortOrder} />
                  )}
                  {chartPreferences.cities.type === 'line' && (
                    <EChartLine data={cityChartData} chartId="cities" sortOrder={chartPreferences.cities.sortOrder} />
                  )}
                </AnalyticsCard>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalhes do visitante */}
      {selectedVisitor && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" 
          onClick={() => setSelectedVisitor(null)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border-2 border-pink-500/30 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Detalhes Completos do Visitante
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Localização</p>
                <p className="text-white font-bold text-lg break-words">
                  {selectedVisitor.visitor.city}, {selectedVisitor.visitor.region}, {selectedVisitor.visitor.country}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Total de Visitas</p>
                <p className="text-white font-bold text-2xl">{selectedVisitor.visitor.total_visits}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Dispositivo</p>
                <p className="text-white font-medium break-words">
                  {selectedVisitor.visitor.device_type} - {selectedVisitor.visitor.browser}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Sistema</p>
                <p className="text-white font-medium break-words">{selectedVisitor.visitor.os}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Ações Realizadas ({selectedVisitor.events.length})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {selectedVisitor.events.map((event: any) => (
                  <div key={event.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <p className="text-pink-300 font-medium break-words">
                          {translateEventType(event.event_type, event.event_data)}
                        </p>
                        <p className="text-purple-300 text-sm mt-1 break-all">{getPageName(event.page_url)}</p>
                      </div>
                      <span className="text-purple-400 text-xs whitespace-nowrap">{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Páginas Visitadas ({selectedVisitor.pageViews.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedVisitor.pageViews.map((page: any) => (
                  <div key={page.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium break-words">{getPageName(page.page_url)}</p>
                        <p className="text-purple-300 text-sm mt-1">Ficou {page.time_spent} segundos na página</p>
                        <p className="text-purple-400 text-sm">Rolou {page.scroll_depth}% da página</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedVisitor.registration && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Dados de Cadastro</h3>
                <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 p-6 rounded-xl">
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-300 text-sm">Nome</p>
                      <p className="text-white font-bold text-lg break-words">{selectedVisitor.registration.name}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Email</p>
                      <p className="text-white font-medium break-all">{selectedVisitor.registration.email}</p>
                    </div>
                    {selectedVisitor.registration.phone && (
                      <div>
                        <p className="text-purple-300 text-sm">Telefone</p>
                        <p className="text-white font-medium">{selectedVisitor.registration.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-purple-300 text-sm">Data do Cadastro</p>
                      <p className="text-white font-medium">{formatDate(selectedVisitor.registration.registered_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedVisitor(null)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/30"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Gráficos */}
      <ChartConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
      />
    </div>
  );
}

function AdminDashboardWithProvider() {
  return (
    <ChartConfigProvider>
      <AdminDashboard />
    </ChartConfigProvider>
  );
}

export default AdminDashboardWithProvider;
