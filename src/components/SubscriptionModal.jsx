import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CreditCard, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubscriptionModal({ plan, currency, language, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    screenshot: null
  });
  const [cardData, setCardData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const t = {
    es: {
      title: "Suscripción",
      yape: "Pago con Yape",
      card: "Pago con Tarjeta",
      name: "Nombre completo",
      email: "Correo electrónico",
      uploadScreenshot: "Sube tu comprobante de Yape",
      yapeTo: "Número Yape: 999 999 999",
      amount: "Monto a pagar",
      cardNumber: "Número de tarjeta",
      expiryDate: "Fecha de vencimiento (MM/YY)",
      cvv: "CVV",
      cancel: "Cancelar",
      subscribe: "Suscribirse",
      uploading: "Subiendo...",
      processing: "Procesando...",
      success: "¡Suscripción exitosa!",
      successMessage: "Tu suscripción ha sido creada. Recibirás un email de confirmación."
    },
    en: {
      title: "Subscription",
      yape: "Pay with Yape",
      card: "Pay with Card",
      name: "Full name",
      email: "Email address",
      uploadScreenshot: "Upload your Yape receipt",
      yapeTo: "Yape Number: 999 999 999",
      amount: "Amount to pay",
      cardNumber: "Card number",
      expiryDate: "Expiry date (MM/YY)",
      cvv: "CVV",
      cancel: "Cancel",
      subscribe: "Subscribe",
      uploading: "Uploading...",
      processing: "Processing...",
      success: "Subscription successful!",
      successMessage: "Your subscription has been created. You will receive a confirmation email."
    }
  };

  const translations = t[language];

  const price = currency === "PEN" ? plan.price_pen : plan.price_usd;
  const symbol = currency === "PEN" ? "S/" : "$";

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentUser = await base44.auth.me();
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      const subscriptionData = {
        user_email: paymentMethod === "yape" ? formData.email : cardData.email,
        user_name: paymentMethod === "yape" ? formData.name : cardData.name,
        plan_id: plan.id,
        plan_name: plan.name_es,
        amount_paid: price,
        currency: currency,
        status: "pending",
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        payment_method: paymentMethod === "yape" ? "Yape (Manual)" : "Tarjeta de Crédito",
        auto_renew: true
      };

      await base44.entities.Subscription.create(subscriptionData);
      
      queryClient.invalidateQueries(["user-subscription"]);
      
      alert(translations.success + "\n\n" + translations.successMessage);
      onClose();
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Error al procesar la suscripción. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (paymentMethod === "yape") {
      return formData.name && formData.email && uploadedScreenshotUrl;
    } else {
      return cardData.name && cardData.email && cardData.cardNumber && cardData.expiryDate && cardData.cvv;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-2 border-purple-500/40 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-white">{translations.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-black text-white">{plan.name_es}</h3>
          <p className="text-xl text-purple-300 font-bold">{symbol}{price}</p>
        </div>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/30">
            <TabsTrigger value="yape" className="data-[state=active]:bg-purple-600">
              {translations.yape}
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-purple-600">
              <CreditCard className="w-4 h-4 mr-2" />
              {translations.card}
            </TabsTrigger>
          </TabsList>

          {/* Yape Payment */}
          <TabsContent value="yape" className="space-y-6">
            <Card className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-xl">
              <p className="text-white font-bold text-center">{translations.yapeTo}</p>
              <p className="text-yellow-400 font-black text-center text-xl">{translations.amount}: {symbol}{price}</p>
            </Card>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-bold mb-2 block">{translations.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/30 border-purple-500/30 text-white"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">{translations.email}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-black/30 border-purple-500/30 text-white"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-3 block flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {translations.uploadScreenshot}
                </Label>
                <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-6 text-center hover:border-purple-500/60 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {isUploading ? (
                      <div className="text-purple-400">{translations.uploading}</div>
                    ) : uploadedScreenshotUrl ? (
                      <div className="space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                        <p className="text-green-400 font-bold">¡Comprobante subido!</p>
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
            </div>
          </TabsContent>

          {/* Card Payment */}
          <TabsContent value="card" className="space-y-4">
            <div>
              <Label className="text-white font-bold mb-2 block">{translations.name}</Label>
              <Input
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                className="bg-black/30 border-purple-500/30 text-white"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <Label className="text-white font-bold mb-2 block">{translations.email}</Label>
              <Input
                type="email"
                value={cardData.email}
                onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                className="bg-black/30 border-purple-500/30 text-white"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label className="text-white font-bold mb-2 block">{translations.cardNumber}</Label>
              <Input
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                maxLength={19}
                className="bg-black/30 border-purple-500/30 text-white"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-bold mb-2 block">{translations.expiryDate}</Label>
                <Input
                  value={cardData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardData({ ...cardData, expiryDate: value });
                  }}
                  maxLength={5}
                  className="bg-black/30 border-purple-500/30 text-white"
                  placeholder="MM/YY"
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">{translations.cvv}</Label>
                <Input
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  maxLength={4}
                  type="password"
                  className="bg-black/30 border-purple-500/30 text-white"
                  placeholder="123"
                />
              </div>
            </div>

            <Card className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-xl mt-4">
              <p className="text-white font-bold text-center">{translations.amount}: {symbol}{price}</p>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 border-purple-500/30 text-white hover:bg-white/10"
          >
            {translations.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="flex-1 h-14 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black font-black text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {translations.processing}
              </>
            ) : (
              translations.subscribe
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}