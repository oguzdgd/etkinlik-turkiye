import { ProfileForm } from "@features/auth";

export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Profilim</h1>
      <ProfileForm />
    </section>
  );
}
