import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import './Auth.css'

function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!form.email.trim()) {
      setError('Enter your email address.')
      return
    }

    if (!form.password) {
      setError('Enter your password.')
      return
    }

    try {
      setLoading(true)

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        })

      if (signInError) {
        throw signInError
      }

      navigate('/')
    } catch (err) {
      setError(
        err.message ||
          'Unable to login. Please try again.'
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
              Your market.
              <br />
              Your edge.
            </h1>

            <p>
              Financial news, market analysis
              and economic events in one focused platform.
            </p>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">

            <div className="auth-heading">
              <span className="auth-kicker">
                WELCOME BACK
              </span>

              <h2>Login to Tradxa</h2>

              <p>
                Access your account and continue to the markets.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <label className="auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </label>

              <div
                style={{
                  width: '100%',
                  textAlign: 'right',
                  marginTop: '-6px',
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#67c9b8',
                    fontSize: '11px',
                    fontWeight: '700',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

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
                  ? 'Logging in...'
                  : 'Login'}
              </button>

            </form>

            <p className="auth-switch">
              Don&apos;t have an account?{' '}

              <Link to="/register">
                Create account
              </Link>
            </p>

          </div>
        </div>

      </section>
    </main>
  )
}

export default Login