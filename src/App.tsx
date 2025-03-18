import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Aside from "./components/Aside";
import Chat from "./components/Chat";
import Auth from "./components/Login";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./db/firebase";
import Loading from "./components/Loading";
import NoPage from "./components/NoPage";

const App: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <Loading text="Loading..." />;
  }

  if (error) {
    return <NoPage text={error.message} />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <div className="flex">
                <Aside />
                <Chat />
              </div>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </Router>
  );
};

export default App;
