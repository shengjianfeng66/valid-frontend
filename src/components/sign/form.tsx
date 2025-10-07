"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import OAuthButtons from "./oauth-buttons";
import MagicLinkForm from "./magic-link-form";

export default function SignForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("sign_modal.sign_in_title")}
          </CardTitle>
          <CardDescription>
            {t("sign_modal.sign_in_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth 登录按钮 */}
          <OAuthButtons />

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("sign_modal.or_continue_with")}
              </span>
            </div>
          </div>

          {/* Magic Link 邮箱登录 */}
          <MagicLinkForm />
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        {t("sign_modal.terms_text")}{" "}
        <a href="/terms-of-service" target="_blank">
          {t("sign_modal.terms_of_service")}
        </a>{" "}
        {t("sign_modal.and")}{" "}
        <a href="/privacy-policy" target="_blank">
          {t("sign_modal.privacy_policy")}
        </a>
        .
      </div>
    </div>
  );
}
