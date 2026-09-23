import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import "./Account.css";

function Account() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          full_name,
          email,
          phone,
          email_verified,
          created_at
        `,
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);

        setProfile({
          full_name: user.user_metadata?.full_name || "User",

          email: user.email || "",

          phone: user.user_metadata?.phone || "",

          email_verified: Boolean(user.email_confirmed_at),
        });
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <main className="account-page">
        <p>Loading account...</p>
      </main>
    );
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <div className="account-top">
          <span className="account-label">TRADXA ACCOUNT</span>

          <h1>{profile?.full_name}</h1>

          <p>Manage your Tradxa account information.</p>
        </div>

        <div className="account-info">
          <div className="account-row">
            <span>Name</span>
            <strong>{profile?.full_name || "—"}</strong>
          </div>

          <div className="account-row">
            <span>Email</span>
            <strong>{profile?.email || "—"}</strong>
          </div>

          <div className="account-row">
            <span>Phone</span>
            <strong>{profile?.phone || "—"}</strong>
          </div>

          <div className="account-row">
            <span>Email verification</span>

            <strong
              className={
                profile?.email_verified
                  ? "account-verified"
                  : "account-unverified"
              }
            >
              {profile?.email_verified ? "Verified" : "Not verified"}
            </strong>
          </div>
        </div>

        <button type="button" className="account-logout" onClick={handleLogout}>
          Logout
        </button>
      </section>
    </main>
  );
}

export default Account;
