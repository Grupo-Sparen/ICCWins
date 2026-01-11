import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Trophy, Crown, Mic, Gamepad2, Users, Upload, Plus, Edit, Trash2, Check, X, CheckCircle2, Calendar as CalendarIcon, CreditCard, Swords } from "lucide-react";
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

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPrizeForParticipants, setSelectedPrizeForParticipants] = useState(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showGamingForm, setShowGamingForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showBattleForm, setShowBattleForm] = useState(false);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const { data: tournamentParticipants = [] } = useQuery({
    queryKey: ["admin-tournament-participants"],
    queryFn: () => base44.entities.TournamentParticipant.list("-created_date")
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

  // Mutations
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

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Participation.update(id, { payment_status: "confirmed" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-participations"]);
    }
  });

  const confirmSubscriptionPaymentMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Subscription.update(id, { status: "active" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscriptions"]);
    }
  });

  const selectWinnerMutation = useMutation({
    mutationFn: async ({ subscriber, prize }) => {
      // Create winner record
      await base44.entities.Winner.create({
        prize_id: prize.id,
        prize_title: prize.title,
        winner_name: subscriber.user_name,
        winner_photo_url: "",
        winner_country: "",
        draw_video_url: "",
        winner_date: new Date().toISOString().split('T')[0]
      });
      // Update prize status to finished
      await base44.entities.Prize.update(prize.id, { status: "finished" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-prizes"]);
      queryClient.invalidateQueries(["admin-subscriptions"]);
      queryClient.invalidateQueries(["admin-winners"]);
      setSelectedPrizeForParticipants(null);
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

  const handleCreatePrize = (e) => {
    e.preventDefault();
    const data = {
      ...prizeForm,
      participation_cost: parseFloat(prizeForm.participation_cost),
      total_participants: parseInt(prizeForm.total_participants) || 0
    };
    
    if (editingPrize) {
      updatePrizeMutation.mutate({ id: editingPrize.id, data });
    } else {
      createPrizeMutation.mutate(data);
    }
  };

  const handleEditPrize = (prize) => {
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
  };

  // Subscription mutations
  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setShowSubscriptionForm(false);
      setEditingSubscription(null);
      setSubscriptionForm({
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
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setShowSubscriptionForm(false);
      setEditingSubscription(null);
      setSubscriptionForm({
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
    }
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
    }
  });

  const handleCreateSubscription = (e) => {
    e.preventDefault();
    const data = {
      ...subscriptionForm,
      duration_months: parseInt(subscriptionForm.duration_months),
      price_pen: parseFloat(subscriptionForm.price_pen),
      price_usd: parseFloat(subscriptionForm.price_usd) || null
    };
    
    if (editingSubscription) {
      updateSubscriptionMutation.mutate({ id: editingSubscription.id, data });
    } else {
      createSubscriptionMutation.mutate(data);
    }
  };

  const handleEditSubscription = (plan) => {
    setEditingSubscription(plan);
    setSubscriptionForm({
      name_es: plan.name_es,
      name_en: plan.name_en || "",
      description_es: plan.description_es || "",
      description_en: plan.description_en || "",
      duration_months: plan.duration_months,
      price_pen: plan.price_pen.toString(),
      price_usd: plan.price_usd ? plan.price_usd.toString() : "",
      benefits: plan.benefits || [],
      featured: plan.featured || false,
      active: plan.active !== false
    });
    setShowSubscriptionForm(true);
  };

  const addBenefit = () => {
    setSubscriptionForm({
      ...subscriptionForm,
      benefits: [...subscriptionForm.benefits, { text_es: "", text_en: "" }]
    });
  };

  const updateBenefit = (index, field, value) => {
    const newBenefits = [...subscriptionForm.benefits];
    newBenefits[index][field] = value;
    setSubscriptionForm({ ...subscriptionForm, benefits: newBenefits });
  };

  const removeBenefit = (index) => {
    setSubscriptionForm({
      ...subscriptionForm,
      benefits: subscriptionForm.benefits.filter((_, i) => i !== index)
    });
  };

  // Podcast mutations
  const createPodcastMutation = useMutation({
    mutationFn: (data) => base44.entities.PodcastEpisode.create(data),
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

  const handleCreatePodcast = (e) => {
    e.preventDefault();
    const data = {
      ...podcastForm,
      topics: podcastForm.topics.filter(t => t.trim() !== "")
    };
    
    if (editingPodcast) {
      updatePodcastMutation.mutate({ id: editingPodcast.id, data });
    } else {
      createPodcastMutation.mutate(data);
    }
  };

  const handleEditPodcast = (episode) => {
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
  };

  // Gaming mutations
  const createGamingMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamingContent.create(data),
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

  const handleCreateGaming = (e) => {
    e.preventDefault();
    const data = { ...gamingForm };
    
    if (editingGaming) {
      updateGamingMutation.mutate({ id: editingGaming.id, data });
    } else {
      createGamingMutation.mutate(data);
    }
  };

  const handleEditGaming = (content) => {
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
  };

  // Battle mutations
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
      
      // Create invitation
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

  const registerBattleResultMutation = useMutation({
    mutationFn: async ({ battleId, winnerId }) => {
      const battle = battles.find(b => b.id === battleId);
      await base44.entities.Battle.update(battleId, {
        status: "completed",
        winner_id: winnerId
      });

      const creatorStats = await base44.entities.BattleStats.filter({ user_id: battle.creator_id }).then(s => s[0]);
      const opponentStats = await base44.entities.BattleStats.filter({ user_id: battle.opponent_id }).then(s => s[0]);

      if (creatorStats) {
        const won = winnerId === battle.creator_id ? 1 : 0;
        const lost = winnerId === battle.creator_id ? 0 : 1;
        const total = creatorStats.total_battles + 1;
        const winRate = ((creatorStats.battles_won + won) / total) * 100;
        
        await base44.entities.BattleStats.update(creatorStats.id, {
          battles_won: creatorStats.battles_won + won,
          battles_lost: creatorStats.battles_lost + lost,
          total_battles: total,
          win_rate: winRate
        });
      } else {
        const won = winnerId === battle.creator_id ? 1 : 0;
        await base44.entities.BattleStats.create({
          user_id: battle.creator_id,
          user_name: battle.creator_name,
          battles_won: won,
          battles_lost: 1 - won,
          total_battles: 1,
          win_rate: won * 100
        });
      }

      if (opponentStats) {
        const won = winnerId === battle.opponent_id ? 1 : 0;
        const lost = winnerId === battle.opponent_id ? 0 : 1;
        const total = opponentStats.total_battles + 1;
        const winRate = ((opponentStats.battles_won + won) / total) * 100;
        
        await base44.entities.BattleStats.update(opponentStats.id, {
          battles_won: opponentStats.battles_won + won,
          battles_lost: opponentStats.battles_lost + lost,
          total_battles: total,
          win_rate: winRate
        });
      } else {
        const won = winnerId === battle.opponent_id ? 1 : 0;
        await base44.entities.BattleStats.create({
          user_id: battle.opponent_id,
          user_name: battle.opponent_name,
          battles_won: won,
          battles_lost: 1 - won,
          total_battles: 1,
          win_rate: won * 100
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-battles"]);
      alert("Resultado registrado exitosamente");
    }
  });

  const deleteBattleMutation = useMutation({
    mutationFn: (id) => base44.entities.Battle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-battles"]);
    }
  });

  // Tournament mutations
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

  return (
    <div className="min-h-screen pt-40 pb-20 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center glow-purple">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Panel de Administración</h1>
              <p className="text-lg text-gray-300 font-semibold">Gestiona tu plataforma gaming</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 mb-8 flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-yellow-600">
              <Crown className="w-4 h-4 mr-2" />
              Planes de Suscripciones
            </TabsTrigger>
            <TabsTrigger value="draw" className="data-[state=active]:bg-orange-600">
              <Trophy className="w-4 h-4 mr-2" />
              Sorteos
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="participations" className="data-[state=active]:bg-green-600">
              <Users className="w-4 h-4 mr-2" />
              Participaciones
            </TabsTrigger>
            <TabsTrigger value="podcast" className="data-[state=active]:bg-pink-600">
              <Mic className="w-4 h-4 mr-2" />
              Podcast
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-cyan-600">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Gaming
            </TabsTrigger>
            <TabsTrigger value="subscription-payments" className="data-[state=active]:bg-orange-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagos Suscripciones
            </TabsTrigger>
            <TabsTrigger value="batallas" className="data-[state=active]:bg-red-600">
              <Swords className="w-4 h-4 mr-2" />
              Batallas
            </TabsTrigger>
            <TabsTrigger value="torneos" className="data-[state=active]:bg-cyan-600">
              <Trophy className="w-4 h-4 mr-2" />
              Torneos
            </TabsTrigger>
            <TabsTrigger value="tournament-payments" className="data-[state=active]:bg-green-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagos Torneos
            </TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <Crown className="w-10 h-10 text-yellow-400 mb-3" />
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


          </TabsContent>

          {/* Prizes Tab */}
          <TabsContent value="prizes">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowPrizeForm(!showPrizeForm);
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
                }}
                className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Premio
              </Button>
            </div>

            {showPrizeForm && (
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-2 border-purple-500/40 p-8 rounded-2xl mb-6 shadow-xl">
                <h3 className="text-2xl font-black text-white mb-6">
                  {editingPrize ? "Editar Premio" : "Crear Nuevo Premio"}
                </h3>
                
                <form onSubmit={handleCreatePrize} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">Título *</Label>
                      <Input
                        required
                        value={prizeForm.title}
                        onChange={(e) => setPrizeForm({ ...prizeForm, title: e.target.value })}
                        className="bg-black/30 border-purple-500/30 text-white"
                        placeholder="PlayStation 5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Costo de Participación (S/) *</Label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        value={prizeForm.participation_cost}
                        onChange={(e) => setPrizeForm({ ...prizeForm, participation_cost: e.target.value })}
                        className="bg-black/30 border-purple-500/30 text-white"
                        placeholder="29.90"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-bold">Descripción *</Label>
                    <Textarea
                      required
                      value={prizeForm.description}
                      onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                      className="bg-black/30 border-purple-500/30 text-white min-h-24"
                      placeholder="Descripción completa del premio..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">Fecha de Sorteo *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-black/30 border-purple-500/30 text-white hover:bg-black/40 hover:text-white"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {prizeForm.draw_date ? format(new Date(prizeForm.draw_date), 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={prizeForm.draw_date ? new Date(prizeForm.draw_date) : undefined}
                            onSelect={(date) => setPrizeForm({ ...prizeForm, draw_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Estado *</Label>
                      <Select
                        value={prizeForm.status}
                        onValueChange={(value) => setPrizeForm({ ...prizeForm, status: value })}
                      >
                        <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="upcoming">Próximamente</SelectItem>
                          <SelectItem value="finished">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-bold">Imagen del Premio</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="bg-black/30 border-purple-500/30 text-white"
                      />
                      {uploadingImage && <span className="text-purple-400 text-sm">Subiendo...</span>}
                    </div>
                    {prizeForm.image_url && (
                      <img src={prizeForm.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-xl mt-2" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={prizeForm.featured}
                      onChange={(e) => setPrizeForm({ ...prizeForm, featured: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <Label htmlFor="featured" className="text-white font-bold cursor-pointer">
                      Premio Destacado
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createPrizeMutation.isPending || updatePrizeMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                    >
                      {(createPrizeMutation.isPending || updatePrizeMutation.isPending) 
                        ? (editingPrize ? "Actualizando..." : "Creando...") 
                        : (editingPrize ? "Actualizar Premio" : "Crear Premio")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
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
                      }}
                      className="border-purple-500/30 text-black"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid gap-4">
              {prizes.map((prize) => (
                <Card key={prize.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {prize.image_url && (
                        <img src={prize.image_url} alt={prize.title} className="w-24 h-24 object-cover rounded-xl" />
                      )}
                      <div>
                        <h3 className="text-xl font-black text-white mb-1">{prize.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{prize.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-purple-400 font-bold">S/ {prize.participation_cost}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{new Date(prize.draw_date).toLocaleDateString('es-ES')}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`font-bold ${
                            prize.status === "active" ? "text-green-400" : 
                            prize.status === "upcoming" ? "text-cyan-400" : "text-gray-400"
                          }`}>
                            {prize.status === "active" ? "ACTIVO" : 
                             prize.status === "upcoming" ? "PRÓXIMAMENTE" : "FINALIZADO"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEditPrize(prize)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Draw Tab */}
          <TabsContent value="draw">
            {!selectedPrizeForParticipants ? (
              <div>
                <h3 className="text-xl font-black text-white mb-6">Selecciona un Premio para Ver Suscriptores</h3>
                <div className="grid gap-4">
                  {prizes.map((prize) => {
                    const activeSubscribers = subscriptions.filter(s => s.status === "active");
                    const prizeWinner = winners.find(w => w.prize_id === prize.id);
                    return (
                      <Card key={prize.id} className="bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-500/20 p-6 rounded-2xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-white mb-2">{prize.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">Sorteo: {new Date(prize.draw_date).toLocaleDateString('es-ES')}</p>
                            <div className="flex gap-4 text-sm mb-3">
                              <span className="text-green-400 font-bold">{activeSubscribers.length} suscriptores activos</span>
                              <span className="text-gray-500">•</span>
                              <span className={`font-bold ${
                                prize.status === "active" ? "text-green-400" : 
                                prize.status === "upcoming" ? "text-cyan-400" : "text-gray-400"
                              }`}>
                                {prize.status === "active" ? "ACTIVO" : 
                                 prize.status === "upcoming" ? "PRÓXIMAMENTE" : "FINALIZADO"}
                              </span>
                            </div>
                            {prizeWinner && (
                              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 mt-3">
                                <div className="flex items-center gap-3">
                                  <Trophy className="w-5 h-5 text-yellow-400" />
                                  <div>
                                    <p className="text-yellow-400 font-bold text-xs mb-1">GANADOR</p>
                                    <p className="text-white font-black">{prizeWinner.winner_name}</p>
                                    {prizeWinner.winner_country && (
                                      <p className="text-gray-400 text-xs">{prizeWinner.winner_country}</p>
                                    )}
                                  </div>
                                </div>
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
                <div className="mb-6">
                  <Button
                    onClick={() => setSelectedPrizeForParticipants(null)}
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 mb-4"
                  >
                    ← Volver a Premios
                  </Button>
                  <Card className="bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-500/20 p-6 rounded-2xl">
                    <h2 className="text-2xl font-black text-white mb-2">{selectedPrizeForParticipants.title}</h2>
                    <p className="text-gray-400">Sorteo: {new Date(selectedPrizeForParticipants.draw_date).toLocaleDateString('es-ES')}</p>
                  </Card>
                </div>

                <h3 className="text-xl font-black text-white mb-4">Suscriptores Activos Participando</h3>
                <div className="grid gap-4">
                  {subscriptions
                    .filter(s => s.status === "active")
                    .map((subscriber) => {
                      const hasWon = winners.find(w => w.prize_id === selectedPrizeForParticipants.id && w.winner_name === subscriber.user_name);
                      return (
                        <Card key={subscriber.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-black text-white">{subscriber.user_name}</h3>
                              <p className="text-gray-400 text-sm">{subscriber.user_email}</p>
                              <p className="text-purple-400 font-bold mt-1">{subscriber.plan_name}</p>
                              <p className="text-gray-500 text-sm mt-1">Suscripción: {subscriber.currency} {subscriber.amount_paid}</p>
                              {hasWon && (
                                <span className="inline-block mt-2 px-3 py-1 bg-yellow-600 text-black text-xs font-bold rounded-full">
                                  🏆 GANADOR
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!hasWon && (
                                <Button
                                  onClick={() => {
                                    if (confirm(`¿Confirmar a ${subscriber.user_name} como ganador de ${selectedPrizeForParticipants.title}?`)) {
                                      selectWinnerMutation.mutate({ subscriber, prize: selectedPrizeForParticipants });
                                    }
                                  }}
                                  disabled={selectWinnerMutation.isPending}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                                >
                                  <Trophy className="w-4 h-4 mr-2" />
                                  Seleccionar Ganador
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Participations Tab */}
          <TabsContent value="participations">
            <div className="grid gap-4">
              {participations.map((participation) => (
                <Card key={participation.id} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">{participation.user_name}</h3>
                      <p className="text-gray-400 text-sm">{participation.user_email}</p>
                      <p className="text-purple-400 font-bold mt-2">{participation.prize_title}</p>
                      <p className="text-gray-500 text-sm">S/ {participation.amount_paid}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        participation.payment_status === "confirmed" ? "bg-green-600 text-white" :
                        participation.payment_status === "pending" ? "bg-yellow-600 text-black" :
                        "bg-red-600 text-white"
                      }`}>
                        {participation.payment_status.toUpperCase()}
                      </span>
                      {participation.payment_status === "pending" && (
                        <Button
                          onClick={() => confirmPaymentMutation.mutate({ id: participation.id })}
                          disabled={confirmPaymentMutation.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-bold"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar Pago
                        </Button>
                      )}
                    </div>
                  </div>
                  {participation.payment_screenshot_url && (
                    <div className="mt-4 flex gap-2">
                      <a href={participation.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                          Ver Comprobante
                        </Button>
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Podcast Tab */}
          <TabsContent value="podcast">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowPodcastForm(!showPodcastForm);
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
                }}
                className="h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Episodio
              </Button>
            </div>

            {showPodcastForm && (
              <Card className="bg-gradient-to-br from-pink-900/50 to-purple-800/30 border-2 border-pink-500/40 p-8 rounded-2xl mb-6 shadow-xl">
                <h3 className="text-2xl font-black text-white mb-6">
                  {editingPodcast ? "Editar Episodio" : "Crear Nuevo Episodio"}
                </h3>
                
                <form onSubmit={handleCreatePodcast} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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

                  <div className="grid md:grid-cols-3 gap-6">
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
                        placeholder="Juan Pérez, María García"
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">URL de Audio/Embed</Label>
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

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createPodcastMutation.isPending || updatePodcastMutation.isPending}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
                    >
                      {(createPodcastMutation.isPending || updatePodcastMutation.isPending) 
                        ? (editingPodcast ? "Actualizando..." : "Creando...") 
                        : (editingPodcast ? "Actualizar Episodio" : "Crear Episodio")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
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
                      }}
                      className="border-pink-500/30 text-black"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid gap-4">
              {podcasts.map((episode) => (
                <Card key={episode.id} className="bg-gradient-to-br from-pink-900/20 to-transparent border border-pink-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {episode.cover_image_url && (
                        <img src={episode.cover_image_url} alt={episode.title} className="w-24 h-24 object-cover rounded-xl" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white mb-1">{episode.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{episode.description}</p>
                        <div className="flex gap-3 text-sm text-gray-500">
                          <span>{new Date(episode.publish_date).toLocaleDateString('es-ES')}</span>
                          {episode.duration && <><span>•</span><span>{episode.duration}</span></>}
                          {episode.guests && <><span>•</span><span className="text-purple-400">{episode.guests}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditPodcast(episode)}
                        variant="outline"
                        size="sm"
                        className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar este episodio?")) {
                            deletePodcastMutation.mutate(episode.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gaming Tab */}
          <TabsContent value="gaming">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowGamingForm(!showGamingForm);
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
                }}
                className="h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Contenido
              </Button>
            </div>

            {showGamingForm && (
              <Card className="bg-gradient-to-br from-cyan-900/50 to-purple-800/30 border-2 border-cyan-500/40 p-8 rounded-2xl mb-6 shadow-xl">
                <h3 className="text-2xl font-black text-white mb-6">
                  {editingGaming ? "Editar Contenido" : "Crear Nuevo Contenido"}
                </h3>
                
                <form onSubmit={handleCreateGaming} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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
                      placeholder="Descripción del contenido..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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

                  <div className="grid md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                      <Label className="text-white font-bold">URL de Miniatura</Label>
                      <Input
                        value={gamingForm.thumbnail_url}
                        onChange={(e) => setGamingForm({ ...gamingForm, thumbnail_url: e.target.value })}
                        className="bg-black/30 border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createGamingMutation.isPending || updateGamingMutation.isPending}
                      className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold"
                    >
                      {(createGamingMutation.isPending || updateGamingMutation.isPending) 
                        ? (editingGaming ? "Actualizando..." : "Creando...") 
                        : (editingGaming ? "Actualizar Contenido" : "Crear Contenido")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
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
                      }}
                      className="border-cyan-500/30 text-black"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid gap-4">
              {gaming.map((content) => (
                <Card key={content.id} className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {content.thumbnail_url && (
                        <img src={content.thumbnail_url} alt={content.title} className="w-32 h-24 object-cover rounded-xl" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            content.platform === "youtube" ? "bg-red-600" :
                            content.platform === "twitch" ? "bg-purple-600" : "bg-pink-600"
                          } text-white`}>
                            {content.platform.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-cyan-600/30 text-cyan-400 rounded text-xs font-bold">
                            {content.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mb-1">{content.title}</h3>
                        <p className="text-gray-400 text-sm">{content.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditGaming(content)}
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar este contenido?")) {
                            deleteGamingMutation.mutate(content.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowSubscriptionForm(!showSubscriptionForm);
                  setEditingSubscription(null);
                  setSubscriptionForm({
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
                }}
                className="h-12 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Plan de Suscripción
              </Button>
            </div>

            {showSubscriptionForm && (
              <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-800/30 border-2 border-yellow-500/40 p-8 rounded-2xl mb-6 shadow-xl">
                <h3 className="text-2xl font-black text-white mb-6">
                  {editingSubscription ? "Editar Plan" : "Crear Nuevo Plan"}
                </h3>
                
                <form onSubmit={handleCreateSubscription} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">Nombre (Español) *</Label>
                      <Input
                        required
                        value={subscriptionForm.name_es}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name_es: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white"
                        placeholder="Plan Mensual"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Nombre (Inglés)</Label>
                      <Input
                        value={subscriptionForm.name_en}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name_en: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white"
                        placeholder="Monthly Plan"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">Descripción (Español)</Label>
                      <Textarea
                        value={subscriptionForm.description_es}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, description_es: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white min-h-20"
                        placeholder="Descripción del plan..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Descripción (Inglés)</Label>
                      <Textarea
                        value={subscriptionForm.description_en}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, description_en: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white min-h-20"
                        placeholder="Plan description..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-bold">Duración (meses) *</Label>
                      <Select
                        value={subscriptionForm.duration_months.toString()}
                        onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, duration_months: parseInt(value) })}
                      >
                        <SelectTrigger className="bg-black/30 border-yellow-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 mes (Mensual)</SelectItem>
                          <SelectItem value="3">3 meses (Trimestral)</SelectItem>
                          <SelectItem value="6">6 meses (Semestral)</SelectItem>
                          <SelectItem value="12">12 meses (Anual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Precio PEN (S/) *</Label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        value={subscriptionForm.price_pen}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, price_pen: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white"
                        placeholder="49.90"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Precio USD ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={subscriptionForm.price_usd}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, price_usd: e.target.value })}
                        className="bg-black/30 border-yellow-500/30 text-white"
                        placeholder="15.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-bold">Beneficios</Label>
                      <Button
                        type="button"
                        onClick={addBenefit}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-black"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                    
                    {subscriptionForm.benefits.map((benefit, index) => (
                      <div key={index} className="grid md:grid-cols-2 gap-3 p-4 bg-black/30 rounded-xl">
                        <Input
                          placeholder="Beneficio en español"
                          value={benefit.text_es}
                          onChange={(e) => updateBenefit(index, 'text_es', e.target.value)}
                          className="bg-black/40 border-yellow-500/30 text-white"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Benefit in english"
                            value={benefit.text_en}
                            onChange={(e) => updateBenefit(index, 'text_en', e.target.value)}
                            className="bg-black/40 border-yellow-500/30 text-white"
                          />
                          <Button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="featured-plan"
                        checked={subscriptionForm.featured}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, featured: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <Label htmlFor="featured-plan" className="text-white font-bold cursor-pointer">
                        Plan Destacado
                      </Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="active-plan"
                        checked={subscriptionForm.active}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, active: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <Label htmlFor="active-plan" className="text-white font-bold cursor-pointer">
                        Plan Activo
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold"
                    >
                      {(createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending) 
                        ? (editingSubscription ? "Actualizando..." : "Creando...") 
                        : (editingSubscription ? "Actualizar Plan" : "Crear Plan")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowSubscriptionForm(false);
                        setEditingSubscription(null);
                        setSubscriptionForm({
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
                      }}
                      className="border-yellow-500/30 text-black"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid gap-4">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-white">{plan.name_es}</h3>
                        {plan.featured && (
                          <span className="px-2 py-1 bg-yellow-600 text-black text-xs font-bold rounded">
                            DESTACADO
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          plan.active ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                        }`}>
                          {plan.active ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{plan.description_es}</p>
                      <div className="flex gap-4 text-sm mb-3">
                        <span className="text-yellow-400 font-bold">S/ {plan.price_pen}</span>
                        {plan.price_usd && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">$ {plan.price_usd}</span>
                          </>
                        )}
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{plan.duration_months} {plan.duration_months === 1 ? "mes" : "meses"}</span>
                      </div>
                      {plan.benefits && plan.benefits.length > 0 && (
                        <div className="space-y-1">
                          {plan.benefits.map((benefit, index) => (
                            <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              {benefit.text_es}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditSubscription(plan)}
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar este plan?")) {
                            deleteSubscriptionMutation.mutate(plan.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscription Payments Tab */}
          <TabsContent value="subscription-payments">
            <h3 className="text-xl font-black text-white mb-6">Pagos de Suscripciones</h3>
            <div className="grid gap-4">
              {subscriptions.map((subscription) => {
                const isManualPayment = subscription.payment_method && subscription.payment_method.includes("Manual");
                const isPending = subscription.status === "pending";
                
                return (
                  <Card key={subscription.id} className="bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-500/20 p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white">{subscription.user_name}</h3>
                        <p className="text-gray-400 text-sm">{subscription.user_email}</p>
                        <p className="text-orange-400 font-bold mt-2">{subscription.plan_name}</p>
                        <div className="flex gap-4 text-sm mt-2">
                          <span className="text-gray-500">
                            {subscription.currency} {subscription.amount_paid}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{subscription.payment_method}</span>
                        </div>
                        {subscription.start_date && subscription.end_date && (
                          <p className="text-gray-500 text-xs mt-1">
                            Período: {new Date(subscription.start_date).toLocaleDateString('es-ES')} - {new Date(subscription.end_date).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          subscription.status === "active" ? "bg-green-600 text-white" :
                          subscription.status === "pending" ? "bg-yellow-600 text-black" :
                          subscription.status === "cancelled" ? "bg-red-600 text-white" :
                          "bg-gray-600 text-white"
                        }`}>
                          {subscription.status.toUpperCase()}
                        </span>
                        {isPending && isManualPayment && (
                          <Button
                            onClick={() => setConfirmPaymentDialog({ open: true, subscription })}
                            disabled={confirmSubscriptionPaymentMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Batallas Tab */}
          <TabsContent value="batallas">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Gestión de Batallas</h3>
              <Button 
                onClick={() => setShowBattleForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Batalla
              </Button>
            </div>

            <div className="grid gap-4">
              {battles.length === 0 ? (
                <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-12 rounded-2xl text-center">
                  <Swords className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">No hay batallas</h3>
                  <p className="text-gray-400 mb-6">Crea la primera batalla para comenzar</p>
                  <Button 
                    onClick={() => setShowBattleForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Batalla
                  </Button>
                </Card>
              ) : (
                battles.map((battle) => (
                  <Card key={battle.id} className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Swords className="w-6 h-6 text-red-400" />
                          <h3 className="text-xl font-black text-white">
                            {battle.creator_name} vs {battle.opponent_name || "Pendiente"}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            battle.status === "pending" ? "bg-gray-600 text-white" :
                            battle.status === "invited" ? "bg-yellow-600 text-black" :
                            battle.status === "confirmed" ? "bg-green-600 text-white" :
                            battle.status === "completed" ? "bg-blue-600 text-white" :
                            "bg-red-600 text-white"
                          }`}>
                            {battle.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-4">
                          <div className="bg-black/30 p-3 rounded-xl">
                            <p className="text-gray-400 text-xs mb-1">Fecha y Hora</p>
                            <p className="text-white font-bold text-sm">
                              {new Date(battle.date_time).toLocaleString('es-ES')}
                            </p>
                          </div>
                          {battle.prize && (
                            <div className="bg-yellow-600/20 border border-yellow-500/30 p-3 rounded-xl">
                              <p className="text-yellow-400 text-xs mb-1">Premio</p>
                              <p className="text-white font-bold text-sm">{battle.prize}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-black/30 p-3 rounded-xl mb-3">
                          <p className="text-gray-400 text-xs mb-1">Reglas</p>
                          <p className="text-white text-sm">{battle.rules}</p>
                        </div>

                        {battle.status === "completed" && battle.winner_id && (
                          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <div>
                              <p className="text-yellow-400 font-bold text-xs">GANADOR</p>
                              <p className="text-white font-black">
                                {battle.winner_id === battle.creator_id ? battle.creator_name : battle.opponent_name}
                              </p>
                            </div>
                          </div>
                        )}

                        {battle.status === "confirmed" && !battle.winner_id && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => {
                                if (confirm(`¿${battle.creator_name} ganó la batalla?`)) {
                                  registerBattleResultMutation.mutate({ battleId: battle.id, winnerId: battle.creator_id });
                                }
                              }}
                              disabled={registerBattleResultMutation.isPending}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                              {battle.creator_name} Ganó
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`¿${battle.opponent_name} ganó la batalla?`)) {
                                  registerBattleResultMutation.mutate({ battleId: battle.id, winnerId: battle.opponent_id });
                                }
                              }}
                              disabled={registerBattleResultMutation.isPending}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                              {battle.opponent_name} Ganó
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <a href={`/DetalleBatalla?id=${battle.id}`}>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                            Ver Detalles
                          </Button>
                        </a>
                        {battle.status === "pending" && (
                          <Button
                            onClick={() => {
                              if (confirm("¿Estás seguro de cancelar esta batalla?")) {
                                updateBattleMutation.mutate({ id: battle.id, data: { status: "cancelled" } });
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (confirm("¿Estás seguro de eliminar esta batalla?")) {
                              deleteBattleMutation.mutate(battle.id);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tournament Payments Tab */}
          <TabsContent value="tournament-payments">
            <h3 className="text-xl font-black text-white mb-6">Pagos de Inscripción - Torneos</h3>
            <div className="grid gap-4">
              {tournamentParticipants.length === 0 ? (
                <Card className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-12 rounded-2xl text-center">
                  <CreditCard className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">Sin pagos pendientes</h3>
                  <p className="text-gray-400">No hay inscripciones de torneos con pagos pendientes</p>
                </Card>
              ) : (
                tournamentParticipants.map((participant) => {
                  const isPending = participant.payment_status === "pending";
                  const isPaid = participant.payment_status === "paid";

                  return (
                    <Card key={participant.id} className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/20 p-6 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white">{participant.user_name}</h3>
                          <p className="text-gray-400 text-sm">{participant.user_email}</p>
                          <p className="text-green-400 font-bold mt-2">{participant.tournament_name}</p>
                          <div className="flex gap-4 text-sm mt-2">
                            <span className="text-gray-500">
                              Jugador: {participant.player_username}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{participant.country}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{participant.age} años</span>
                          </div>
                          <p className="text-green-400 font-bold mt-2 text-lg">S/ {tournaments.find(t => t.id === participant.tournament_id)?.entry_fee || 0}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isPaid ? "bg-green-600 text-white" :
                            isPending ? "bg-yellow-600 text-black" :
                            "bg-gray-600 text-white"
                          }`}>
                            {participant.payment_status.toUpperCase()}
                          </span>
                          {isPending && (
                            <Button
                              onClick={() => {
                                if (confirm(`¿Confirmar pago de ${participant.user_name} para ${participant.tournament_name}?`)) {
                                  base44.entities.TournamentParticipant.update(participant.id, { payment_status: "paid" });
                                  queryClient.invalidateQueries(["admin-tournament-participants"]);
                                }
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirmar Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Torneos Tab */}
          <TabsContent value="torneos">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Gestión de Torneos</h3>
              <Button 
                onClick={() => setShowTournamentForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Torneo
              </Button>
            </div>

            <div className="grid gap-4">
              {tournaments.length === 0 ? (
                <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-12 rounded-2xl text-center">
                  <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">No hay torneos</h3>
                  <p className="text-gray-400 mb-6">Crea el primer torneo para comenzar</p>
                  <Button 
                    onClick={() => setShowTournamentForm(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Torneo
                  </Button>
                </Card>
              ) : (
                tournaments.map((tournament) => (
                  <Card key={tournament.id} className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {tournament.image_url && (
                          <img src={tournament.image_url} alt={tournament.name} className="w-24 h-24 object-cover rounded-xl" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-black text-white">{tournament.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              tournament.status === "upcoming" ? "bg-gray-600 text-white" :
                              tournament.status === "registration_open" ? "bg-green-600 text-white" :
                              tournament.status === "in_progress" ? "bg-yellow-600 text-black" :
                              tournament.status === "completed" ? "bg-blue-600 text-white" :
                              "bg-red-600 text-white"
                            }`}>
                              {tournament.status === "upcoming" ? "PRÓXIMO" :
                               tournament.status === "registration_open" ? "INSCRIPCIONES ABIERTAS" :
                               tournament.status === "in_progress" ? "EN CURSO" :
                               tournament.status === "completed" ? "COMPLETADO" : "CANCELADO"}
                            </span>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">{tournament.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="bg-black/30 p-2 rounded-xl">
                              <p className="text-gray-400 text-xs mb-1">Juego</p>
                              <p className="text-white font-bold text-sm">{tournament.game}</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl">
                              <p className="text-gray-400 text-xs mb-1">Formato</p>
                              <p className="text-white font-bold text-sm capitalize">{tournament.format.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl">
                              <p className="text-gray-400 text-xs mb-1">Participantes</p>
                              <p className="text-white font-bold text-sm">
                                {tournament.current_participants}/{tournament.max_participants}
                              </p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl">
                              <p className="text-gray-400 text-xs mb-1">Entrada</p>
                              <p className="text-white font-bold text-sm">
                                {tournament.entry_fee > 0 ? `S/ ${tournament.entry_fee}` : "Gratis"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 text-xs text-gray-400">
                            <span>Inicio: {new Date(tournament.start_date).toLocaleDateString('es-ES')}</span>
                            <span>•</span>
                            <span>Fin: {new Date(tournament.end_date).toLocaleDateString('es-ES')}</span>
                          </div>

                          {tournament.winner_id && (
                            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 mt-3 flex items-center gap-3">
                              <Trophy className="w-5 h-5 text-yellow-400" />
                              <div>
                                <p className="text-yellow-400 font-bold text-xs">CAMPEÓN</p>
                                <p className="text-white font-black">{tournament.winner_name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a href={`/DetalleTorneo?id=${tournament.id}`}>
                          <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 whitespace-nowrap">
                            Ver Detalles
                          </Button>
                        </a>
                        
                        {tournament.status === "registration_open" && (
                          <Button
                            onClick={() => {
                              if (confirm("¿Cerrar inscripciones e iniciar torneo?")) {
                                updateTournamentMutation.mutate({ id: tournament.id, data: { status: "in_progress" } });
                              }
                            }}
                            disabled={updateTournamentMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/20 whitespace-nowrap"
                          >
                            Iniciar Torneo
                          </Button>
                        )}

                        {tournament.status === "in_progress" && (
                          <Button
                            onClick={() => {
                              if (confirm("¿Marcar torneo como completado?")) {
                                updateTournamentMutation.mutate({ id: tournament.id, data: { status: "completed" } });
                              }
                            }}
                            disabled={updateTournamentMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 whitespace-nowrap"
                          >
                            Completar
                          </Button>
                        )}

                        {(tournament.status === "upcoming" || tournament.status === "registration_open") && (
                          <Button
                            onClick={() => {
                              if (confirm("¿Cancelar este torneo?")) {
                                updateTournamentMutation.mutate({ id: tournament.id, data: { status: "cancelled" } });
                              }
                            }}
                            disabled={updateTournamentMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 whitespace-nowrap"
                          >
                            Cancelar
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            if (confirm("¿Estás seguro de eliminar este torneo?")) {
                              deleteTournamentMutation.mutate(tournament.id);
                            }
                          }}
                          disabled={deleteTournamentMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Battle Creation Modal */}
        <Dialog open={showBattleForm} onOpenChange={setShowBattleForm}>
          <DialogContent className="bg-gradient-to-br from-red-900 to-gray-900 border-2 border-red-500/40 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
                <Swords className="w-6 h-6 text-red-400" />
                Crear Nueva Batalla
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Configura los detalles de la batalla e invita a un oponente
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => {
              e.preventDefault();
              createBattleMutation.mutate(battleForm);
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
                      {battleForm.date_time ? format(new Date(battleForm.date_time), 'PPP p', { locale: es }) : <span>Seleccionar fecha y hora</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={battleForm.date_time ? new Date(battleForm.date_time) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setBattleForm({ ...battleForm, date_time: date.toISOString() });
                        }
                      }}
                      initialFocus
                      locale={es}
                    />
                    <div className="p-3 border-t">
                      <Label className="text-sm mb-2 block">Hora</Label>
                      <Input
                        type="time"
                        value={battleForm.date_time ? format(new Date(battleForm.date_time), 'HH:mm') : ''}
                        onChange={(e) => {
                          const currentDate = battleForm.date_time ? new Date(battleForm.date_time) : new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          currentDate.setHours(parseInt(hours), parseInt(minutes));
                          setBattleForm({ ...battleForm, date_time: currentDate.toISOString() });
                        }}
                        className="bg-black/30 border-red-500/30 text-black"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Reglas *</Label>
                <Textarea
                  required
                  value={battleForm.rules}
                  onChange={(e) => setBattleForm({ ...battleForm, rules: e.target.value })}
                  className="bg-black/30 border-red-500/30 text-white min-h-24"
                  placeholder="Describe las reglas de la batalla..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Premio (Opcional)</Label>
                <Input
                  value={battleForm.prize}
                  onChange={(e) => setBattleForm({ ...battleForm, prize: e.target.value })}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="Ej: $100 USD"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBattleForm(false)}
                  className="border-gray-500/30 text-black hover:bg-white/10 hover:text-black"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createBattleMutation.isPending || !battleForm.opponent_id || !battleForm.date_time || !battleForm.rules}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {createBattleMutation.isPending ? "Creando..." : "Crear Batalla"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Tournament Creation Modal */}
        <Dialog open={showTournamentForm} onOpenChange={setShowTournamentForm}>
          <DialogContent className="bg-gradient-to-br from-cyan-900 to-gray-900 border-2 border-cyan-500/40 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-cyan-400" />
                Crear Nuevo Torneo
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Configura los detalles del torneo
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => {
              e.preventDefault();
              createTournamentMutation.mutate({
                ...tournamentForm,
                max_participants: parseInt(tournamentForm.max_participants),
                entry_fee: parseFloat(tournamentForm.entry_fee) || 0,
                status: "upcoming"
              });
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Nombre del Torneo *</Label>
                  <Input
                    required
                    value={tournamentForm.name}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                    className="bg-black/30 border-cyan-500/30 text-white"
                    placeholder="Torneo de League of Legends"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Juego *</Label>
                  <Input
                    required
                    value={tournamentForm.game}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}
                    className="bg-black/30 border-cyan-500/30 text-white"
                    placeholder="League of Legends"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Plataforma *</Label>
                <Select
                  value={tournamentForm.platform}
                  onValueChange={(value) => setTournamentForm({ ...tournamentForm, platform: value })}
                >
                  <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                    <SelectValue placeholder="Selecciona plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Discord">Discord</SelectItem>
                    <SelectItem value="Twitch">Twitch</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook Gaming">Facebook Gaming</SelectItem>
                    <SelectItem value="Steam">Steam</SelectItem>
                    <SelectItem value="Epic Games">Epic Games</SelectItem>
                    <SelectItem value="Battlefy">Battlefy</SelectItem>
                    <SelectItem value="Challonge">Challonge</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Fecha de Inicio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-black/30 border-cyan-500/30 text-white hover:bg-black/40 hover:text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tournamentForm.start_date ? format(new Date(tournamentForm.start_date), 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tournamentForm.start_date ? new Date(tournamentForm.start_date) : undefined}
                        onSelect={(date) => setTournamentForm({ ...tournamentForm, start_date: date ? date.toISOString() : '' })}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Fecha de Fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-black/30 border-cyan-500/30 text-white hover:bg-black/40 hover:text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tournamentForm.end_date ? format(new Date(tournamentForm.end_date), 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tournamentForm.end_date ? new Date(tournamentForm.end_date) : undefined}
                        onSelect={(date) => setTournamentForm({ ...tournamentForm, end_date: date ? date.toISOString() : '' })}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Participantes Máximos *</Label>
                  <Select
                    value={tournamentForm.max_participants.toString()}
                    onValueChange={(value) => setTournamentForm({ ...tournamentForm, max_participants: value })}
                  >
                    <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                      <SelectValue placeholder="Selecciona cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 participantes</SelectItem>
                      <SelectItem value="8">8 participantes</SelectItem>
                      <SelectItem value="16">16 participantes</SelectItem>
                      <SelectItem value="32">32 participantes</SelectItem>
                      <SelectItem value="64">64 participantes</SelectItem>
                      <SelectItem value="128">128 participantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Precio de Entrada</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tournamentForm.entry_fee}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, entry_fee: e.target.value })}
                    className="bg-black/30 border-cyan-500/30 text-white"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Formato *</Label>
                  <Select
                    value={tournamentForm.format}
                    onValueChange={(value) => setTournamentForm({ ...tournamentForm, format: value })}
                  >
                    <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_elimination">Eliminación Simple</SelectItem>
                      <SelectItem value="double_elimination">Eliminación Doble</SelectItem>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Descripción *</Label>
                <Textarea
                  required
                  value={tournamentForm.description}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white min-h-20"
                  placeholder="Descripción del torneo..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Premios</Label>
                  <Textarea
                    value={tournamentForm.prizes}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, prizes: e.target.value })}
                    className="bg-black/30 border-cyan-500/30 text-white min-h-20"
                    placeholder="1er lugar: $500, 2do lugar: $300..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Reglas</Label>
                  <Textarea
                    value={tournamentForm.rules}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, rules: e.target.value })}
                    className="bg-black/30 border-cyan-500/30 text-white min-h-20"
                    placeholder="Reglas del torneo..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Imagen del Torneo</Label>
                <div className="flex gap-4 items-start">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const result = await base44.integrations.Core.UploadFile({ file });
                        setTournamentForm({ ...tournamentForm, image_url: result.file_url });
                      } catch (error) {
                        console.error("Error uploading image:", error);
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    disabled={uploadingImage}
                    className="bg-black/30 border-cyan-500/30 text-white"
                  />
                  {uploadingImage && <span className="text-cyan-400 text-sm">Subiendo...</span>}
                </div>
                {tournamentForm.image_url && (
                  <img src={tournamentForm.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-xl mt-2" />
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTournamentForm(false)}
                  className="border-gray-500/30 text-black hover:bg-white/10 hover:text-black"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createTournamentMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  {createTournamentMutation.isPending ? "Creando..." : "Crear Torneo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmPaymentDialog.open} onOpenChange={(open) => setConfirmPaymentDialog({ open, subscription: null })}>
          <DialogContent className="bg-gradient-to-br from-purple-900 to-gray-900 border-2 border-green-500/40">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white">Confirmar Pago</DialogTitle>
              <DialogDescription className="text-gray-300">
                ¿Estás seguro de confirmar el pago de {confirmPaymentDialog.subscription?.user_name}?
              </DialogDescription>
            </DialogHeader>
            {confirmPaymentDialog.subscription && (
              <div className="bg-black/30 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Usuario:</span>
                  <span className="text-white font-bold">{confirmPaymentDialog.subscription.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white font-bold">{confirmPaymentDialog.subscription.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monto:</span>
                  <span className="text-green-400 font-bold">{confirmPaymentDialog.subscription.currency} {confirmPaymentDialog.subscription.amount_paid}</span>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmPaymentDialog({ open: false, subscription: null })}
                className="border-gray-500/30 text-black hover:bg-white/10 hover:text-black"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  confirmSubscriptionPaymentMutation.mutate({ id: confirmPaymentDialog.subscription.id });
                  setConfirmPaymentDialog({ open: false, subscription: null });
                }}
                disabled={confirmSubscriptionPaymentMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar Pago
              </Button>
            </DialogFooter>
            </DialogContent>
            </Dialog>
            </div>
            </div>
            );
            }