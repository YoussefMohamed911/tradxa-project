import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import "react-phone-number-input/style.css";
import "./Auth.css";

import { supabase } from "../lib/supabase";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordMatches = useMemo(() => {
    if (!form.confirmPassword) {
      return true;
    }

    return form.password === form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  const phoneIsValid = useMemo(() => {
    if (!phone) {
      return false;
    }

    return isValidPhoneNumber(phone);
  }, [phone]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (!phoneIsValid) {
      setError("Enter a valid phone number.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!passwordMatches) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.acceptTerms) {
      setError("You must accept the Terms & Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),

        password: form.password,

        options: {
          data: {
            full_name: form.name.trim(),
            display_name: form.name.trim(),
            phone: phone,
            phone_number: phone,
          },

          emailRedirectTo: "http://localhost:5173/login",
        },

        emailRedirectTo: "https://tradxa.vercel.app/login",
      });

      if (signUpError) {
        throw signUpError;
      }

      console.log("Registered user:", data);

      setSuccess(true);
    } catch (err) {
      console.error(err);

      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <aside className="auth-brand-panel">
            <div>
              <span className="auth-kicker">TRADXA</span>

              <h1>
                Check your
                <br />
                email.
              </h1>

              <p>Your Tradxa account is almost ready.</p>
            </div>
          </aside>

          <div className="auth-form-panel">
            <div className="auth-form-wrap">
              <div className="auth-heading">
                <span className="auth-kicker">EMAIL VERIFICATION</span>

                <h2>Verify your email</h2>

                <p>We sent a verification link to:</p>
              </div>

              <div className="auth-success-box">
                <strong>{form.email}</strong>

                <p>
                  Open your email and click the verification link before logging
                  in.
                </p>
              </div>

              <Link to="/login" className="auth-primary-btn auth-link-btn">
                Go to Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand-panel">
          <div>
            <span className="auth-kicker">TRADXA</span>

            <h1>
              One account.
              <br />
              Global markets.
            </h1>

            <p>Create your account to access Tradxa from anywhere.</p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-heading">
              <span className="auth-kicker">CREATE YOUR ACCOUNT</span>

              <h2>Join Tradxa</h2>

              <p>Enter your details below to get started.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Full name</span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  minLength="2"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <div className="auth-field">
                <span>Phone number</span>

                <PhoneInput
                  international
                  defaultCountry="EG"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Phone number"
                  className={
                    phone && !phoneIsValid
                      ? "tradxa-phone-input has-error"
                      : "tradxa-phone-input"
                  }
                />

                {phone && !phoneIsValid && (
                  <small className="auth-error">
                    Enter a valid international phone number.
                  </small>
                )}
              </div>

              <div className="auth-password-grid">
                <label className="auth-field">
                  <span>Password</span>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />

                  {!passwordMatches && (
                    <small className="auth-error">
                      Passwords do not match.
                    </small>
                  )}
                </label>
              </div>

              <label className="auth-check">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                />

                <span>I agree to the Terms & Privacy Policy.</span>
              </label>

              {error && <div className="auth-message-error">{error}</div>}

              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
