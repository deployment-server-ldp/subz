import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { getVisibleProfileBySlug } from "@/modules/directory/service";
import { ProfileDetail } from "@/components/public/ProfileDetail";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const session = await getCurrentSession();
  const profile = await getVisibleProfileBySlug(params.slug, !!session?.user, session?.user.profileId ?? undefined);
  if (!profile) return {};
  return { title: `${profile.firstName} ${profile.lastName} — Professional Profile` };
}

export default async function ProfessionalProfilePage({ params }: { params: { slug: string } }) {
  const session = await getCurrentSession();
  const profile = await getVisibleProfileBySlug(params.slug, !!session?.user, session?.user.profileId ?? undefined);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ProfileDetail
        profile={profile}
        isOwner={session?.user.profileId === profile.id}
        signedIn={!!session?.user}
      />
    </div>
  );
}
