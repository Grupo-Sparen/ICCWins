import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Trophy, Crown, Mic, Gamepad2, Users, Upload, Plus, Edit, Trash2, Check, X, CheckCircle2, Calendar as CalendarIcon, CreditCard, Swords, Menu, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [uploadingImage, setUploadingImage] = useState(false);

  // ... (mantener todos los estados del Admin original)
  const [selectedPrizeForParticipants, setSelectedPrizeForParticipants] = useState(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showGamingForm, setShowGamingForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showBattleForm, setShowBattleForm] = useState(false);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState({ open: false, subscription: null });

  const [prizeForm, setPrizeForm] = useState({
    title: "",
    description: "",
    image_url: "",
    participation_cost: "",
    draw_date: "",
    status: "active",
    featured: false,
    total_participants: 0
  });
  const [editingPrize, setEditingPrize] = useState(null);

  const [subscriptionForm, setSubscriptionForm] = useState({
    name_es: "",
    name_en: "",
    description_es: "",
    description_en: "",
    duration_months: 1,
    price_pen: "",
    price_usd: "",
    benefits: [],
    featured: false,
    active: true
  });
  const [editingSubscription, setEditingSubscription] = useState(null);

  const [podcastForm, setPodcastForm] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    audio_url: "",
    video_url: "",
    duration: "",
    guests: "",
    topics: [],
    publish_date: ""
  });
  const [editingPodcast, setEditingPodcast] = useState(null);

  const [gamingForm, setGamingForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    embed_url: "",
    platform: "youtube",
    category: "highlights",
    publish_date: ""
  });
  const [editingGaming, setEditingGaming] = useState(null);

  const [battleForm, setBattleForm] = useState({
    opponent_id: "",
    opponent_name: "",
    date_time: "",
    rules: "",
    prize: ""
  });

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    game: "",
    platform: "",
    start_date: "",
    end_date: "",
    prizes: "",
    max_participants: "",
    entry_fee: 0,
    format: "single_elimination",
    description: "",
    rules: "",
    image_url: ""
  });

  // Queries
  const { data: prizes = [] } = useQuery({
    queryKey: ["admin-prizes"],
    queryFn: () => base44.entities.Prize.list("-created_date")
  });

  const { data: participations = [] } = useQuery({
    queryKey: ["admin-participations"],
    queryFn: () => base44.entities.Participation.list("-created_date")
  });

  const { data: winners = [] } = useQuery({
    queryKey: ["admin-winners"],
    queryFn: () => base44.entities.Winner.list("-created_date")
  });

  const { data: podcasts = [] } = useQuery({
    queryKey: ["admin-podcasts"],
    queryFn: () => base44.entities.PodcastEpisode.list("-created_date")
  });

  const { data: gaming = [] } = useQuery({
    queryKey: ["admin-gaming"],
    queryFn: () => base44.entities.StreamingContent.list("-created_date")
  });

  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: () => base44.entities.SubscriptionPlan.list("-created_date")
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date")
  });

  const { data: battles = [] } = useQuery({
    queryKey: ["admin-battles"],
    queryFn: () => base44.entities.Battle.list("-created_date")
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ["admin-tournaments"],
    queryFn: () => base44.entities.Tournament.list("-created_date")
  });

  const { data: tiktokers = [] } = useQuery({
    queryKey: ["verified-tiktokers"],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.verified_tiktoker === true);
    }
  });

  // Stats
  const totalRevenue = participations
    .filter(p => p.payment_status === "confirmed")
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const pendingPayments = participations.filter(p => p.payment_status === "pending").length;
  const subscriptionRevenue = subscriptions
    .filter(s => s.status === "active" || s.status === "pending")
    .reduce((sum, s) => sum + (s.amount_paid || 0), 0);
  const totalSubscribers = subscriptions.filter(s => s.status === "active").length;

  // Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, color: "purple" },
    { id: "premios", label: "Premios", icon: Trophy, color: "yellow" },
    { id: "sorteos", label: "Sorteos", icon: Trophy, color: "orange" },
    { id: "participaciones", label: "Participaciones", icon: Users, color: "green" },
    { id: "suscripciones", label: "Planes de Suscripción", icon: Crown, color: "blue" },
    { id: "pagos", label: "Pagos de Suscripción", icon: CreditCard, color: "cyan" },
    { id: "podcast", label: "Podcast", icon: Mic, color: "pink" },
    { id: "gaming", label: "Gaming", icon: Gamepad2, color: "cyan" },
    { id: "batallas", label: "Batallas", icon: Swords, color: "red" },
    { id: "torneos", label: "Torneos", icon: Trophy, color: "blue" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20",
      yellow: "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20",
      orange: "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20",
      green: "text-green-400 bg-green-500/10 hover:bg-green-500/20",
      blue: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
      cyan: "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20",
      pink: "text-pink-400 bg-pink-500/10 hover:bg-pink-500/20",
      red: "text-red-400 bg-red-500/10 hover:bg-red-500/20",
    };
    return colors[color] || colors.purple;
  };

  // Placeholder para secciones - implementar cada una según el Admin original
  const renderSection = () => {
    switch(activeSection) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
              <Trophy className="w-10 h-10 text-purple-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{prizes.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Premios Totales</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-6 rounded-2xl">
              <Users className="w-10 h-10 text-green-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{participations.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Participaciones</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
              <Trophy className="w-10 h-10 text-yellow-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{winners.length}</div>
              <div className="text-gray-400 font-semibold text-sm">Ganadores</div>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
              <div className="text-sm text-gray-400 mb-1">Ingresos por Premios</div>
              <div className="text-3xl font-black text-cyan-400 mb-1">S/ {totalRevenue}</div>
              <div className="text-xs text-yellow-400 font-bold">{pendingPayments} pagos pendientes</div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-500/20 p-6 rounded-2xl">
              <Crown className="w-10 h-10 text-orange-400 mb-3" />
              <div className="text-sm text-gray-400 mb-1">Ingresos por Suscripciones</div>
              <div className="text-3xl font-black text-orange-400 mb-1">S/ {subscriptionRevenue}</div>
            </Card>
            <Card className="bg-gradient-to-br from-pink-900/30 to-transparent border border-pink-500/20 p-6 rounded-2xl">
              <Users className="w-10 h-10 text-pink-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{totalSubscribers}</div>
              <div className="text-gray-400 font-semibold text-sm">Suscriptores Activos</div>
            </Card>
          </div>
        );
      default:
        return (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-2xl text-center">
            <h3 className="text-2xl font-black text-white mb-2">Sección en Desarrollo</h3>
            <p className="text-gray-400">Esta sección se implementará próximamente</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#0F0F1E] to-[#0A0A0F]">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#050508] border-r border-purple-900/20 transition-all duration-300 fixed h-screen flex flex-col overflow-y-auto`}>
          {/* Logo */}
          <div className="p-6 border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-black text-white">ICC</h1>
                  <p className="text-xs text-purple-400 font-semibold">ADMIN</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : `${getColorClasses(item.color)}`
                  }`}
                  title={item.label}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-purple-900/20">
            <button
              onClick={() => base44.auth.logout(window.location.origin)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-bold text-sm">Salir</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <div className="p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5 text-gray-400 mx-auto" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300 p-8`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2">
                {menuItems.find(m => m.id === activeSection)?.label}
              </h2>
              <p className="text-gray-400">Gestiona todos los aspectos de tu plataforma gaming</p>
            </div>

            {/* Content */}
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}