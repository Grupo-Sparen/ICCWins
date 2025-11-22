import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Mic, Play, Calendar, Clock, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Podcast() {
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["podcast-episodes"],
    queryFn: () => base44.entities.PodcastEpisode.list("-publish_date")
  });

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-600/20 border border-pink-500/30 px-4 py-2 rounded-full mb-6">
            <Mic className="w-4 h-4 text-pink-400" />
            <span className="text-pink-300 font-bold text-sm">PODCAST OFICIAL</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">GamerTalks</span> Podcast
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Conversaciones épicas sobre gaming, esports, tecnología y cultura gamer. 
            <span className="text-pink-400 font-bold"> Episodios nuevos cada semana.</span>
          </p>
        </div>

        {/* Stats Banner */}
        <Card className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/20 p-8 rounded-3xl mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Headphones className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">{episodes.length}</div>
              <div className="text-sm text-gray-400 font-semibold">Episodios</div>
            </div>
            <div>
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">50K+</div>
              <div className="text-sm text-gray-400 font-semibold">Oyentes</div>
            </div>
            <div>
              <Play className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">100K+</div>
              <div className="text-sm text-gray-400 font-semibold">Reproducciones</div>
            </div>
            <div>
              <Mic className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">30+</div>
              <div className="text-sm text-gray-400 font-semibold">Invitados</div>
            </div>
          </div>
        </Card>

        {/* Episodes Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 rounded-2xl animate-pulse">
                <div className="w-full h-64 bg-purple-900/40 rounded-t-2xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-purple-900/40 rounded"></div>
                  <div className="h-20 bg-purple-900/40 rounded"></div>
                  <div className="h-10 bg-purple-900/40 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Mic className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">Próximamente</h3>
            <p className="text-gray-400">Estamos preparando episodios increíbles. ¡Vuelve pronto!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {episodes.map((episode) => (
              <Card 
                key={episode.id}
                className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/20 rounded-2xl overflow-hidden card-hover group"
              >
                {/* Cover Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={episode.cover_image_url || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600"} 
                    alt={episode.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center glow-purple">
                      <Play className="w-8 h-8 text-white" fill="white" />
                    </div>
                  </div>

                  {/* Duration */}
                  {episode.duration && (
                    <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-400" />
                      <span className="text-white text-xs font-bold">{episode.duration}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-3">
                    <Calendar className="w-3 h-3" />
                    {new Date(episode.publish_date).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                    {episode.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {episode.description}
                  </p>

                  {/* Guests */}
                  {episode.guests && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400 font-semibold">Con: <span className="text-white">{episode.guests}</span></span>
                    </div>
                  )}

                  {/* Topics */}
                  {episode.topics && episode.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {episode.topics.slice(0, 3).map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-lg"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Listen Button */}
                  {episode.audio_url && (
                    <Button className="w-full h-10 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl">
                      <Play className="w-4 h-4 mr-2" />
                      Escuchar Ahora
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {episodes.length > 0 && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 p-12 rounded-3xl inline-block max-w-2xl">
              <Mic className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-3xl font-black text-white mb-3">¿Quieres Ser Invitado?</h3>
              <p className="text-gray-300 mb-6">
                Si tienes una historia increíble del mundo gaming, escríbenos y podrías ser nuestro próximo invitado.
              </p>
              <Button className="h-12 px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black rounded-xl">
                Contactar
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}