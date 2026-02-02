import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swords, Calendar, Trophy, Users, Plus, Filter, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast, { Toaster } from "react-hot-toast";
import Countdown from "../components/Countdown";

export default function Batallas() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBattleForm, setShowBattleForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [battleForm, setBattleForm] = useState({
    artistic_name: "",
    contact_name: "",
    contact_email: "",
    contact_whatsapp: "",
    battle_type: "creadores_grandes",
    needs_host: false,
    date_time: "",
    timezone: "",
    rounds: "1_ronda",
    has_challenge: false,
    challenge_description: "",
    use_boosters: false,
    diamonds_required: "10000",
    rules_confirmed: false,
    additional_comments: "",
    opponent_name: "",
    opponent_name_2: "",
    rules: "",
    prize: "",
    image_url: ""
  });
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const { data: battles = [], isLoading } = useQuery({
    queryKey: ["battles"],
    queryFn: async () => {
      const allBattles = await base44.entities.Battle.list("-created_date");
      // Filtrar batallas pendientes de aprobación solo para usuarios no admin
      if (user?.role !== "admin") {
        return allBattles.filter(b => b.status !== "pending_approval");
      }
      return allBattles;
    },
    enabled: true
  });

  const createBattleMutation = useMutation({
    mutationFn: async (data) => {
      const currentUser = await base44.auth.me();
      const isAdmin = currentUser.role === "admin";
      
      const battleData = {
        ...data,
        creator_id: currentUser.id,
        creator_name: currentUser.full_name,
        status: isAdmin ? "invited" : "pending_approval",
        approved_by_admin: isAdmin
      };
      
      return await base44.entities.Battle.create(battleData);
    },
    onSuccess: (battle) => {
      queryClient.invalidateQueries(["battles"]);
      setShowBattleForm(false);
      setBattleForm({
        artistic_name: "",
        contact_name: "",
        contact_email: "",
        contact_whatsapp: "",
        battle_type: "creadores_grandes",
        needs_host: false,
        date_time: "",
        timezone: "",
        rounds: "1_ronda",
        has_challenge: false,
        challenge_description: "",
        use_boosters: false,
        diamonds_required: "10000",
        musical_section: "indistinto",
        flyer_url: "",
        needs_flyer_support: false,
        rules_confirmed: false,
        additional_comments: "",
        opponent_name: "",
        opponent_name_2: "",
        rules: "",
        prize: "",
        image_url: ""
      });
      
      if (battle.status === "pending_approval") {
        toast.success("¡Batalla creada! Será visible una vez que el admin la apruebe.", {
          duration: 4000,
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
      } else {
        toast.success("¡Batalla creada exitosamente!", {
          duration: 3000,
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
      }
    },
    onError: (error) => {
      toast.error("Error al crear batalla: " + error.message, {
        duration: 4000,
        style: { background: '#EF4444', color: '#fff', fontWeight: 'bold' }
      });
    }
  });

  const handleImageUpload = async (e, fieldName = 'image_url') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setBattleForm({ ...battleForm, [fieldName]: result.file_url });
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para crear una batalla");
      return;
    }
    createBattleMutation.mutate(battleForm);
  };

  const filteredBattles = battles.filter(battle => {
    if (statusFilter === "all") return true;
    return battle.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pendiente", color: "bg-yellow-600" },
      invited: { text: "Invitado", color: "bg-blue-600" },
      confirmed: { text: "Confirmada", color: "bg-green-600" },
      completed: { text: "Completada", color: "bg-gray-600" },
      cancelled: { text: "Cancelada", color: "bg-red-600" }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen pt-40 pb-20">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-full">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-bold text-sm">BATALLAS TIKTOK</span>
            </div>
            
            <Button
              onClick={() => {
                if (!user) {
                  toast.error("Debes iniciar sesión para crear una batalla");
                  base44.auth.redirectToLogin();
                  return;
                }
                setShowBattleForm(true);
              }}
              className="h-12 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold shadow-lg shadow-red-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Solicitud Batalla
            </Button>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Batallas <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">ÉPICAS</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Desafía a otros tiktokers y demuestra quién es el mejor en la arena.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">Todas</TabsTrigger>
              <TabsTrigger value="confirmed" className="data-[state=active]:bg-green-600">Confirmadas</TabsTrigger>
              <TabsTrigger value="invited" className="data-[state=active]:bg-blue-600">Invitaciones</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gray-600">Completadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Battles Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="h-32 bg-purple-900/40 rounded mb-4"></div>
              </Card>
            ))}
          </div>
        ) : filteredBattles.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Swords className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay batallas</h3>
            <p className="text-gray-400">Sé el primero en crear una batalla épica</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBattles.map(battle => {
              const badge = getStatusBadge(battle.status);
              return (
                <Link key={battle.id} to={createPageUrl(`DetalleBatalla?id=${battle.id}`)}>
                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6 rounded-2xl card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {badge.text}
                      </span>
                      <Swords className="w-6 h-6 text-red-400" />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-center mb-2">
                        <div className="flex-1">
                          <div className="text-lg font-black text-white">{battle.opponent_name || "???"}</div>
                          <div className="text-xs text-gray-400">Oponente 1</div>
                        </div>
                        <div className="px-3">
                          <div className="text-2xl">⚔️</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-black text-white">{battle.opponent_name_2 || "???"}</div>
                          <div className="text-xs text-gray-400">Oponente 2</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(battle.date_time).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {battle.prize && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Trophy className="w-4 h-4" />
                          {battle.prize}
                        </div>
                      )}
                    </div>

                    {battle.status === "confirmed" && new Date(battle.date_time) > new Date() && (
                      <Countdown targetDate={battle.date_time} />
                    )}

                    {battle.status === "completed" && battle.winner_id && (
                      <div className="mt-4 bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-yellow-400 font-bold text-xs">GANADOR</div>
                        <div className="text-white font-black">
                          {battle.winner_id === battle.opponent_id ? battle.opponent_name : battle.opponent_name_2}
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Battle Modal */}
        <Dialog open={showBattleForm} onOpenChange={setShowBattleForm}>
          <DialogContent className="bg-gradient-to-br from-red-900 to-gray-900 border-2 border-red-500/40 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
                <Swords className="w-6 h-6 text-red-400" />
                Solicitud Batalla Oficial TikTok
              </DialogTitle>
              {user?.role !== "admin" && (
                <p className="text-yellow-400 text-sm font-semibold mt-2">
                  ⚠️ Tu batalla será revisada por un administrador antes de publicarse
                </p>
              )}
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
              {/* 1️⃣ Información del solicitante */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  1️⃣ Información del solicitante
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-white font-bold">Usuario de TikTok *</Label>
                  <Input
                    required
                    value={battleForm.artistic_name}
                    onChange={(e) => setBattleForm({ ...battleForm, artistic_name: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="@usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Nombre de contacto *</Label>
                  <Input
                    required
                    value={battleForm.contact_name}
                    onChange={(e) => setBattleForm({ ...battleForm, contact_name: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Nombre real o del manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Correo electrónico de contacto *</Label>
                  <Input
                    required
                    type="email"
                    value={battleForm.contact_email}
                    onChange={(e) => setBattleForm({ ...battleForm, contact_email: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">WhatsApp de contacto *</Label>
                  <Input
                    required
                    value={battleForm.contact_whatsapp}
                    onChange={(e) => setBattleForm({ ...battleForm, contact_whatsapp: e.target.value })}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              {/* 2️⃣ Detalles de la batalla */}
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  2️⃣ Detalles de la batalla
                </h3>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Tipo de batalla *</Label>
                  <RadioGroup value={battleForm.battle_type} onValueChange={(value) => setBattleForm({ ...battleForm, battle_type: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="creadores_grandes" id="creadores_grandes" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="creadores_grandes" className="text-white cursor-pointer">Creadores grandes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="arregladas" id="arregladas" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="arregladas" className="text-white cursor-pointer">Arregladas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oficiales" id="oficiales" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="oficiales" className="text-white cursor-pointer">Oficiales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="musicales" id="musicales" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="musicales" className="text-white cursor-pointer">Musicales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gammers" id="gammers" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="gammers" className="text-white cursor-pointer">Gammers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="random" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="random" className="text-white cursor-pointer">Random</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-bold">Fecha propuesta *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-black/30 border-orange-500/30 text-white hover:bg-black/40 hover:text-white"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {battleForm.date_time ? format(new Date(battleForm.date_time), 'PPP', { locale: es }) : <span className="text-gray-400">Seleccionar</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={battleForm.date_time ? new Date(battleForm.date_time) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const currentTime = battleForm.date_time ? new Date(battleForm.date_time) : new Date();
                              date.setHours(currentTime.getHours(), currentTime.getMinutes());
                              setBattleForm({ ...battleForm, date_time: date.toISOString() });
                            }
                          }}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-bold">Hora *</Label>
                    <Input
                      type="time"
                      required
                      value={battleForm.date_time ? format(new Date(battleForm.date_time), 'HH:mm') : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = battleForm.date_time ? new Date(battleForm.date_time) : new Date();
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setBattleForm({ ...battleForm, date_time: date.toISOString() });
                      }}
                      className="bg-black/30 border-orange-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Zona horaria</Label>
                  <Input
                    value={battleForm.timezone}
                    onChange={(e) => setBattleForm({ ...battleForm, timezone: e.target.value })}
                    className="bg-black/30 border-orange-500/30 text-white"
                    placeholder="Ej: 9:00 pm COL / PER / MX"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Cantidad de rondas *</Label>
                  <RadioGroup value={battleForm.rounds} onValueChange={(value) => setBattleForm({ ...battleForm, rounds: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1_ronda" id="1_ronda" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="1_ronda" className="text-white cursor-pointer">1 ronda</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mejor_3" id="mejor_3" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="mejor_3" className="text-white cursor-pointer">Mejor de 3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="otro" id="otro_rounds" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="otro_rounds" className="text-white cursor-pointer">Otro (especificar en comentarios)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">¿La batalla tiene reto?</Label>
                  <RadioGroup value={battleForm.has_challenge ? "si" : "no"} onValueChange={(value) => setBattleForm({ ...battleForm, has_challenge: value === "si" })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="reto_si" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="reto_si" className="text-white cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="reto_no" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="reto_no" className="text-white cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {battleForm.has_challenge && (
                  <div className="space-y-2">
                    <Label className="text-white font-bold">Descripción del reto</Label>
                    <Textarea
                      value={battleForm.challenge_description}
                      onChange={(e) => setBattleForm({ ...battleForm, challenge_description: e.target.value })}
                      className="bg-black/30 border-orange-500/30 text-white"
                      placeholder="Describe brevemente el reto..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-white font-bold">¿Necesito Host (promoción de la batalla)?</Label>
                  <RadioGroup value={battleForm.needs_host ? "si" : "no"} onValueChange={(value) => setBattleForm({ ...battleForm, needs_host: value === "si" })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="host_si" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="host_si" className="text-white cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="host_no" className="border-orange-500 text-orange-500" />
                      <Label htmlFor="host_no" className="text-white cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* 3️⃣ Reglas y condiciones */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  3️⃣ Reglas y condiciones
                </h3>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Uso de potenciadores</Label>
                  <RadioGroup value={battleForm.use_boosters ? "si" : "no"} onValueChange={(value) => setBattleForm({ ...battleForm, use_boosters: value === "si" })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="boost_si" className="border-yellow-500 text-yellow-500" />
                      <Label htmlFor="boost_si" className="text-white cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="boost_no" className="border-yellow-500 text-yellow-500" />
                      <Label htmlFor="boost_no" className="text-white cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-white font-bold">Cantidad de diamantes requeridos *</Label>
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-3xl font-black text-yellow-400">
                        {parseInt(battleForm.diamonds_required).toLocaleString()}
                      </span>
                      <span className="text-white ml-2">diamantes</span>
                    </div>
                    <Slider
                      value={[parseInt(battleForm.diamonds_required)]}
                      onValueChange={(value) => setBattleForm({ ...battleForm, diamonds_required: value[0].toString() })}
                      min={10000}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>10K</span>
                      <span>250K</span>
                      <span>500K</span>
                      <span>750K</span>
                      <span>1M</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4️⃣ Confirmación */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  4️⃣ Confirmación
                </h3>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rules_confirmed" 
                    required
                    checked={battleForm.rules_confirmed}
                    onCheckedChange={(checked) => setBattleForm({ ...battleForm, rules_confirmed: checked })}
                    className="border-purple-500"
                  />
                  <Label htmlFor="rules_confirmed" className="text-white cursor-pointer">
                    Confirmo que cumplo y respetaré las reglas de las batallas oficiales de TikTok *
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">Comentarios adicionales (opcional)</Label>
                  <Textarea
                    value={battleForm.additional_comments}
                    onChange={(e) => setBattleForm({ ...battleForm, additional_comments: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-white"
                    placeholder="Escribe cualquier comentario adicional..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBattleForm(false);
                    setBattleForm({
                      artistic_name: "",
                      contact_name: "",
                      contact_email: "",
                      contact_whatsapp: "",
                      battle_type: "creadores_grandes",
                      needs_host: false,
                      date_time: "",
                      timezone: "",
                      rounds: "1_ronda",
                      has_challenge: false,
                      challenge_description: "",
                      use_boosters: false,
                      diamonds_required: "10000",
                      musical_section: "indistinto",
                      flyer_url: "",
                      needs_flyer_support: false,
                      rules_confirmed: false,
                      additional_comments: "",
                      opponent_name: "",
                      opponent_name_2: "",
                      rules: "",
                      prize: "",
                      image_url: ""
                    });
                  }}
                  className="border-gray-500/30 text-black"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createBattleMutation.isPending || !battleForm.rules_confirmed}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                >
                  {createBattleMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}