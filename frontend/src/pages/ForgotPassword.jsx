import { useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import './Auth.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        )

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err) {
      setError(
        err.message ||
        'Unable to send reset email.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">

        <aside className="auth-brand-panel">
          <div>
            <span className="auth-kicker">
              TRADXA
            </span>

            <h1>
              Recover your
              <br />
              account.
            </h1>

            <p>
              We will send a secure password
              reset link to your email.
            </p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">

            <div className="auth-heading">
              <span className="auth-kicker">
                PASSWORD RECOVERY
              </span>

              <h2>
                Forgot password?
              </h2>

              <p>
                Enter the email associated
                with your Tradxa account.
              </p>
            </div>

            {success ? (
              <>
                <div className="auth-success-box">
                  <strong>
                    Check your email
                  </strong>

                  <p>
                    We sent a password reset
                    link to {email}.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="auth-primary-btn auth-link-btn"
                >
                  Back to Login
                </Link>
              </>
            ) : (
              <form
                className="auth-form"
                onSubmit={handleSubmit}
              >

                <label className="auth-field">
                  <span>
                    Email address
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="name@example.com"
                    required
                  />
                </label>

                {error && (
                  <div className="auth-message-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-primary-btn"
                  disabled={loading}
                >
                  {loading
                    ? 'Sending...'
                    : 'Send reset link'}
                </button>

              </form>
            )}

          </div>
        </div>

      </section>
    </main>
  )
}

export default ForgotPassword