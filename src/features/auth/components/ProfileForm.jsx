import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useUpdatePassword } from "../hooks/useUpdatePassword";

function InitialsAvatar({ name, email }) {
  const text = name || email || "?";
  const initials = text
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-semibold text-white">
      {initials}
    </div>
  );
}

export default function ProfileForm() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName ?? "");
  const [nameSuccess, setNameSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  function handleSaveName() {
    if (!newName.trim()) return;
    updateProfile.mutate(
      { displayName: newName.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
          setNameSuccess(true);
          setTimeout(() => setNameSuccess(false), 3000);
        },
      }
    );
  }

  function handleCancelName() {
    setNewName(user?.displayName ?? "");
    setIsEditingName(false);
  }

  function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Şifreler eşleşmiyor.");
      return;
    }
    updatePassword.mutate(
      { newPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
          setPasswordSuccess(true);
          setTimeout(() => setPasswordSuccess(false), 3000);
        },
        onError: (err) => setPasswordError(err.message),
      }
    );
  }

  return (
    <div className="space-y-8">
      {/* Profil bilgisi */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Profil Bilgisi</h2>
        <div className="flex items-center gap-4">
          <InitialsAvatar name={user?.displayName} email={user?.email} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.displayName || "—"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Görünen ad
          </label>
          {isEditingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={updateProfile.isPending}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {updateProfile.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={handleCancelName}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-800">
                {user?.displayName || "Henüz eklenmedi"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-xs font-medium text-gray-500 underline hover:text-gray-700"
              >
                Düzenle
              </button>
            </div>
          )}
          {updateProfile.isError && (
            <p className="text-xs text-red-600">{updateProfile.error.message}</p>
          )}
          {nameSuccess && (
            <p className="text-xs text-green-600">Görünen ad güncellendi.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            E-posta
          </label>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Şifre değiştirme */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Şifre Değiştir</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Yeni şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Şifre tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifreyi tekrar girin"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-green-600">Şifreniz güncellendi.</p>
          )}
          <button
            type="submit"
            disabled={updatePassword.isPending}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {updatePassword.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
