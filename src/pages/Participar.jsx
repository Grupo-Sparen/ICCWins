import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Upload, CheckCircle2, AlertCircle, Trophy, Gift, CreditCard, User, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Participar() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    prize_id: "",
    screenshot: null
  });
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Get prize from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prizeId = urlParams.get("prize");
    if (prizeId) {
      setFormData(prev => ({ ...prev, prize_id: prizeId }));
    }
  }, []);

  const { data: activePrizes = [] } = useQuery({
    queryKey: ["active-prizes"],
    queryFn: async () => {
      const prizes = await base44.entities.Prize.filter({ status: "active" }, "-created_date");
      return prizes;
    }
  });

  const { data: selectedPrize } = useQuery({
    queryKey: ["prize", formData.prize_id],
    queryFn: () => base44.entities.Prize.filter({ id: formData.prize_id }, "-created_date", 1).then(r => r[0]),
    enabled: !!formData.prize_id
  });

  const participationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Participation.create({
        user_email: data.email,
        user_name: data.name,
        prize_id: data.prize_id,
        prize_title: selectedPrize?.title || "",
        amount_paid: selectedPrize?.participation_cost || 0,
        country: data.country,
        payment_screenshot_url: uploadedScreenshotUrl,
        payment_status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participations"] });
      setStep(4);
    }
  });

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedScreenshotUrl(result.file_url);
      setFormData(prev => ({ ...prev, screenshot: file }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    participationMutation.mutate(formData);
  };

  const countries = [
    "Perú", "Argentina", "Chile", "Colombia", "México", "Ecuador", 
    "Bolivia", "Paraguay", "Uruguay", "Venezuela", "Panamá", "Costa Rica", "Otro"
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-bold text-sm">¡PARTICIPA Y GANA!</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Únete al <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Sorteo</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Solo 3 pasos simples para participar. <span className="text-green-400 font-bold">¡Es súper fácil!</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step >= s ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                    step >= s 
                      ? "bg-gradient-to-r from-green-600 to-cyan-600 text-white" 
                      : "bg-gray-700 text-gray-400"
                  }`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  <span className={`hidden md:block font-bold text-sm ${step >= s ? "text-white" : "text-gray-500"}`}>
                    {s === 1 ? "Datos" : s === 2 ? "Pago" : "Listo"}
                  </span>
                </div>
                {s < 3 && <div className={`w-12 md:w-24 h-1 rounded ${step > s ? "bg-green-600" : "bg-gray-700"}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Register */}
        {step === 1 && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-black text-white">Paso 1: Tus Datos</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-white font-bold mb-2 block">Nombre Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  className="h-12 bg-black/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="h-12 bg-black/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">País</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger className="h-12 bg-black/30 border-purple-500/30 text-white">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">Selecciona el Premio</Label>
                <Select value={formData.prize_id} onValueChange={(value) => setFormData({ ...formData, prize_id: value })}>
                  <SelectTrigger className="h-12 bg-black/30 border-purple-500/30 text-white">
                    <SelectValue placeholder="Elige tu premio" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePrizes.map((prize) => (
                      <SelectItem key={prize.id} value={prize.id}>
                        {prize.title} - S/ {prize.participation_cost}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPrize && (
                <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h3 className="text-white font-black">{selectedPrize.title}</h3>
                      <p className="text-yellow-400 font-bold">Costo: S/ {selectedPrize.participation_cost}</p>
                    </div>
                  </div>
                </Card>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.country || !formData.prize_id}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black text-lg rounded-xl disabled:opacity-50"
              >
                Continuar al Pago
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-black text-white">Paso 2: Paga con Yape</h2>
            </div>

            <div className="space-y-6">
              {/* Yape Instructions */}
              <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6 rounded-2xl">
                <h3 className="text-xl font-black text-white mb-4">Instrucciones de Pago</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</span>
                    <span>Abre tu app de Yape</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</span>
                    <span>Envía <span className="text-yellow-400 font-black">S/ {selectedPrize?.participation_cost}</span> al número: <span className="text-white font-black">999 999 999</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</span>
                    <span>Toma una captura de pantalla del comprobante</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</span>
                    <span>Sube la captura aquí abajo</span>
                  </li>
                </ol>
              </Card>

              {/* Upload Screenshot */}
              <div>
                <Label className="text-white font-bold mb-3 block flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Sube tu Captura de Pantalla
                </Label>
                <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/60 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {isUploading ? (
                      <div className="text-purple-400">Subiendo...</div>
                    ) : uploadedScreenshotUrl ? (
                      <div className="space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                        <p className="text-green-400 font-bold">¡Captura subida!</p>
                        <img src={uploadedScreenshotUrl} alt="Screenshot" className="max-w-xs mx-auto rounded-xl" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-purple-400 mx-auto" />
                        <p className="text-white font-bold">Click para subir imagen</p>
                        <p className="text-sm text-gray-400">PNG, JPG hasta 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 border-purple-500/30 text-black hover:text-black font-bold"
                >
                  Volver
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!uploadedScreenshotUrl}
                  className="flex-1 h-14 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-black hover:text-black font-black text-lg rounded-xl disabled:opacity-50"
                >
                  Confirmar Pago
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/20 p-8 rounded-3xl">
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Confirmar Participación</h2>
              <p className="text-gray-400">Revisa tus datos antes de confirmar</p>
            </div>

            <div className="space-y-4 mb-6">
              <Card className="bg-black/30 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nombre</p>
                    <p className="text-white font-bold">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-bold">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">País</p>
                    <p className="text-white font-bold">{formData.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Premio</p>
                    <p className="text-white font-bold">{selectedPrize?.title}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 p-4 rounded-xl">
                <p className="text-gray-300 text-sm">Monto pagado: <span className="text-yellow-400 font-black text-lg">S/ {selectedPrize?.participation_cost}</span></p>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 h-12 border-purple-500/30 text-white font-bold"
              >
                Volver
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={participationMutation.isPending}
                className="flex-1 h-14 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black text-lg rounded-xl"
              >
                {participationMutation.isPending ? "Procesando..." : "¡Confirmar Participación!"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-500/30 p-12 rounded-3xl text-center">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-white mb-4">¡Ya Estás Participando! 🎉</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Tu participación está siendo verificada. Te notificaremos por email cuando esté confirmada.
              <span className="block mt-4 text-green-400 font-bold">
                El sorteo será transmitido en vivo por TikTok Live
              </span>
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-black/30 p-4 rounded-xl">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">Premio</p>
                <p className="text-gray-400 text-xs">{selectedPrize?.title}</p>
              </Card>
              <Card className="bg-black/30 p-4 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">Estado</p>
                <p className="text-yellow-400 text-xs font-bold">EN VERIFICACIÓN</p>
              </Card>
              <Card className="bg-black/30 p-4 rounded-xl">
                <Mail className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">Email</p>
                <p className="text-gray-400 text-xs">{formData.email}</p>
              </Card>
            </div>

            <Button
              onClick={() => window.location.href = createPageUrl("Home")}
              className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg rounded-xl"
            >
              Volver al Inicio
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}