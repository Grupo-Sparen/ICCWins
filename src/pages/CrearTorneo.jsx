import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Upload, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CrearTorneo() {
  const navigate = useNavigate();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    game: "",
    platform: "",
    start_date: "",
    end_date: "",
    prizes: "",
    max_participants: "",
    entry_fee: "0",
    format: "single_elimination",
    description: "",
    rules: "",
    image_url: "",
    status: "upcoming"
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me()
  });

  const createTournamentMutation = useMutation({
    mutationFn: async () => {
      const tournament = await base44.entities.Tournament.create({
        ...tournamentForm,
        max_participants: parseInt(tournamentForm.max_participants),
        entry_fee: parseFloat(tournamentForm.entry_fee),
        current_participants: 0
      });
      return tournament;
    },
    onSuccess: (tournament) => {
      navigate(createPageUrl(`DetalleTorneo?id=${tournament.id}`));
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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
  };

  const handleCreateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.game || !tournamentForm.platform ||
        !tournamentForm.start_date || !tournamentForm.end_date || !tournamentForm.max_participants) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    createTournamentMutation.mutate();
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-cyan-900/30 to-transparent border border-cyan-500/20 p-12 rounded-3xl text-center">
          <Trophy className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Acceso Restringido</h3>
          <p className="text-gray-400">Solo administradores pueden crear torneos</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Crear <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Torneo</span>
          </h1>
          <p className="text-lg text-gray-400">Organiza un torneo competitivo</p>
        </div>

        <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/20 border border-cyan-500/30 p-8 rounded-2xl">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white font-bold mb-2">Nombre del Torneo *</Label>
                <Input
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="Copa ICC 2026"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Videojuego *</Label>
                <Input
                  value={tournamentForm.game}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="League of Legends"
                />
              </div>
            </div>

            <div>
              <Label className="text-white font-bold mb-2">Plataforma Externa *</Label>
              <Input
                value={tournamentForm.platform}
                onChange={(e) => setTournamentForm({ ...tournamentForm, platform: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white"
                placeholder="Discord, Twitch, etc."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white font-bold mb-2">Fecha de Inicio *</Label>
                <Input
                  type="datetime-local"
                  value={tournamentForm.start_date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Fecha de Fin *</Label>
                <Input
                  type="datetime-local"
                  value={tournamentForm.end_date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="text-white font-bold mb-2">Cupos Máximos *</Label>
                <Input
                  type="number"
                  value={tournamentForm.max_participants}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, max_participants: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="16"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Precio Entrada (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tournamentForm.entry_fee}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, entry_fee: e.target.value })}
                  className="bg-black/30 border-cyan-500/30 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2">Formato *</Label>
                <Select value={tournamentForm.format} onValueChange={(value) => setTournamentForm({ ...tournamentForm, format: value })}>
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

            <div>
              <Label className="text-white font-bold mb-2">Premios</Label>
              <Textarea
                value={tournamentForm.prizes}
                onChange={(e) => setTournamentForm({ ...tournamentForm, prizes: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white min-h-20"
                placeholder="1er lugar: $500, 2do lugar: $300, 3er lugar: $200"
              />
            </div>

            <div>
              <Label className="text-white font-bold mb-2">Descripción</Label>
              <Textarea
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white min-h-24"
                placeholder="Describe el torneo..."
              />
            </div>

            <div>
              <Label className="text-white font-bold mb-2">Reglas</Label>
              <Textarea
                value={tournamentForm.rules}
                onChange={(e) => setTournamentForm({ ...tournamentForm, rules: e.target.value })}
                className="bg-black/30 border-cyan-500/30 text-white min-h-32"
                placeholder="Reglas del torneo..."
              />
            </div>

            <div>
              <Label className="text-white font-bold mb-2">Imagen del Torneo</Label>
              <div className="flex gap-4 items-start">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="bg-black/30 border-cyan-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-bold file:cursor-pointer hover:file:bg-cyan-700"
                />
                {uploadingImage && <span className="text-cyan-400 text-sm mt-2">Subiendo...</span>}
              </div>
              {tournamentForm.image_url && (
                <img src={tournamentForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded-xl mt-4" />
              )}
            </div>

            <div>
              <Label className="text-white font-bold mb-2">Estado Inicial</Label>
              <Select value={tournamentForm.status} onValueChange={(value) => setTournamentForm({ ...tournamentForm, status: value })}>
                <SelectTrigger className="bg-black/30 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Próximamente</SelectItem>
                  <SelectItem value="registration_open">Inscripciones Abiertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateTournament}
              disabled={createTournamentMutation.isPending}
              className="w-full h-14 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-black text-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              {createTournamentMutation.isPending ? "Creando..." : "Crear Torneo"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}