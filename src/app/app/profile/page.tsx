import { getUserProfile } from "@/features/completion/queries/completion";
import { UserProfileView } from "@/features/profile/components/user-profile-view";
import { requireAuth } from "@/lib/require-auth";

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await getUserProfile(session.user.id);
  if (!user) {
    return (
      <div className="dq-card rounded-xl p-8 text-center text-sm text-[var(--muted-foreground)]">
        Profile not found.
      </div>
    );
  }

  return <UserProfileView user={user} />;
}
