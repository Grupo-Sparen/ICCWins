import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CreditCard, Upload, CheckCircle2, Loader2, PartyPopper, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "../utils";

export default function SubscriptionModal({ plan, currency, language, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isPeru, setIsPeru] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    screenshot: null
  });

  // Detect if user is from Peru
  React.useEffect(() => {
    base44.functions.invoke('detectCountry').then(response => {
      const data = response.data;
      setIsPeru(data.isPeru);
      console.log('🌍 User is from Peru:', data.isPeru);
    }).catch(() => {
      setIsPeru(false);
    });
  }, []);

  // Pre-fill user email
  React.useEffect(() => {
    base44.auth.me().then(user => {
      if (user) {
        setFormData(prev => ({ 
          ...prev, 
          name: user.full_name || "",
          email: user.email || "" 
        }));
      }
    }).catch(() => {});
  }, []);
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ show: false, message: "" });

  const queryClient = useQueryClient();

  const t = {
    es: {
      title: "Suscripción",
      stripe: "Pago Seguro con Stripe",
      yape: "Pago con Yape",
      name: "Nombre completo",
      email: "Correo electrónico",
      uploadScreenshot: "Sube tu comprobante de Yape",
      yapeTo: "Número Yape: 999 999 999",
      amount: "Monto a pagar",
      cancel: "Cancelar",
      subscribe: "Ir a Pago Seguro",
      uploading: "Subiendo...",
      processing: "Procesando...",
      success: "¡Suscripción exitosa!",
      successMessage: "Tu suscripción ha sido creada. Serás redirigido a la confirmación.",
      secure: "Pago 100% seguro con Stripe"
    },
    en: {
      title: "Subscription",
      stripe: "Secure Payment with Stripe",
      yape: "Pay with Yape",
      name: "Full name",
      email: "Email address",
      uploadScreenshot: "Upload your Yape receipt",
      yapeTo: "Yape Number: 999 999 999",
      amount: "Amount to pay",
      cancel: "Cancel",
      subscribe: "Go to Secure Payment",
      uploading: "Uploading...",
      processing: "Processing...",
      success: "Subscription successful!",
      successMessage: "Your subscription has been created. You will be redirected to confirmation.",
      secure: "100% secure payment with Stripe"
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
      // Verificar si el usuario está autenticado
      const currentUser = await base44.auth.me().catch(() => null);
      
      if (!currentUser) {
        setAlertDialog({
          show: true,
          message: language === "es" 
            ? "Debes iniciar sesión o crear una cuenta para suscribirte."
            : "You must login or create an account to subscribe."
        });
        setIsSubmitting(false);
        return;
      }

      // Map plan duration to Stripe price IDs
      const stripePriceIds = {
        1: currency === "PEN" ? "price_1SoRnvAK7SnVWQyCUBZ1ZmKr" : "price_1SoRnvAK7SnVWQyCsFd5ZBlE",
        3: currency === "PEN" ? "price_1SoRnvAK7SnVWQyCSeow3Eg2" : "price_1SoRnvAK7SnVWQyCHDJQimUl",
        6: currency === "PEN" ? "price_1SoRnvAK7SnVWQyCbK91VDxM" : "price_1SoRnvAK7SnVWQyCphKfY6fw"
      };

      const priceId = stripePriceIds[plan.duration_months];
      if (!priceId) throw new Error("Invalid subscription plan");

      // Check if running in iframe
      if (window.self !== window.top) {
        setAlertDialog({
          show: true,
          message: language === "es" 
            ? "El pago solo funciona desde la app publicada. Por favor abre en una nueva pestaña."
            : "Payment only works from the published app. Please open in a new tab."
        });
        setIsSubmitting(false);
        return;
      }

      const response = await base44.functions.invoke('stripeCheckout', {
        type: 'subscription',
        priceId,
        planId: plan.id
      });

      if (response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      setAlertDialog({
        show: true,
        message: language === "es" 
          ? "Error al procesar el pago. Por favor intenta nuevamente."
          : "Error processing payment. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
    window.location.href = createPageUrl("MiSuscripcion");
  };

  const isFormValid = () => {
    return true; // Stripe handles validation
  };

  // Alert Dialog
  if (alertDialog.show) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-2 border-purple-500/40 p-8 rounded-3xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-xl text-white mb-6">{alertDialog.message}</p>
          <div className="flex gap-3">
            {alertDialog.message.includes("iniciar sesión") || alertDialog.message.includes("login") ? (
              <>
                <Button
                  onClick={() => {
                    setAlertDialog({ show: false, message: "" });
                    base44.auth.redirectToLogin(window.location.href);
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                >
                  {language === "es" ? "Iniciar Sesión" : "Login"}
                </Button>
                <Button
                  onClick={() => setAlertDialog({ show: false, message: "" })}
                  variant="outline"
                  className="flex-1 h-12 border-purple-500/50 text-white hover:bg-purple-500/10"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setAlertDialog({ show: false, message: "" })}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                {language === "es" ? "Entendido" : "OK"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="bg-gradient-to-br from-green-900/95 to-cyan-900/95 border-2 border-green-500/40 p-12 rounded-3xl max-w-md w-full text-center">
          <PartyPopper className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">{translations.success}</h2>
          <p className="text-xl text-gray-300 mb-8">{translations.successMessage}</p>
          <Button
            onClick={handleSuccessClose}
            className="w-full h-14 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black font-black text-lg rounded-xl"
          >
            Ir a Mi Perfil
          </Button>
        </Card>
      </div>
    );
  }

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

        <Card className="bg-gradient-to-br from-green-600/20 to-cyan-600/20 border border-green-500/30 p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-black text-white">{translations.stripe}</h3>
              <p className="text-sm text-green-300">{translations.secure}</p>
            </div>
          </div>
        </Card>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className={`grid w-full ${isPeru ? 'grid-cols-2' : 'grid-cols-1'} mb-6 bg-black/30`}>
            <TabsTrigger value="stripe" className="data-[state=active]:bg-green-600">
              {translations.stripe}
            </TabsTrigger>
            {isPeru && (
              <TabsTrigger value="yape" className="data-[state=active]:bg-purple-600">
                {translations.yape}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Stripe Payment */}
          <TabsContent value="stripe" className="space-y-4">
            <Card className="bg-green-600/20 border border-green-500/30 p-4 rounded-xl">
              <p className="text-white font-bold text-center">{translations.amount}: {symbol}{price}</p>
              <p className="text-xs text-green-300 text-center mt-2">Se abrirá Stripe Checkout de forma segura</p>
            </Card>
          </TabsContent>

          {/* Yape Payment - Only for Peru */}
          {isPeru && (
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
        </Tabs>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 border-purple-500/30 text-black bg-white/90 hover:bg-white hover:text-black font-bold"
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