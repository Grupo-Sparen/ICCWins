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

  // Mutations - Premios
  const createPrizeMutation = useMutation({
    mutationFn: (data) => base44.entities.Prize.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-prizes"]);
      setShowPrizeForm(false);
      setEditingPrize(null);
      setPrizeForm({
        title: "",
        description: "",
        image_url: "",
        participation_cost: "",
        draw_date: "",
        status: "active",
        featured: false,
        total_participants: 0
      });
    }
  });

  const updatePrizeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Prize.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-prizes"]);
      setShowPrizeForm(false);
      setEditingPrize(null);
    }
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Participation.update(id, { payment_status: "confirmed" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-participations"]);
    }
  });

  const selectWinnerMutation = useMutation({
    mutationFn: async ({ subscriber, prize }) => {
      await base44.entities.Winner.create({
        prize_id: prize.id,
        prize_title: prize.title,
        winner_name: subscriber.user_name,
        winner_photo_url: "",
        winner_country: "",
        draw_video_url: "",
        winner_date: new Date().toISOString().split('T')[0]
      });
      await base44.entities.Prize.update(prize.id, { status: "finished" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-prizes"]);
      queryClient.invalidateQueries(["admin-winners"]);
      setSelectedPrizeForParticipants(null);
    }
  });

  // Mutations - Batallas
  const createBattleMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const battleData = {
        ...data,
        creator_id: user.id,
        creator_name: user.full_name,
        status: "invited"
      };
      const battle = await base44.entities.Battle.create(battleData);
      await base44.entities.BattleInvitation.create({
        battle_id: battle.id,
        from_user_id: user.id,
        from_user_name: user.full_name,
        to_user_id: data.opponent_id,
        to_user_name: data.opponent_name,
        status: "pending",
        message: `Te invito a una batalla el ${new Date(data.date_time).toLocaleString('es-ES')}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-battles"]);
      setShowBattleForm(false);
      setBattleForm({
        opponent_id: "",
        opponent_name: "",
        date_time: "",
        rules: "",
        prize: ""
      });
    }
  });

  const updateBattleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Battle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-battles"]);
    }
  });

  const deleteBattleMutation = useMutation({
    mutationFn: (id) => base44.entities.Battle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-battles"]);
    }
  });

  // Mutations - Torneos
  const createTournamentMutation = useMutation({
    mutationFn: (data) => base44.entities.Tournament.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-tournaments"]);
      setShowTournamentForm(false);
      setTournamentForm({
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
    }
  });

  const updateTournamentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tournament.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-tournaments"]);
    }
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: (id) => base44.entities.Tournament.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-tournaments"]);
    }
  });

  // Mutations - Suscripciones
  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setShowSubscriptionForm(false);
      setEditingSubscription(null);
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setShowSubscriptionForm(false);
      setEditingSubscription(null);
    }
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
    }
  });

  // Mutations - Podcast
  const createPodcastMutation = useMutation({
    mutationFn: (data) => base44.entities.PodcastEpisode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-podcasts"]);
      setShowPodcastForm(false);
      setEditingPodcast(null);
    }
  });

  const updatePodcastMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PodcastEpisode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-podcasts"]);
      setShowPodcastForm(false);
      setEditingPodcast(null);
      setPodcastForm({
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
    }
  });

  const deletePodcastMutation = useMutation({
    mutationFn: (id) => base44.entities.PodcastEpisode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-podcasts"]);
    }
  });

  // Mutations - Gaming
  const createGamingMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamingContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gaming"]);
      setShowGamingForm(false);
      setEditingGaming(null);
    }
  });

  const updateGamingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StreamingContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gaming"]);
      setShowGamingForm(false);
      setEditingGaming(null);
      setGamingForm({
        title: "",
        description: "",
        thumbnail_url: "",
        embed_url: "",
        platform: "youtube",
        category: "highlights",
        publish_date: ""
      });
    }
  });

  const deleteGamingMutation = useMutation({
    mutationFn: (id) => base44.entities.StreamingContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gaming"]);
    }
  });

  const confirmSubscriptionPaymentMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Subscription.update(id, { status: "active" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscriptions"]);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPrizeForm({ ...prizeForm, image_url: result.file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Render Sections
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

      case "premios":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowPrizeForm(!showPrizeForm)}
                className="h-12 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Premio
              </Button>
            </div>

            <div className="grid gap-4">
              {prizes.map((prize) => (
                <Card key={prize.id} className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {prize.image_url && (
                        <img src={prize.image_url} alt={prize.title} className="w-24 h-24 object-cover rounded-xl" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white mb-1">{prize.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{prize.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-yellow-400 font-bold">S/ {prize.participation_cost}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{new Date(prize.draw_date).toLocaleDateString('es-ES')}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`font-bold ${prize.status === "active" ? "text-green-400" : "text-gray-400"}`}>
                            {prize.status === "active" ? "ACTIVO" : "FINALIZADO"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingPrize(prize);
                        setPrizeForm({
                          title: prize.title,
                          description: prize.description,
                          image_url: prize.image_url || "",
                          participation_cost: prize.participation_cost.toString(),
                          draw_date: prize.draw_date,
                          status: prize.status,
                          featured: prize.featured || false,
                          total_participants: prize.total_participants || 0
                        });
                        setShowPrizeForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/30 text-yellow-400"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "batallas":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowBattleForm(true)}
                className="h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Batalla
              </Button>
            </div>

            {battles.length === 0 ? (
              <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-12 rounded-2xl text-center">
                <Swords className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">No hay batallas</h3>
                <p className="text-gray-400">Crea la primera batalla</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {battles.map((battle) => (
                  <Card key={battle.id} className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white mb-2">
                          {battle.creator_name} vs {battle.opponent_name}
                        </h3>
                        <p className="text-gray-400 mb-2">{new Date(battle.date_time).toLocaleString('es-ES')}</p>
                        <p className="text-gray-300 text-sm">{battle.rules}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingPodcast(null);
                            setBattleForm({
                              opponent_id: battle.opponent_id,
                              opponent_name: battle.opponent_name,
                              date_time: battle.date_time,
                              rules: battle.rules,
                              prize: battle.prize || ""
                            });
                            setShowBattleForm(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm("¿Eliminar batalla?")) {
                              deleteBattleMutation.mutate(battle.id);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "torneos":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowTournamentForm(true)}
                className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Torneo
              </Button>
            </div>

            {tournaments.length === 0 ? (
              <Card className="bg-gradient-to-br from-blue-900/30 to-transparent border border-blue-500/20 p-12 rounded-2xl text-center">
                <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">No hay torneos</h3>
                <p className="text-gray-400">Crea el primer torneo</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="bg-gradient-to-br from-blue-900/30 to-transparent border border-blue-500/20 p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white mb-2">{tournament.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{tournament.description}</p>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>Juego: {tournament.game}</span>
                          <span>Participantes: {tournament.current_participants}/{tournament.max_participants}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setTournamentForm({
                              name: tournament.name,
                              game: tournament.game,
                              platform: tournament.platform,
                              start_date: tournament.start_date,
                              end_date: tournament.end_date,
                              prizes: tournament.prizes || "",
                              max_participants: tournament.max_participants.toString(),
                              entry_fee: tournament.entry_fee || 0,
                              format: tournament.format,
                              description: tournament.description,
                              rules: tournament.rules || "",
                              image_url: tournament.image_url || ""
                            });
                            setShowTournamentForm(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm("¿Eliminar torneo?")) {
                              deleteTournamentMutation.mutate(tournament.id);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "sorteos":
        return (
          <div>
            {!selectedPrizeForParticipants ? (
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white mb-6">Selecciona un Premio</h3>
                <div className="grid gap-4">
                  {prizes.map((prize) => {
                    const activeSubscribers = subscriptions.filter(s => s.status === "active");
                    const prizeWinner = winners.find(w => w.prize_id === prize.id);
                    return (
                      <Card key={prize.id} className="bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-500/20 p-6 rounded-2xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-black text-white mb-2">{prize.title}</h3>
                            <p className="text-gray-400 text-sm">Sorteo: {new Date(prize.draw_date).toLocaleDateString('es-ES')}</p>
                            <p className="text-green-400 font-bold text-sm mt-2">{activeSubscribers.length} suscriptores activos</p>
                            {prizeWinner && (
                              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 mt-3">
                                <p className="text-yellow-400 font-bold text-xs mb-1">GANADOR</p>
                                <p className="text-white font-black">{prizeWinner.winner_name}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => setSelectedPrizeForParticipants(prize)}
                            disabled={activeSubscribers.length === 0}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                          >
                            Ver Suscriptores
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <Button
                  onClick={() => setSelectedPrizeForParticipants(null)}
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 mb-6"
                >
                  ← Volver
                </Button>
                <h3 className="text-lg font-black text-white mb-4">Suscriptores - {selectedPrizeForParticipants.title}</h3>
                <div className="grid gap-3">
                  {subscriptions.filter(s => s.status === "active").map((subscriber) => (
                    <Card key={subscriber.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-4 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-bold">{subscriber.user_name}</h3>
                          <p className="text-gray-400 text-sm">{subscriber.user_email}</p>
                        </div>
                        <Button
                          onClick={() => {
                            if (confirm(`¿Confirmar ganador ${subscriber.user_name}?`)) {
                              selectWinnerMutation.mutate({ subscriber, prize: selectedPrizeForParticipants });
                            }
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                          size="sm"
                        >
                          Seleccionar Ganador
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "participaciones":
        return (
          <div className="grid gap-4">
            {participations.map((participation) => (
              <Card key={participation.id} className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-6 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">{participation.user_name}</h3>
                    <p className="text-gray-400 text-sm">{participation.user_email}</p>
                    <p className="text-green-400 font-bold mt-2">{participation.prize_title}</p>
                    <p className="text-gray-500 text-sm">S/ {participation.amount_paid}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      participation.payment_status === "confirmed" ? "bg-green-600" : "bg-yellow-600"
                    } text-white`}>
                      {participation.payment_status.toUpperCase()}
                    </span>
                    {participation.payment_status === "pending" && (
                      <Button
                        onClick={() => confirmPaymentMutation.mutate({ id: participation.id })}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case "suscripciones":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowSubscriptionForm(true)}
                className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Plan
              </Button>
            </div>
            <div className="grid gap-4">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="bg-gradient-to-br from-blue-900/30 to-transparent border border-blue-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-2">{plan.name_es}</h3>
                      <p className="text-gray-400 text-sm mb-2">{plan.description_es}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-400 font-bold">S/ {plan.price_pen}</span>
                        {plan.price_usd && <span className="text-gray-400">$ {plan.price_usd}</span>}
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{plan.duration_months} meses</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingSubscription(plan);
                          setShowSubscriptionForm(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Eliminar plan?")) {
                            deleteSubscriptionMutation.mutate(plan.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "pagos":
        return (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">{subscription.user_name}</h3>
                    <p className="text-gray-400 text-sm">{subscription.user_email}</p>
                    <p className="text-cyan-400 font-bold mt-2">{subscription.plan_name}</p>
                    <p className="text-gray-500 text-sm">{subscription.currency} {subscription.amount_paid}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      subscription.status === "active" ? "bg-green-600" : "bg-yellow-600"
                    } text-white`}>
                      {subscription.status.toUpperCase()}
                    </span>
                    {subscription.status === "pending" && (
                      <Button
                        onClick={() => confirmSubscriptionPaymentMutation.mutate({ id: subscription.id })}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case "podcast":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowPodcastForm(true)}
                className="h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Episodio
              </Button>
            </div>
            <div className="grid gap-4">
              {podcasts.map((episode) => (
                <Card key={episode.id} className="bg-gradient-to-br from-pink-900/30 to-transparent border border-pink-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white mb-1">{episode.title}</h3>
                      <p className="text-gray-400 text-sm">{episode.description}</p>
                      <div className="flex gap-2 text-xs text-gray-500 mt-2">
                        <span>{new Date(episode.publish_date).toLocaleDateString('es-ES')}</span>
                        {episode.duration && <span>• {episode.duration}</span>}
                        {episode.guests && <span>• {episode.guests}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingPodcast(episode);
                          setPodcastForm({
                            title: episode.title,
                            description: episode.description,
                            cover_image_url: episode.cover_image_url || "",
                            audio_url: episode.audio_url || "",
                            video_url: episode.video_url || "",
                            duration: episode.duration || "",
                            guests: episode.guests || "",
                            topics: episode.topics || [],
                            publish_date: episode.publish_date
                          });
                          setShowPodcastForm(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-pink-500/30 text-pink-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Eliminar episodio?")) {
                            deletePodcastMutation.mutate(episode.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "gaming":
        return (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowGamingForm(true)}
                className="h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Contenido
              </Button>
            </div>
            <div className="grid gap-4">
              {gaming.map((content) => (
                <Card key={content.id} className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          content.platform === "youtube" ? "bg-red-600" : "bg-purple-600"
                        } text-white`}>
                          {content.platform.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">{content.title}</h3>
                      <p className="text-gray-400 text-sm">{content.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingGaming(content);
                          setGamingForm({
                            title: content.title,
                            description: content.description || "",
                            thumbnail_url: content.thumbnail_url || "",
                            embed_url: content.embed_url,
                            platform: content.platform,
                            category: content.category,
                            publish_date: content.publish_date
                          });
                          setShowGamingForm(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/30 text-cyan-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Eliminar contenido?")) {
                            deleteGamingMutation.mutate(content.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
    <div className="min-h-screen pt-40 pb-20 bg-gradient-to-b from-[#0A0A0F] via-[#0F0F1E] to-[#0A0A0F]">
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

      {/* Battle Modal */}
      <Dialog open={showBattleForm} onOpenChange={setShowBattleForm}>
        <DialogContent className="bg-gradient-to-br from-red-900 to-gray-900 border-2 border-red-500/40 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              {editingPodcast ? "Editar Batalla" : "Crear Nueva Batalla"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingPodcast) {
              updateBattleMutation.mutate({ id: editingPodcast.id, data: battleForm });
            } else {
              createBattleMutation.mutate(battleForm);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-bold">Oponente *</Label>
              <Select
                value={battleForm.opponent_id}
                onValueChange={(value) => {
                  const opponent = tiktokers.find(t => t.id === value);
                  setBattleForm({
                    ...battleForm,
                    opponent_id: value,
                    opponent_name: opponent?.full_name || ""
                  });
                }}
              >
                <SelectTrigger className="bg-black/30 border-red-500/30 text-white">
                  <SelectValue placeholder="Selecciona un TikToker" />
                </SelectTrigger>
                <SelectContent>
                  {tiktokers.map((tiktoker) => (
                    <SelectItem key={tiktoker.id} value={tiktoker.id}>
                      {tiktoker.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Fecha y Hora *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-black/30 border-red-500/30 text-white hover:bg-black/40 hover:text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {battleForm.date_time ? format(new Date(battleForm.date_time), 'PPP p', { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={battleForm.date_time ? new Date(battleForm.date_time) : undefined}
                    onSelect={(date) => {
                      if (date) setBattleForm({ ...battleForm, date_time: date.toISOString() });
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Reglas *</Label>
              <Textarea
                required
                value={battleForm.rules}
                onChange={(e) => setBattleForm({ ...battleForm, rules: e.target.value })}
                className="bg-black/30 border-red-500/30 text-white"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBattleForm(false)}
                className="border-gray-500/30 text-black"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBattleMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {createBattleMutation.isPending ? "Creando..." : "Crear Batalla"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Podcast Modal */}
      <Dialog open={showPodcastForm} onOpenChange={setShowPodcastForm}>
        <DialogContent className="bg-gradient-to-br from-pink-900 to-gray-900 border-2 border-pink-500/40 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Mic className="w-6 h-6 text-pink-400" />
              {editingPodcast ? "Editar Episodio" : "Crear Nuevo Episodio"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            const data = { ...podcastForm, topics: podcastForm.topics.filter(t => t.trim() !== "") };
            if (editingPodcast) {
              updatePodcastMutation.mutate({ id: editingPodcast.id, data });
            } else {
              createPodcastMutation.mutate(data);
            }
          }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">Título *</Label>
                <Input
                  required
                  value={podcastForm.title}
                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="Episodio #1: Título"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">Fecha de Publicación *</Label>
                <Input
                  required
                  type="date"
                  value={podcastForm.publish_date}
                  onChange={(e) => setPodcastForm({ ...podcastForm, publish_date: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Descripción *</Label>
              <Textarea
                required
                value={podcastForm.description}
                onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                className="bg-black/30 border-pink-500/30 text-white min-h-24"
                placeholder="Descripción del episodio..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">Duración</Label>
                <Input
                  value={podcastForm.duration}
                  onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="45 min"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">Invitados</Label>
                <Input
                  value={podcastForm.guests}
                  onChange={(e) => setPodcastForm({ ...podcastForm, guests: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="Juan, María"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">URL de Portada</Label>
                <Input
                  value={podcastForm.cover_image_url}
                  onChange={(e) => setPodcastForm({ ...podcastForm, cover_image_url: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">URL de Audio</Label>
                <Input
                  value={podcastForm.audio_url}
                  onChange={(e) => setPodcastForm({ ...podcastForm, audio_url: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="https://spotify.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">URL de Video</Label>
                <Input
                  value={podcastForm.video_url}
                  onChange={(e) => setPodcastForm({ ...podcastForm, video_url: e.target.value })}
                  className="bg-black/30 border-pink-500/30 text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPodcastForm(false);
                  setEditingPodcast(null);
                }}
                className="border-gray-500/30 text-black"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPodcastMutation.isPending || updatePodcastMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold"
              >
                {(createPodcastMutation.isPending || updatePodcastMutation.isPending) 
                  ? (editingPodcast ? "Actualizando..." : "Creando...") 
                  : (editingPodcast ? "Actualizar Episodio" : "Crear Episodio")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gaming Modal */}
      <Dialog open={showGamingForm} onOpenChange={setShowGamingForm}>
        <DialogContent className="bg-gradient-to-br from-cyan-900 to-gray-900 border-2 border-cyan-500/40 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
              {editingGaming ? "Editar Contenido" : "Crear Nuevo Contenido"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingGaming) {
              updateGamingMutation.mutate({ id: editingGaming.id, data: gamingForm });
            } else {
              createGamingMutation.mutate(gamingForm);
            }
          }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">Título *</Label>
                <Input
                  required
                  value={gamingForm.title}
                  onChange={(e) => setGamingForm({ ...gamingForm, title: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="Título del contenido"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">Fecha de Publicación *</Label>
                <Input
                  required
                  type="date"
                  value={gamingForm.publish_date}
                  onChange={(e) => setGamingForm({ ...gamingForm, publish_date: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Descripción</Label>
              <Textarea
                value={gamingForm.description}
                onChange={(e) => setGamingForm({ ...gamingForm, description: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white min-h-20"
                placeholder="Descripción..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">Plataforma *</Label>
                <Select
                  value={gamingForm.platform}
                  onValueChange={(value) => setGamingForm({ ...gamingForm, platform: value })}
                >
                  <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitch">Twitch</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">Categoría *</Label>
                <Select
                  value={gamingForm.category}
                  onValueChange={(value) => setGamingForm({ ...gamingForm, category: value })}
                >
                  <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highlights">Highlights</SelectItem>
                    <SelectItem value="streams">Streams</SelectItem>
                    <SelectItem value="gaming_news">Gaming News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">URL de Embed *</Label>
              <Input
                required
                value={gamingForm.embed_url}
                onChange={(e) => setGamingForm({ ...gamingForm, embed_url: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white"
                placeholder="https://youtube.com/embed/..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGamingForm(false);
                  setEditingGaming(null);
                }}
                className="border-gray-500/30 text-black"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createGamingMutation.isPending || updateGamingMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              >
                {(createGamingMutation.isPending || updateGamingMutation.isPending) 
                  ? (editingGaming ? "Actualizando..." : "Creando...") 
                  : (editingGaming ? "Actualizar Contenido" : "Crear Contenido")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tournament Modal */}
      <Dialog open={showTournamentForm} onOpenChange={setShowTournamentForm}>
        <DialogContent className="bg-gradient-to-br from-blue-900 to-gray-900 border-2 border-blue-500/40 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-400" />
              {editingGaming ? "Editar Torneo" : "Crear Nuevo Torneo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            const data = {
              ...tournamentForm,
              max_participants: parseInt(tournamentForm.max_participants),
              entry_fee: parseFloat(tournamentForm.entry_fee) || 0,
              status: editingGaming ? tournamentForm.status || "upcoming" : "upcoming"
            };
            if (editingGaming) {
              updateTournamentMutation.mutate({ id: editingGaming.id, data });
            } else {
              createTournamentMutation.mutate(data);
            }
          }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">Nombre *</Label>
                <Input
                  required
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                  className="bg-black/30 border-blue-500/30 text-white"
                  placeholder="Nombre del torneo"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-bold">Juego *</Label>
                <Input
                  required
                  value={tournamentForm.game}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}
                  className="bg-black/30 border-blue-500/30 text-white"
                  placeholder="Ej: League of Legends"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Descripción *</Label>
              <Textarea
                required
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                className="bg-black/30 border-blue-500/30 text-white min-h-20"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTournamentForm(false)}
                className="border-gray-500/30 text-black"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTournamentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {createTournamentMutation.isPending ? "Creando..." : "Crear Torneo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}