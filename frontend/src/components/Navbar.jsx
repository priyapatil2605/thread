import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        THREAD<span>.</span>
      </Link>
      <div className="links">
        <Link to="/catalog">Shop</Link>
        {user && <Link to="/wardrobe">Wardrobe</Link>}
        {user && <Link to="/outfits">Outfits</Link>}
        {user && <Link to="/orders">Orders</Link>}
        {user && (
          <Link to="/cart" style={{ position: 'relative' }}>
            Bag
            {cart.itemCount > 0 && (
              <span
                className="mono"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -16,
                  background: 'var(--thread)',
                  color: 'var(--bone)',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {cart.itemCount > 9 ? '9+' : cart.itemCount}
              </span>
            )}
          </Link>
        )}
        {user ? (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign Out
          </button>
        ) : (
          <Link to="/login">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
