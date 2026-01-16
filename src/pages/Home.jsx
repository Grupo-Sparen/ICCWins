import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, Users, Gift, Play, ArrowRight, CheckCircle, Sparkles, Star, ChevronLeft, ChevronRight, Swords, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";
import Countdown from "../components/Countdown";

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const { data: activePrizes = [] } = useQuery({
    queryKey: ["activePrizes"],
    queryFn: async () => {
      const prizes = await base44.entities.Prize.filter({ status: "active" }, "-created_date");
      return prizes;
    }
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const { data: upcomingTournaments = [] } = useQuery({
    queryKey: ["upcomingTournaments"],
    queryFn: () => base44.entities.Tournament.filter({ status: "registration_open" }, "-start_date", 3)
  });

  const { data: upcomingBattles = [] } = useQuery({
    queryKey: ["upcomingBattles"],
    queryFn: () => base44.entities.Battle.filter({ status: "confirmed" }, "-date_time", 3)
  });

  return (
    <div className="min-h-screen pt-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-bold text-sm">PLATAFORMA #1 EN LATAM</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Únete a la<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 text-glow">
                  Comunidad
                </span><br/>
                y Gana Premios<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  INCREÍBLES
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Suscríbete y participa en múltiples sorteos cada mes. 
                <span className="text-purple-400 font-bold"> Cada mes nuevos premios increíbles.</span> 
                ¡Es tu oportunidad de ganar!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to={createPageUrl("Suscripcion")}>
                    <Button className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg rounded-xl glow-purple">
                      <Zap className="w-5 h-5 mr-2" />
                      Suscribirse Ahora
                    </Button>
                  </Link>
                <Link to={createPageUrl("Premios")}>
                  <Button className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/20">
                    Ver Premios
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <div className="text-3xl font-black text-white">500+</div>
                  <div className="text-sm text-gray-400 font-semibold">Ganadores</div>
                </div>
                <div className="w-px h-12 bg-purple-600/30"></div>
                <div>
                  <div className="text-3xl font-black text-white">100K+</div>
                  <div className="text-sm text-gray-400 font-semibold">Comunidad</div>
                </div>
                <div className="w-px h-12 bg-purple-600/30"></div>
                <div>
                  <div className="text-3xl font-black text-white">$50K+</div>
                  <div className="text-sm text-gray-400 font-semibold">En Premios</div>
                </div>
              </div>
            </div>

            {/* Right Content - Active Prizes Slider */}
            <div className="lg:pl-8">
              {activePrizes.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                    <div className="flex">
                      {activePrizes.map((prize) => (
                        <div key={prize.id} className="flex-[0_0_100%] min-w-0 pl-4 first:pl-0">
                          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 p-8 rounded-3xl card-hover backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Trophy className="w-6 h-6 text-yellow-400" />
                              <span className="text-yellow-400 font-black text-sm uppercase tracking-wide">Premio Activo</span>
                            </div>

                            <div className="relative mb-6 rounded-2xl overflow-hidden">
                              <img 
                                src={prize.image_url || "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600"} 
                                alt={prize.title}
                                className="w-full h-64 object-cover"
                              />
                              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-black text-sm">
                                🔥 ACTIVO
                              </div>
                            </div>

                            <h3 className="text-3xl font-black text-white mb-3">{prize.title}</h3>
                            <p className="text-gray-300 mb-6 line-clamp-2">{prize.description}</p>

                            <div className="mb-6">
                              <Countdown targetDate={prize.draw_date} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-black/30 p-4 rounded-xl">
                                <div className="text-xs text-gray-400 font-semibold mb-1">Costo</div>
                                <div className="text-2xl font-black text-purple-400">S/ {prize.participation_cost}</div>
                              </div>
                              <div className="bg-black/30 p-4 rounded-xl">
                                <div className="text-xs text-gray-400 font-semibold mb-1">Sorteo</div>
                                <div className="text-lg font-bold text-white">{new Date(prize.draw_date).toLocaleDateString('es-ES')}</div>
                              </div>
                            </div>

                            <Link to={createPageUrl("Suscripcion")} className="block">
                              <Button className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-black text-lg rounded-xl">
                                <Gift className="w-5 h-5 mr-2" />
                                ¡Suscribirse y Participar!
                              </Button>
                            </Link>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activePrizes.length > 1 && (
                    <>
                      <button
                        onClick={scrollPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 p-12 rounded-3xl text-center">
                  <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-white mb-2">Próximamente</h3>
                  <p className="text-gray-400">Nuevo premio increíble muy pronto...</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              ¿Cómo <span className="text-purple-400">Funciona?</span>
            </h2>
            <p className="text-xl text-gray-400">Participar es súper fácil y rápido</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-purple">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Regístrate</h3>
              <p className="text-gray-400 leading-relaxed">
                Crea tu cuenta con tu nombre, email y país. Es completamente gratis y toma menos de 1 minuto.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-cyan">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Realiza tu pago</h3>
              <p className="text-gray-400 leading-relaxed">
                Haz un solo pago único del premio que quieras. Súper fácil y seguro.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">¡Ya Estás Dentro!</h3>
              <p className="text-gray-400 leading-relaxed">
                Listo, ya participas en el sorteo del premio. Te avisamos en TikTok Live cuando salga el ganador.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              ¿Por Qué <span className="text-purple-400">ICC Wins?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-6 rounded-2xl card-hover">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">100% Transparente</h3>
              <p className="text-gray-400 text-sm">Todos los sorteos en vivo por TikTok Live. Sin trampas.</p>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-6 rounded-2xl card-hover">
              <Users className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Comunidad Gaming</h3>
              <p className="text-gray-400 text-sm">Únete a miles de gamers de toda Latinoamérica.</p>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/30 to-transparent border border-pink-500/20 p-6 rounded-2xl card-hover">
              <Zap className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Premios Increíbles</h3>
              <p className="text-gray-400 text-sm">Consolas, PCs, periféricos gaming y más.</p>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/20 p-6 rounded-2xl card-hover">
              <Play className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Contenido Exclusivo</h3>
              <p className="text-gray-400 text-sm">Podcast, streams, gaming news y mucho más.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Battles */}
      <section className="py-20 bg-gradient-to-b from-purple-950/20 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Batallas <span className="text-red-400">Confirmadas</span>
              </h2>
              <p className="text-xl text-gray-400">No te pierdas estos enfrentamientos épicos</p>
            </div>

            {upcomingBattles.length === 0 ? (
              <Card className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/20 p-12 rounded-3xl text-center col-span-full">
                <Swords className="w-20 h-20 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Próximamente</h3>
                <p className="text-gray-400">Nuevas batallas épicas muy pronto...</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {upcomingBattles.map((battle) => (
                <Link key={battle.id} to={createPageUrl(`DetalleBatalla?id=${battle.id}`)}>
                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6 rounded-2xl card-hover">
                    {battle.image_url && (
                      <div className="mb-4 rounded-xl overflow-hidden">
                        <img src={battle.image_url} alt="Battle" className="w-full h-40 object-cover" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Swords className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold text-sm uppercase">Batalla Confirmada</span>
                    </div>

                    <div className="flex items-center justify-between text-center mb-4">
                      <div className="flex-1">
                        <div className="text-lg font-black text-white">{battle.opponent_name}</div>
                        <div className="text-xs text-gray-400">Oponente 1</div>
                      </div>
                      <div className="px-3">
                        <div className="text-2xl">⚔️</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-black text-white">{battle.opponent_name_2}</div>
                        <div className="text-xs text-gray-400">Oponente 2</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(battle.date_time).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {battle.prize && (
                      <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <Trophy className="w-4 h-4 text-yellow-400 inline mr-2" />
                        <span className="text-yellow-400 font-bold text-sm">{battle.prize}</span>
                      </div>
                    )}
                  </Card>
                </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to={createPageUrl("Batallas")}>
                <Button className="h-12 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black rounded-xl">
                  Ver Todas las Batallas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      {/* Influencers Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0818] border-2 border-purple-500/40 p-12 lg:p-16 rounded-3xl text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl"></div>

            <div className="relative">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-6" />

              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                ¿List@ para <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Brillar?</span>
              </h2>

              <p className="text-lg lg:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Únete a la comunidad de creadores más innovadora y transforma tu pasión 
                en una <span className="text-purple-400 font-bold">carrera exitosa</span>.
              </p>

              <a 
                href="https://iccagencylatam.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="h-16 px-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xl rounded-full shadow-2xl glow-purple">
                  Únete a ICC Agency
                </Button>
              </a>

              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-black text-xs">ICC</span>
                    </div>
                    <span className="font-semibold">International Creative Collective Agency</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full">
                  <span className="text-white font-bold text-sm">Official Partner of TikTok</span>
                  <span className="text-white text-xs">LIVE</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Torneos <span className="text-cyan-400">Próximos</span>
              </h2>
              <p className="text-xl text-gray-400">Únete a la competencia y demuestra tu habilidad</p>
            </div>

            {upcomingTournaments.length === 0 ? (
              <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-12 rounded-3xl text-center col-span-full">
                <Trophy className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Próximamente</h3>
                <p className="text-gray-400">Nuevos torneos muy pronto...</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {upcomingTournaments.map((tournament) => (
                <Link key={tournament.id} to={createPageUrl(`DetalleTorneo?id=${tournament.id}`)}>
                  <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 p-6 rounded-2xl card-hover">
                    {tournament.image_url && (
                      <div className="mb-4 rounded-xl overflow-hidden">
                        <img src={tournament.image_url} alt={tournament.name} className="w-full h-40 object-cover" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400 font-bold text-sm uppercase">{tournament.game}</span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3">{tournament.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(tournament.start_date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users className="w-4 h-4" />
                        {tournament.current_participants}/{tournament.max_participants} participantes
                      </div>
                    </div>

                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold">
                      Ver Torneo
                    </Button>
                  </Card>
                </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to={createPageUrl("Torneos")}>
                <Button className="h-12 px-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-black rounded-xl">
                  Ver Todos los Torneos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0818] p-12 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wIDhoLTJ2LTJoMnYyem00IDBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-5"></div>

            <div className="relative">
              <Star className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
                ¡Es Tu Momento de Ganar!
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Miles de gamers ya participan. No te quedes afuera de la comunidad gaming más grande de LATAM.
              </p>
              <Link to={createPageUrl("Suscripcion")}>
                <Button className="h-16 px-12 bg-white hover:bg-gray-100 text-purple-600 font-black text-xl rounded-xl shadow-2xl">
                  <Zap className="w-6 h-6 mr-2" />
                  Suscribirse Ahora
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      </div>
      );
      }