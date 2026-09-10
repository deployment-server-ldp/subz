import { VerifiedBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileActions } from "@/components/public/ProfileActions";

type VisibleProfile = {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profession: string | null;
  company: string | null;
  industry: string | null;
  education: string | null;
  ancestralRegion: string | null;
  verificationStatus: string;
  country: { name: string } | null;
  city: { name: string } | null;
  professionalCategories: { categoryId: string; category: { name: string } }[];
};

export function ProfileDetail({
  profile,
  isOwner,
  signedIn,
}: {
  profile: VisibleProfile;
  isOwner: boolean;
  signedIn: boolean;
}) {
  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {[profile.city?.name, profile.country?.name].filter(Boolean).join(", ") || "Location not set"}
        </p>
        {profile.profession ? <p className="text-muted-foreground">{profile.profession}</p> : null}
        {profile.verificationStatus === "VERIFIED" ? (
          <div className="mt-2">
            <VerifiedBadge />
          </div>
        ) : null}
      </div>

      {profile.bio ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </Card>
      ) : null}

      {profile.company || profile.industry || profile.education || profile.professionalCategories.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Professional</CardTitle>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {profile.company ? (
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{profile.company}</dd>
              </div>
            ) : null}
            {profile.industry ? (
              <div>
                <dt className="text-muted-foreground">Industry</dt>
                <dd>{profile.industry}</dd>
              </div>
            ) : null}
            {profile.education ? (
              <div>
                <dt className="text-muted-foreground">Education</dt>
                <dd>{profile.education}</dd>
              </div>
            ) : null}
          </dl>
          {profile.professionalCategories.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.professionalCategories.map((pc) => (
                <span key={pc.categoryId} className="rounded-full bg-muted px-3 py-1 text-xs">
                  {pc.category.name}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      {profile.ancestralRegion ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Family</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">Ancestral region: {profile.ancestralRegion}</p>
        </Card>
      ) : null}

      {!isOwner && signedIn ? (
        <div className="mt-8">
          <ProfileActions profileId={profile.id} />
        </div>
      ) : !signedIn ? (
        <p className="mt-8 text-sm text-muted-foreground">
          <a href="/login" className="text-accent hover:underline">
            Sign in
          </a>{" "}
          to connect with this member.
        </p>
      ) : null}
    </div>
  );
}
