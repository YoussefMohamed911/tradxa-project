import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import './Auth.css'

function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setReady(true)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === 'PASSWORD_RECOVERY' ||
          event === 'SIGNED_IN'
        ) {
          setReady(true)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        throw error
      }

      navigate('/login')
    } catch (err) {
      setError(
        err.message ||
        'Unable to update password.'
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
              Secure your
              <br />
              account.
            </h1>

            <p>
              Create a new password for
              your Tradxa account.
            </p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">

            <div className="auth-heading">
              <span className="auth-kicker">
                NEW PASSWORD
              </span>

              <h2>
                Reset password
              </h2>
            </div>

            {!ready ? (
              <div className="auth-message-error">
                Open this page using the password
                reset link sent to your email.
              </div>
            ) : (
              <form
                className="auth-form"
                onSubmit={handleSubmit}
              >

                <label className="auth-field">
                  <span>New password</span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                  />
                </label>

                <label className="auth-field">
                  <span>
                    Confirm password
                  </span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repeat new password"
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
                    ? 'Updating...'
                    : 'Update password'}
                </button>

              </form>
            )}

          </div>
        </div>

      </section>
    </main>
  )
}

export default ResetPassword