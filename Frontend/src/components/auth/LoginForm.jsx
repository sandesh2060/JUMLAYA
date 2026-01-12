// ============================================
// LoginForm.jsx - Allow rider login but restrict features until approved
// Path: Frontend/src/components/auth/LoginForm.jsx
// ============================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useLanguage } from "@hooks/useLanguage";
import { Button } from "@components/common/Button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export const LoginForm = () => {
  const { t } = useLanguage() || {};
  const translate = (key) => (typeof t === "function" ? t(key) : key);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔐 LoginForm: Submitting login...");

      const result = await login(formData);

      console.log("📥 LoginForm: Login result:", {
        success: result?.success,
        hasUser: !!result?.user,
        userRole: result?.user?.role,
        isAdmin: result?.user?.isAdmin,
      });

      if (result?.success && result?.user) {
        const user = result.user;
        const userRole = user.role?.toLowerCase();

        console.log("🔍 LoginForm: Checking user role:", {
          role: userRole,
          isAdmin: user.isAdmin,
          hasRiderProfile: !!user.riderProfile,
          isApproved: user.riderProfile?.isApproved,
        });

        // ✅ Route based on role
        if (
          userRole === "admin" ||
          userRole === "superadmin" ||
          user.isAdmin === true
        ) {
          console.log("✅ LoginForm: Redirecting to admin dashboard");
          toast.success("Welcome Admin! 👨‍💼");
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "rider") {
          console.log("✅ LoginForm: Rider login - checking approval status");

          // ✅ UPDATED: Allow login but show different messages based on approval status
          const isApproved = user.riderProfile?.isApproved === true;

          if (isApproved) {
            toast.success(`Welcome ${user.firstname}! 🚴‍♂️`);
          } else {
            toast.success(
              `Welcome ${user.firstname}! Your account is pending approval.`,
              {
                duration: 5000,
                icon: "⏳",
              }
            );
          }

          // Always redirect to rider dashboard (restrictions handled there)
          navigate("/rider/dashboard", { replace: true });
        } else {
          console.log("✅ LoginForm: Redirecting to home (customer)");
          toast.success(
            t("loginSuccess") || `Welcome back, ${user.firstname}!`
          );

          // Regular customers go to home or intended page
          const intendedPath = window.history.state?.usr?.from?.pathname;
          navigate(intendedPath || "/", { replace: true });
        }
      } else {
        console.error("❌ LoginForm: Login failed - invalid result structure");
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ LoginForm: Login error:", err);
      // Error is already handled by login function
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("email") || "Email Address"}
        </label>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("password") || "Password"}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {t("rememberMe") || "Remember me"}
          </span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {t("forgotPassword") || "Forgot password?"}
        </a>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white py-2 rounded-lg font-semibold"
      >
        {loading ? t("loading") || "Signing in..." : t("login") || "Sign In"}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("dontHaveAccount") || "Don't have an account?"}{" "}
        <a
          href="/register"
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
        >
          {t("register") || "Sign up"}
        </a>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            or
          </span>
        </div>
      </div>

      <a
        href="/register?role=rider"
        className="block text-center py-2 px-4 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold transition-colors"
      >
        🚴‍♂️ Join as Delivery Rider
      </a>
    </form>
  );
};
