"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function MagicLinkForm() {
  const t = useTranslations();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("sign_modal.email_required"));
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("sign_modal.email_invalid"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("Magic link error:", error);
        toast.error(error.message || t("sign_modal.magic_link_error"));
        return;
      }

      setEmailSent(true);
      toast.success(t("sign_modal.magic_link_sent"));
    } catch (err) {
      console.error("Magic link error:", err);
      toast.error(t("sign_modal.magic_link_error"));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {t("sign_modal.check_your_email")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("sign_modal.magic_link_description", { email })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
          className="w-full"
        >
          {t("sign_modal.try_another_email")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("sign_modal.sending")}
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            {t("sign_modal.send_magic_link")}
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        {t("sign_modal.magic_link_tip")}
      </p>
    </form>
  );
}

