import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Play, Youtube, Twitch, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Gaming() {
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");

  const { data: content = [], isLoading } = useQuery({
    queryKey: ["streaming-content"],
    queryFn: () => base44.entities.StreamingContent.list("-publish_date")
  });

  const filteredContent = content.filter(item => {
    const categoryMatch = category === "all" || item.category === category;
    const platformMatch = platform === "all" || item.platform === platform;
    return categoryMatch && platformMatch;
  });

  const getPlatformIcon = (platformName) => {
    switch(platformName) {
      case "youtube": return <Youtube className="w-5 h-5" />;
      case "twitch": return <Twitch className="w-5 h-5" />;
      case "tiktok": return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
      default: return <Play className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platformName) => {
    switch(platformName) {
      case "youtube": return "from-red-600 to-red-700";
      case "twitch": return "from-purple-600 to-purple-700";
      case "tiktok": return "from-pink-600 to-purple-600";
      default: return "from-gray-600 to-gray-700";
    }
  };

  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 rounded-full mb-6">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 font-bold text-sm">CONTENIDO GAMING</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Streaming & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Gaming</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Los mejores highlights, streams en vivo y contenido gaming. 
            <span className="text-cyan-400 font-bold"> Todo en un solo lugar.</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          {/* Category Filter */}
          <Tabs value={category} onValueChange={setCategory} className="w-auto">
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 h-auto">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger 
                value="highlights"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Highlights
              </TabsTrigger>
              <TabsTrigger 
                value="streams"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Streams
              </TabsTrigger>
              <TabsTrigger 
                value="gaming_news"
                className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Noticias
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Platform Filter */}
          <Tabs value={platform} onValueChange={setPlatform} className="w-auto">
            <TabsList className="bg-purple-900/30 border border-purple-500/30 p-1 h-auto">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Todas las Plataformas
              </TabsTrigger>
              <TabsTrigger 
                value="youtube"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                <Youtube className="w-4 h-4 mr-1" />
                YouTube
              </TabsTrigger>
              <TabsTrigger 
                value="twitch"
                className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                <Twitch className="w-4 h-4 mr-1" />
                Twitch
              </TabsTrigger>
              <TabsTrigger 
                value="tiktok"
                className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-gray-400 font-bold px-4 py-2 rounded-lg text-sm"
              >
                TikTok
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 rounded-2xl animate-pulse">
                <div className="w-full h-64 bg-purple-900/40 rounded-t-2xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-purple-900/40 rounded"></div>
                  <div className="h-16 bg-purple-900/40 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-12 rounded-3xl text-center">
            <Filter className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No hay contenido en esta categoría</h3>
            <p className="text-gray-400 mb-6">Prueba con otro filtro o vuelve pronto</p>
            <Button 
              onClick={() => { setCategory("all"); setPlatform("all"); }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Ver Todo el Contenido
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContent.map((item) => (
              <Card 
                key={item.id}
                className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-2xl overflow-hidden card-hover group"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden">
                  <img 
                    src={
                      item.platform === "youtube" && getYoutubeThumbnail(item.embed_url) 
                        ? getYoutubeThumbnail(item.embed_url)
                        : item.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"
                    }
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center glow-cyan">
                      <Play className="w-8 h-8 text-white" fill="white" />
                    </div>
                  </div>

                  {/* Platform Badge */}
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${getPlatformColor(item.platform)} px-3 py-1 rounded-full flex items-center gap-1 text-white font-bold text-xs`}>
                    {getPlatformIcon(item.platform)}
                    {item.platform.toUpperCase()}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-full text-white text-xs font-bold uppercase">
                    {item.category === "gaming_news" ? "Noticias" : item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Watch Button */}
                  {item.embed_url && (
                    <a 
                      href={item.embed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className={`w-full h-10 bg-gradient-to-r ${getPlatformColor(item.platform)} hover:shadow-lg text-white font-bold rounded-xl`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver en {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Section */}
        {filteredContent.length > 0 && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 p-12 rounded-3xl inline-block max-w-2xl">
              <Gamepad2 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-3xl font-black text-white mb-3">Síguenos en Vivo</h3>
              <p className="text-gray-300 mb-6">
                No te pierdas nuestros streams en vivo. Gaming, sorteos y mucha diversión esperándote.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="h-12 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg text-white font-bold rounded-xl">
                  <Twitch className="w-5 h-5 mr-2" />
                  Twitch
                </Button>
                <Button className="h-12 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg text-white font-bold rounded-xl">
                  <Youtube className="w-5 h-5 mr-2" />
                  YouTube
                </Button>
                <Button className="h-12 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg text-white font-bold rounded-xl">
                  TikTok
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}