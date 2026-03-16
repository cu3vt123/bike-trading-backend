import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("support.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("support.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{t("support.faq")}</CardTitle>
            <CardDescription>{t("support.faqDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">{t("support.faqSafeBuy")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("support.faqSafeBuyAns")}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">{t("support.faqDeposit")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("support.faqDepositAns")}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">{t("support.faqSeller")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("support.sellerFlow")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{t("support.contact")}</CardTitle>
            <CardDescription>{t("support.contactChatDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">{t("support.email")}</div>
                <a
                  href="mailto:support@shopbike.example.com"
                  className="text-sm text-primary hover:underline"
                >
                  support@shopbike.example.com
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("support.emailResponse")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">{t("support.docs")}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Trans i18nKey="support.docsHint" components={{ 0: <Link to="/" className="text-primary hover:underline" />, 1: <Link to="/profile" className="text-primary hover:underline" /> }} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/">{t("support.goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
