"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { SiGithub, SiGoogle } from "react-icons/si";

export default function OAuthButtons() {
  const t = useTranslations();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <SiGoogle className="w-4 h-4 mr-2" />
          {t("sign_modal.google_sign_in")}
        </Button>
      )}

      {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGitHubLogin}
        >
          <SiGithub className="w-4 h-4 mr-2" />
          {t("sign_modal.github_sign_in")}
        </Button>
      )}
    </div>
  );
}

