import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Trophy, Crown, Mic, Gamepad2, Users, Upload, Plus, Edit, Trash2, Check, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showGamingForm, setShowGamingForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Stats
  const totalRevenue = participations
    .filter(p => p.payment_status === "confirmed")
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const pendingPayments = participations.filter(p => p.payment_status === "pending").length;

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

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="text-sm text-gray-400 mb-1">Ingresos Totales</div>
              <div className="text-3xl font-black text-cyan-400 mb-1">S/ {totalRevenue}</div>
              <div className="text-xs text-yellow-400 font-bold">{pendingPayments} pagos pendientes</div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 mb-8 flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="winners" className="data-[state=active]:bg-yellow-600">
              <Crown className="w-4 h-4 mr-2" />
              Ganadores
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
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-yellow-600">
              <Crown className="w-4 h-4 mr-2" />
              Suscripciones
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
              <h2 className="text-2xl font-black text-white mb-6">Resumen General</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Premios Activos</span>
                  <span className="text-white font-bold">{prizes.filter(p => p.status === "active").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Pagos Confirmados</span>
                  <span className="text-green-400 font-bold">{participations.filter(p => p.payment_status === "confirmed").length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Pagos Pendientes</span>
                  <span className="text-yellow-400 font-bold">{pendingPayments}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Episodios de Podcast</span>
                  <span className="text-white font-bold">{podcasts.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl">
                  <span className="text-gray-400">Contenido Gaming</span>
                  <span className="text-white font-bold">{gaming.length}</span>
                </div>
              </div>
            </Card>
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

          {/* Winners Tab */}
          <TabsContent value="winners">
            <div className="mb-6">
              <Button
                onClick={() => setShowWinnerForm(!showWinnerForm)}
                className="h-12 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Ganador
              </Button>
            </div>

            <div className="grid gap-4">
              {winners.map((winner) => (
                <Card key={winner.id} className="bg-gradient-to-br from-yellow-900/20 to-transparent border border-yellow-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-black text-white">
                      {winner.winner_name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white">{winner.winner_name}</h3>
                      <p className="text-yellow-400 font-bold">{winner.prize_title}</p>
                      <p className="text-gray-500 text-sm">{new Date(winner.winner_date).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
                onClick={() => setShowPodcastForm(!showPodcastForm)}
                className="h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Episodio
              </Button>
            </div>

            <div className="grid gap-4">
              {podcasts.map((episode) => (
                <Card key={episode.id} className="bg-gradient-to-br from-pink-900/20 to-transparent border border-pink-500/20 p-6 rounded-2xl">
                  <div className="flex gap-4">
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
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gaming Tab */}
          <TabsContent value="gaming">
            <div className="mb-6">
              <Button
                onClick={() => setShowGamingForm(!showGamingForm)}
                className="h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Contenido
              </Button>
            </div>

            <div className="grid gap-4">
              {gaming.map((content) => (
                <Card key={content.id} className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex gap-4">
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
        </Tabs>
      </div>
    </div>
  );
}