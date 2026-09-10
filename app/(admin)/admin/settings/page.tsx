import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { getSetting, getSettingsForCategory } from "@/lib/settings/get";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { SettingField, GenericSettingsList } from "@/components/admin/SettingsEditor";
import type { SettingCategory } from "@prisma/client";

const CATEGORIES: SettingCategory[] = [
  "GENERAL",
  "BRAND",
  "EMAIL",
  "REGISTRATION",
  "VERIFICATION",
  "PRIVACY",
  "MODERATION",
  "NOTIFICATIONS",
  "SEO",
  "COMMUNITY",
];

export default async function AdminSettingsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_SETTINGS)) return <ForbiddenNotice />;

  const [heroTitle, heroSubtitle, heroDescription] = await Promise.all([
    getSetting("GENERAL", "heroTitle", "SUBZWARI GLOBAL"),
    getSetting("GENERAL", "heroSubtitle", "SUBZWARI's ARE ONE"),
    getSetting(
      "GENERAL",
      "heroDescription",
      "Connecting Subzwari families, professionals and communities across the world.",
    ),
  ]);

  const categorySettings = await Promise.all(
    CATEGORIES.map(async (category) => ({
      category,
      settings: (await getSettingsForCategory(category)).filter(
        (s) => !(category === "GENERAL" && ["heroTitle", "heroSubtitle", "heroDescription"].includes(s.key)),
      ),
    })),
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          <SettingField category="GENERAL" settingKey="heroTitle" label="Hero title" initialValue={heroTitle} />
          <SettingField category="GENERAL" settingKey="heroSubtitle" label="Hero subtitle" initialValue={heroSubtitle} />
          <SettingField
            category="GENERAL"
            settingKey="heroDescription"
            label="Hero description"
            initialValue={heroDescription}
            multiline
          />
        </div>
      </Card>

      {categorySettings.map(({ category, settings }) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category.charAt(0) + category.slice(1).toLowerCase()}</CardTitle>
          </CardHeader>
          <GenericSettingsList category={category} settings={settings as any} />
        </Card>
      ))}
    </div>
  );
}
