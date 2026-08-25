import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User as UserIcon,
  Phone,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import AccountLayout from "../../components/account/AccountLayout";
import FormInput from "../../components/ui/FormInput";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// ─── Nigerian Phone Validation Schema ───────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required (min 2 characters)"),
  lastName: z.string().min(2, "Last name is required (min 2 characters)"),
  email: z.string().email("Valid email address required"),
  phone: z
    .string()
    .regex(
      /^(\+234|0)[0-9]{10}$/,
      "Must be a valid 11-digit Nigerian number (e.g. 08023456789)",
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || "U";

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      // API call to update user profile
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout
      title="Personal Profile"
      subtitle="Update your contact details to ensure fast delivery dispatch and accurate order receipts."
    >
      <div className="space-y-6 text-stone-900">
        {/* ── 1. Profile Header Card ───────────────────────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-heading font-black text-xl shadow-md shadow-primary/20">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 size={11} strokeWidth={3} />
              </div>
            </div>

            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-stone-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/70 border border-amber-900/10 px-2 py-0.5 rounded-md">
                  <ShieldCheck size={10} className="text-primary" /> Verified
                  Member
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
              Account ID
            </span>
            <span className="font-mono text-xs font-bold text-stone-800">
              #{user?.id ? user.id.slice(-8) : "CLIENT"}
            </span>
          </div>
        </div>

        {/* ── 2. Feedback Banners ───────────────────────────────────── */}
        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── 3. Profile Form ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div className="relative">
              <FormInput
                label="First Name"
                type="text"
                placeholder="Adebayo"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <UserIcon
                size={16}
                className="absolute right-4 top-10 text-stone-300 pointer-events-none"
              />
            </div>

            {/* Last Name */}
            <div className="relative">
              <FormInput
                label="Last Name"
                type="text"
                placeholder="Ogunlesi"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
              <UserIcon
                size={16}
                className="absolute right-4 top-10 text-stone-300 pointer-events-none"
              />
            </div>

            {/* Email (Read-Only) */}
            <div className="relative">
              <FormInput
                label="Email Address (Locked)"
                type="email"
                placeholder="user@example.com"
                error={errors.email?.message}
                disabled
                {...register("email")}
              />
              <Lock
                size={15}
                className="absolute right-4 top-10 text-stone-400 pointer-events-none"
              />
              <p className="text-[10px] text-stone-400 font-medium mt-1">
                Email address cannot be changed for account security reasons.
              </p>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <FormInput
                label="Nigerian Phone Number"
                type="tel"
                placeholder="0802 345 6789"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Phone
                size={16}
                className="absolute right-4 top-10 text-stone-300 pointer-events-none"
              />
              <p className="text-[10px] text-stone-400 font-medium mt-1">
                Used by delivery riders to call upon arrival.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-amber-950/10 flex items-center justify-between gap-4">
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              {isDirty
                ? "⚠️ You have unsaved changes"
                : "All information is up to date"}
            </span>

            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
};

export default ProfilePage;
