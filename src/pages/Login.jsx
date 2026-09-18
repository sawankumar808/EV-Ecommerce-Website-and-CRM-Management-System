import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Zap,
  BatteryCharging,
  ShieldCheck,
} from "lucide-react";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const defaultRoles = [
  {
    value: "ADMIN",
    label: "CRM Admin",
  },
  {
    value: "SALES",
    label: "Sales Executive",
  },
  {
    value: "VENDOR",
    label: "Vendor Partner",
  },
];

export default function Login() {
  const [roles, setRoles] =
    useState(defaultRoles);

  const [role, setRole] =
    useState("ADMIN");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [bgImage, setBgImage] =
    useState(
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200"
    );

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "voltra_site_settings"
      );

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          parsed.loginBgImage
        ) {
          setBgImage(
            parsed.loginBgImage
          );
        }
      } catch {
        // ignore
      }
    }

    client
      .get(
        "/public-roles/"
      )
      .then((response) => {
        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : response.data.results ||
              [];

        if (data.length) {
          setRoles(data);
          setRole(
            data[0].value
          );
        }
      })
      .catch((error) => {
        console.error(
          "Could not load roles:",
          error
        );
      });
  }, []);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // AuthContext ke login function ko call kar rahe hain
      const userProfile =
        await login(
          username,
          password,
          role
        );

      const actualRole =
        (
          userProfile
            ?.custom_role_details
            ?.code ||
          userProfile
            ?.role ||
          role
        )
          .toString()
          .trim()
          .toUpperCase();

      // Fix: Strictly block karne ki bajaye user ko uske actual role ke hisab se dashboard par bhej denge
      if (
        actualRole ===
        "VENDOR"
      ) {
        navigate(
          "/vendor-dashboard",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          "/crm",
          {
            replace: true,
          }
        );
      }

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data
          ?.detail ||
        error.response?.data
          ?.non_field_errors?.[0] ||
        "Invalid credentials or server error."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white bg-cover bg-center"
        style={{
          backgroundImage:
            `url('${bgImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-volt flex items-center justify-center">
            <Zap
              size={20}
              className="text-ink"
            />
          </div>
          <p className="font-display font-bold tracking-wide text-lg">
            VOLTRA CRM
          </p>
        </div>

        <div className="relative z-10 my-auto py-8">
          <BatteryCharging
            size={40}
            className="text-volt mb-6"
          />

          <h1 className="font-display text-4xl font-extrabold leading-tight max-w-md">
            One charge, one dashboard — vendors, batteries and sales in sync.
          </h1>

          <p className="text-white/80 mt-4 max-w-sm text-sm leading-relaxed">
            Track every battery from batch to installation, manage vendor onboarding end to end, and run your sales pipeline without leaving one screen.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">
            Welcome back
          </h2>

          <p className="text-sm text-muted mb-6">
            Sign in using your username, email or mobile number.
          </p>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <ShieldCheck
                size={14}
              />
              Select Login Role
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white"
            >
              {roles.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          <label className="text-xs font-medium text-muted uppercase tracking-wide">
            Username / Email / Mobile
          </label>

          <input
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            className="w-full mt-1.5 mb-4 px-3 py-2.5 rounded-lg border border-black/10 text-sm"
            placeholder="admin / email / mobile"
            required
          />

          <label className="text-xs font-medium text-muted uppercase tracking-wide">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            className="w-full mt-1.5 mb-2 px-3 py-2.5 rounded-lg border border-black/10 text-sm"
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-3 my-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-ink text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : `Login as ${
                  roles.find(
                    (r) =>
                      r.value === role
                  )?.label ||
                  role
                }`}
          </button>

          <p className="text-xs text-muted mt-4 text-center">
            New vendor?{" "}
            <Link
              to="/vendor/register"
              className="text-emerald-600 font-medium"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}