import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setName("");
        return;
      }

      setUser(firebaseUser);

      try {
        const res = await fetch(
          `http://localhost:5000/api/users/${firebaseUser.uid}`
        );

        if (res.ok) {
          const data = await res.json();
          setName(data.name || "User");
        } else {
          setName("User");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setName("User");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Campus Placement</div>

      <ul className="navbar-links">
        {!user && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}

        {user && (
          <>
            <li className="navbar-username">Hello, {name}</li>
            <li className="navbar-logout" onClick={handleLogout}>
              Logout
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;