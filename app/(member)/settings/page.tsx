import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/components/member/ChangePasswordForm";
import { DeactivateAccountButton } from "@/components/member/DeactivateAccountButton";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-2xl font-semibold">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground">Email: {session!.user.email}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <ChangePasswordForm />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deactivate Account</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-muted-foreground">
          Deactivating your account signs you out and hides your profile from the community.
        </p>
        <DeactivateAccountButton />
      </Card>
    </div>
  );
}
