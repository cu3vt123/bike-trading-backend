import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Briefcase,
  Code2,
  Monitor,
  Server,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  nameKey: string;
  roleKey: string;
  icon: LucideIcon;
  iconClassName: string;
};

const MEMBERS: Member[] = [
  {
    id: "huong",
    nameKey: "aboutUs.members.huong.name",
    roleKey: "aboutUs.members.huong.role",
    icon: Sparkles,
    iconClassName: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "duyQuang-management",
    nameKey: "aboutUs.members.duyQuang.name",
    roleKey: "aboutUs.members.duyQuang.roleManagement",
    icon: Briefcase,
    iconClassName: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "duyQuang-frontend",
    nameKey: "aboutUs.members.duyQuang.name",
    roleKey: "aboutUs.members.duyQuang.roleFrontend",
    icon: Code2,
    iconClassName: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "xuanHoang",
    nameKey: "aboutUs.members.xuanHoang.name",
    roleKey: "aboutUs.members.xuanHoang.role",
    icon: Monitor,
    iconClassName: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    id: "minhQuan",
    nameKey: "aboutUs.members.minhQuan.name",
    roleKey: "aboutUs.members.minhQuan.role",
    icon: Server,
    iconClassName: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "anhBao",
    nameKey: "aboutUs.members.anhBao.name",
    roleKey: "aboutUs.members.anhBao.role",
    icon: Database,
    iconClassName: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
];

export default function AboutUsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("aboutUs.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("aboutUs.subtitle")}</p>
        <p className="mx-auto mt-6 max-w-3xl text-left text-sm leading-relaxed text-muted-foreground sm:text-center sm:text-base">
          {t("aboutUs.heroLead")}
        </p>
      </header>

      <section className="mb-14 space-y-10">
        <div className="rounded-2xl border border-border bg-muted/30 px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="text-lg font-semibold text-foreground">
            {t("aboutUs.missionTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("aboutUs.missionBody")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="text-lg font-semibold text-foreground">
            {t("aboutUs.visionTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("aboutUs.visionBody")}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("aboutUs.valuesTitle")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{t("aboutUs.value1")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{t("aboutUs.value2")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{t("aboutUs.value3")}</span>
            </li>
          </ul>
        </div>
      </section>

      <h2 className="mb-8 text-center text-xl font-semibold tracking-tight">
        {t("aboutUs.teamSectionTitle")}
      </h2>

      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-label={t("aboutUs.teamSectionTitle")}
      >
        {MEMBERS.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.id}>
              <article
                className={cn(
                  "flex h-full flex-col items-center rounded-xl border border-border bg-card px-5 py-8 text-center shadow-sm transition-shadow",
                  "hover:shadow-md hover:ring-1 hover:ring-primary/20",
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                    m.iconClassName,
                  )}
                  aria-hidden
                >
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {t(m.nameKey)}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(m.roleKey)}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
