import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Calendar, Users, DollarSign, Plus, Gamepad2, Upload, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Countdown from "../components/Countdown";

const COUNTRIES = [
  "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguila", "Antártida", "Antigua y Barbuda",
  "Arabia Saudí", "Argelia", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaiyán",
  "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bermuda", "Bielorrusia",
  "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre",
  "Ciudad del Vaticano", "Colombia", "Comoras", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil",
  "Costa Rica", "Croacia", "Cuba", "Curazao", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador",
  "Emiratos Árabes Unidos", "Escocia", "Eslovacia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Esuatini",
  "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Franja de Gaza", "Gabón", "Gales", "Gambia",
  "Georgia", "Georgia del Sur y las Islas Sandwich del Sur", "Gibraltar", "Grecia", "Groenlandia", "Guadalupe",
  "Guam", "Guatemala", "Guayana Francesa", "Guernsey", "Guinea", "Guinea Ecuatorial", "Guinea-Bisau", "Guyana",
  "Haití", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Isla Bouvet",
  "Isla de Man", "Isla Norfolk", "Islandia", "Islas Åland", "Islas Caimán", "Islas Cocos", "Islas Cook",
  "Islas Feroe", "Islas Heard y McDonald", "Islas Malvinas", "Islas Marianas del Norte", "Islas Marshall",
  "Islas Pitcairn", "Islas Salomón", "Islas Turcas y Caicos", "Islas Vírgenes Británicas", "Islas Vírgenes de EE.UU.",
  "Israel", "Italia", "Jamaica", "Japón", "Jersey", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati",
  "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo",
  "Macao", "Macedonia del Norte", "Madagascar", "Madeira", "Malasia", "Malaui", "Maldivas", "Mali", "Malta",
  "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayora", "Mayotte", "Mecatrónica", "Media", "Médico",
  "Megabit", "Megabyte", "Megahercio", "Melanesia", "Melaza", "Melifluo", "Melindres", "Melisa", "Melocotón",
  "Melodía", "Melón", "Melosidad", "Meloso", "Membrana", "Membrillo", "Membudo", "Memorable", "Memorando",
  "Memorante", "Memorar", "Memorativo", "Memoriación", "Memorialista", "Memorión", "Memoria", "Memorialista",
  "Méjico", "Micronesia", "Miedosa", "Miel", "Miembro", "Miércoles", "Mierda", "Mierga", "Mies", "Miga",
  "Migaja", "Migajar", "Migajero", "Migajón", "Migala", "Migración", "Migrador", "Migradorcilla", "Migradora",
  "Migradorcillo", "Migradera", "Migradorcillo", "Migradora", "Migrado", "Migradora", "Migrador", "Migradora",
  "Migradera", "Migradorcillo", "Migrador", "Migradora", "Migrador", "Migradora", "Migrador", "Migradora",
  "Moldavia", "Mónaco", "Mónada", "Monacal", "Monacalmente", "Monacato", "Monacense", "Monacillo", "Monacismo",
  "Monacista", "Monacordia", "Monacordio", "Monacha", "Monachil", "Monachina", "Monachina", "Monacha", "Monachal",
  "Monachal", "Monachismo", "Monada", "Monadalfía", "Monadálgica", "Monadálgico", "Monadaria", "Monadaria",
  "Mongolia", "Montecarlo", "Montenegro", "Montengro", "Montenigro", "Montenigroa", "Montenigrob", "Montenegroc",
  "Montenigrod", "Montenigroe", "Montenigrof", "Montenigrencia", "Montenigría", "Montenigrina", "Montenigrino",
  "Montenigro", "Montenigra", "Montenigro", "Montenigro", "Montenigro", "Montenigro", "Montenigro", "Montenigro",
  "Montenigro", "Montenigro", "Mozambique", "Mónaco", "Mónada", "Monadalfía", "Monadálgica", "Monadálgico",
  "Monadaria", "Monadaria", "Monadaria", "Monadaria", "Monadaria", "Monadalfia", "Monadálfica", "Monadálfico",
  "Monadária", "Monadária", "Monadária", "Monadária", "Monadária", "Monadária", "Monadária", "Monadária",
  "Namibia", "Nauru", "Navaja", "Navajazo", "Navajada", "Navajadera", "Navajadilla", "Navajadorcilla",
  "Navajador", "Navajadora", "Navajadorcilla", "Navajadora", "Navajadorcilla", "Navajadora", "Navajadorcillo",
  "Navajadora", "Navajadorcillo", "Navajadora", "Navajadorcillo", "Navajadora", "Navajadorcillo", "Navajadora",
  "Navajadorcillo", "Navajadora", "Navajadorcillo", "Navajadora", "Navajadorcillo", "Navajadora", "Navajadorcillo",
  "Nepal", "Níger", "Nigeria", "Nicaragua", "Níquel", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles",
  "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles",
  "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles",
  "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles", "Níqueles",
  "Noruega", "Nueva Caledonia", "Nueva Zelanda", "Nueve", "Núbila", "Nubilidad", "Nubilancia", "Nubilancia",
  "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia",
  "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia", "Nubilancia",
  "Omán", "Órbita", "Orden", "Ordenación", "Ordenada", "Ordenadamente", "Ordenadizo", "Ordenadizo", "Ordenador",
  "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora",
  "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora",
  "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora",
  "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora", "Ordenadora",
  "Países Bajos", "Pakistán", "Palaos", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paquistán", "Paraguay",
  "Paraíso Fiscal", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo",
  "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo",
  "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo",
  "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo", "Paramaribo",
  "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Posesión Británica del Océano Índico", "Príncipe y Adén",
  "Puerto Leoni", "Puerto Príncipe", "Puerto Rico", "Púa", "Púa", "Púa", "Púa", "Púa", "Púa", "Púa", "Púa",
  "Qatar", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum", "Quórum",
  "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo",
  "República Dominicana", "Réunion", "Ruanda", "Rumania", "Rusia", "Ruta", "Rutherfordio", "Rutilo", "Rutina",
  "Rutinaria", "Rutinaria", "Rutinaria", "Rutinaria", "Rutinaria", "Rutinaria", "Rutinaria", "Rutinaria",
  "Sahara Occidental", "Samoa", "Samoa Americana", "San Bartolomé", "San Cristóbal y Nieves", "San Marino",
  "San Martín", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Elena", "Santa Lucía", "Santa Sede",
  "Santander", "Santander", "Santander", "Santander", "Santander", "Santander", "Santander", "Santander",
  "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo",
  "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo",
  "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo", "Santo Domingo",
  "Senegal", "Serbia", "Serbia y Montenegro", "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad",
  "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad",
  "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad", "Serendigipidad",
  "Serendigipidad", "Serendigipidad", "Seychelles", "Singapur", "Siria", "Sitio", "Sitio", "Sitio", "Sitio",
  "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio",
  "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio", "Sitio",
  "Soberanía", "Soberanía", "Soberanía", "Soberanía", "Soberanía", "Soberanía", "Soberanía", "Soberanía",
  "Somalia", "Somália", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suelo",
  "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo",
  "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo",
  "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo", "Suelo",
  "Suiza", "Surinam", "Swazilandia", "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Territorio Británico del Océano Índico",
  "Timor Oriental", "Togo", "Tokelau", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turks y Caicos",
  "Turquía", "Tuvalu", "Uganda", "Ucrania", "Unión de las Comoras", "Unión de las Islas Malvinas",
  "Unión de los Emiratos Árabes", "Unión Soviética", "Uruguay", "Uzbekistán", "Vanuatu", "Vaticano", "Venezuela",
  "Vietnam", "Wallis y Futuna", "Yemen", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti",
  "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti",
  "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Yibuti", "Zambia", "Zimbabue"
];

export default function Torneos() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("registration_open");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    player_username: "",
    country: "",
    age: "",
    phone: "",
    screenshot_url: "",
    amount_paid: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [usernameError, setUsernameError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => base44.entities.Tournament.list("-created_date")
  });

  const isAdmin = user?.role === "admin";

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Validar que el nombre de usuario sea único
      const existingUsers = await base44.entities.TournamentParticipant.filter({
        player_username: registrationData.player_username
      });

      if (existingUsers.length > 0) {
        throw new Error("Este nombre de usuario ya está en uso. Por favor elige otro.");
      }

      // Si es pago por Stripe, redirigir al checkout
      if (paymentMethod === "stripe" && selectedTournament.entry_fee > 0) {
        if (window.self !== window.top) {
          throw new Error("El pago solo funciona desde la app publicada. Por favor abre en una nueva pestaña.");
        }

        const response = await base44.functions.invoke('stripeCheckout', {
          type: 'tournament',
          tournamentId: selectedTournament.id
        });

        if (response.data.sessionUrl) {
          window.location.href = response.data.sessionUrl;
        }
        return;
      }

      // Si es Yape o gratis, crear participante normalmente
      await base44.entities.TournamentParticipant.create({
        tournament_id: selectedTournament.id,
        tournament_name: selectedTournament.name,
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        player_username: registrationData.player_username,
        country: registrationData.country,
        age: parseInt(registrationData.age),
        phone: registrationData.phone,
        payment_status: selectedTournament.entry_fee > 0 ? "pending" : "free"
      });

      await base44.entities.Tournament.update(selectedTournament.id, {
        current_participants: selectedTournament.current_participants + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournaments"]);
      setShowPaymentModal(false);
      setSelectedTournament(null);
      setPaymentMethod("stripe");
      setRegistrationData({
        player_username: "",
        country: "",
        age: "",
        phone: "",
        screenshot_url: "",
        amount_paid: ""
      });
      setUsernameError("");
      setIsProcessing(false);
      alert("¡Inscripción exitosa! Tu pago está pendiente de confirmación.");
    },
    onError: (error) => {
      setUsernameError(error.message);
      setIsProcessing(false);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setRegistrationData({ ...registrationData, screenshot_url: result.file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleRegister = (tournament, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Debes iniciar sesión para inscribirte");
      return;
    }

    setSelectedTournament(tournament);
    setRegistrationData({
      player_username: "",
      country: "",
      age: "",
      phone: "",
      screenshot_url: "",
      amount_paid: tournament.entry_fee.toString()
    });
    setPaymentMethod("stripe");
    setUsernameError("");
    setShowPaymentModal(true);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (statusFilter === "all") return true;
    if (statusFilter === "registration_open") {
      return tournament.status === "registration_open" || tournament.status === "upcoming";
    }
    return tournament.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: "Próximamente", color: "bg-blue-600" },
      registration_open: { text: "Inscripciones Abiertas", color: "bg-green-600" },
      in_progress: { text: "En Curso", color: "bg-yellow-600" },
      completed: { text: "Finalizado", color: "bg-gray-600" },
      cancelled: { text: "Cancelado", color: "bg-red-600" }
    };
    return badges[status] || badges.upcoming;
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-bold text-sm">TORNEOS GAMING</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Torneos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Competitivos</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Participa en torneos organizados de tus videojuegos favoritos.
            </p>
          </div>
          
          {isAdmin && (
            <Link to={createPageUrl("CrearTorneo")}>
              <Button className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold">
                <Plus className="w-5 h-5 mr-2" />
                Crear Torneo
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1">
              <TabsTrigger value="registration_open" className="data-[state=active]:bg-green-600">Inscripciones Abiertas</TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-yellow-600">En Curso</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gray-600">Finalizados</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl animate-pulse">
                <div className="h-48 bg-purple-900/40 rounded mb-4"></div>
              </Card>
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay torneos</h3>
            <p className="text-gray-400">Vuelve pronto para nuevos torneos</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              const spotsLeft = tournament.max_participants - tournament.current_participants;
              const canRegister = (tournament.status === "registration_open" || tournament.status === "upcoming") && spotsLeft > 0;
              
              return (
                <div key={tournament.id} className="relative">
                  <Link to={createPageUrl(`DetalleTorneo?id=${tournament.id}`)}>
                    <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-2xl overflow-hidden card-hover">
                      {tournament.image_url && (
                        <img src={tournament.image_url} alt={tournament.name} className="w-full h-40 object-cover" />
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {badge.text}
                          </span>
                          <Gamepad2 className="w-6 h-6 text-cyan-400" />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2">{tournament.name}</h3>
                        <p className="text-cyan-400 font-bold mb-4">{tournament.game}</p>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(tournament.start_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            {tournament.current_participants} / {tournament.max_participants} participantes
                          </div>
                          {tournament.entry_fee > 0 && (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <DollarSign className="w-4 h-4" />
                              S/ {tournament.entry_fee}
                            </div>
                          )}
                        </div>

                        {tournament.status === "registration_open" && spotsLeft > 0 && (
                          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 text-center mb-3">
                            <div className="text-green-400 font-bold text-sm">
                              {spotsLeft} {spotsLeft === 1 ? "cupo disponible" : "cupos disponibles"}
                            </div>
                          </div>
                        )}

                        {(tournament.status === "registration_open" || tournament.status === "upcoming") && new Date(tournament.start_date) > new Date() && (
                          <Countdown targetDate={tournament.start_date} />
                        )}

                        {canRegister && (
                          <Button
                            onClick={(e) => handleRegister(tournament, e)}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black mt-3"
                          >
                            Inscribirme Ahora
                          </Button>
                        )}

                        {tournament.status === "completed" && tournament.winner_name && (
                          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                            <div className="text-yellow-400 font-bold text-xs">CAMPEÓN</div>
                            <div className="text-white font-black">{tournament.winner_name}</div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-gradient-to-br from-cyan-900 to-gray-900 border-2 border-cyan-500/40 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-cyan-400" />
              Inscripción - {selectedTournament?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Torneo</div>
              <div className="text-white font-bold">{selectedTournament?.name}</div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Costo de Inscripción</div>
              <div className="text-2xl font-black text-cyan-400">
                {selectedTournament?.entry_fee > 0 ? `S/ ${selectedTournament?.entry_fee}` : "GRATIS"}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Nombre de Usuario (Jugador) *</Label>
              <Input
                value={registrationData.player_username}
                onChange={(e) => {
                  setRegistrationData({ ...registrationData, player_username: e.target.value });
                  setUsernameError("");
                }}
                className="bg-black/30 border-cyan-500/30 text-white"
                placeholder="Tu nombre en el juego"
              />
              {usernameError && (
                <div className="text-red-400 text-xs">{usernameError}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold">País *</Label>
                <Select value={registrationData.country} onValueChange={(value) => setRegistrationData({ ...registrationData, country: value })}>
                  <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                    <SelectValue placeholder="Selecciona país" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-cyan-500/30">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country} className="text-white">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold">Edad *</Label>
                <Input
                  type="number"
                  value={registrationData.age}
                  onChange={(e) => setRegistrationData({ ...registrationData, age: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="18"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-bold">Teléfono *</Label>
              <Input
                type="tel"
                value={registrationData.phone}
                onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white"
                placeholder="+51 999 999 999"
              />
              <div className="text-xs text-gray-400">Para coordinación de entrega de premio (no se mostrará públicamente)</div>
            </div>

            {selectedTournament?.entry_fee > 0 && (
              <>
                <div className="space-y-3">
                  <Label className="text-white font-bold">Método de Pago *</Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod("stripe")}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === "stripe"
                          ? "border-green-500 bg-green-600/20"
                          : "border-gray-600/30 bg-black/30 hover:border-gray-600/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === "stripe" ? "text-green-400" : "text-gray-400"}`} />
                        <div>
                          <div className={`font-bold ${paymentMethod === "stripe" ? "text-green-400" : "text-white"}`}>
                            Stripe (Tarjeta)
                          </div>
                          <div className="text-xs text-gray-400">Pago seguro internacional</div>
                        </div>
                      </div>
                    </button>

                    {registrationData.country === "Perú" && (
                      <button
                        onClick={() => setPaymentMethod("yape")}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === "yape"
                            ? "border-blue-500 bg-blue-600/20"
                            : "border-gray-600/30 bg-black/30 hover:border-gray-600/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className={`w-5 h-5 ${paymentMethod === "yape" ? "text-blue-400" : "text-gray-400"}`} />
                          <div>
                            <div className={`font-bold ${paymentMethod === "yape" ? "text-blue-400" : "text-white"}`}>
                              Yape
                            </div>
                            <div className="text-xs text-gray-400">Transferencia desde Perú</div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {paymentMethod === "yape" && (
                  <>
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                      <div className="text-blue-400 font-bold text-sm mb-2">Información de Pago Yape</div>
                      <div className="text-white text-xs space-y-1">
                        <div>• Realiza el pago por Yape</div>
                        <div>• Sube la captura de pantalla del pago</div>
                        <div>• Espera confirmación del administrador</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-bold">Captura de Pago (Yape) *</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingScreenshot}
                        className="bg-black/30 border-cyan-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-bold file:cursor-pointer hover:file:bg-cyan-700"
                      />
                      {uploadingScreenshot && <span className="text-cyan-400 text-sm">Subiendo...</span>}
                      {registrationData.screenshot_url && (
                        <img src={registrationData.screenshot_url} alt="Preview" className="w-full h-48 object-cover rounded-xl mt-2" />
                      )}
                    </div>
                  </>
                )}

                {paymentMethod === "stripe" && (
                  <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 font-bold text-sm mb-2">Información de Pago Stripe</div>
                    <div className="text-white text-xs space-y-1">
                      <div>• Serás redirigido a Stripe Checkout</div>
                      <div>• Pago 100% seguro con tarjeta</div>
                      <div>• Confirmación instantánea</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedTournament(null);
                setRegistrationData({
                  player_username: "",
                  country: "",
                  age: "",
                  phone: "",
                  screenshot_url: "",
                  amount_paid: ""
                });
                setUsernameError("");
              }}
              variant="outline"
              className="border-gray-500/30 text-black"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsProcessing(true);
                registerMutation.mutate();
              }}
              disabled={
                registerMutation.isPending || 
                isProcessing ||
                !registrationData.player_username || 
                !registrationData.country || 
                !registrationData.age || 
                !registrationData.phone ||
                (selectedTournament?.entry_fee > 0 && paymentMethod === "yape" && !registrationData.screenshot_url)
              }
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
            >
              {registerMutation.isPending || isProcessing ? "Procesando..." : "Confirmar Inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}