import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import News from "./pages/News";
import Calendar from "./pages/Calendar";
import Markets from "./pages/Markets";
import Signals from "./pages/Signals";
import Books from "./pages/Books";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

import NewsArticle from './pages/NewsArticle'

import "./App.css";


import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <div className="app">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/news" element={<News />} />

        <Route path="/calendar" element={<Calendar />} />

        <Route path="/markets" element={<Markets />} />

        <Route path="/" element={<Home />} />

        <Route path="/news" element={<News />} />

        <Route path="/news/:slug" element={<NewsArticle />} />

        <Route
       path="/forgot-password"
       element={<ForgotPassword />}
       />

       <Route
      path="/reset-password"
       element={<ResetPassword />}
        />

        <Route
          path="/signals"
          element={
            <ProtectedRoute>
              <Signals />
            </ProtectedRoute>
          }
        />

        <Route path="/books" element={<Books />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
