import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { prisma } from "@/lib/db/prisma";
import { ProfessionalInfoForm } from "@/components/member/ProfessionalInfoForm";
import { ProfileTabs } from "@/components/member/ProfileTabs";

export default async function ProfileProfessionalPage() {
  const session = await getCurrentSession();
  const profile = await getOwnProfile(session!.user.id);
  if (!profile) return null;

  const categories = await prisma.professionalCategory.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>
      <ProfileTabs active="professional" />
      <div className="mt-6">
        <ProfessionalInfoForm
          categories={categories}
          initial={{
            profession: profile.profession ?? "",
            jobTitle: profile.jobTitle ?? "",
            company: profile.company ?? "",
            industry: profile.industry ?? "",
            skills: profile.skills.join(", "),
            education: profile.education ?? "",
            university: profile.university ?? "",
            linkedinUrl: profile.linkedinUrl ?? "",
            websiteUrl: profile.websiteUrl ?? "",
            categoryIds: profile.professionalCategories.map((pc) => pc.categoryId),
          }}
        />
      </div>
    </div>
  );
}
