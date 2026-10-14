import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  removeFromCartWithBackendSync,
  updateCartItemQuantityWithBackendSync,
  clearCartFromBackend,
} from "../../Redux/cartSlice";
import BackButton from "../Common/BackButton/BackButton";
import "./Cart.css";


const CartPage = () => {
  const navigate = useNavigate();
  const { category, subcategory, productName } = useParams();
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-back-row">
          <BackButton to="/" label="Back" />
        </div>
        <h2 className="cart-empty-message">Your cart is empty!</h2>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-back-row">
        <BackButton to="/" label="Back" />
      </div>
      <div className="cart-container">
      <div className="cart-items-section">
        <h2 className="cart-title">Shopping Cart</h2>
        {cartItems.map((item) => (
          <div key={item.itemId || item.productId} className="cart-item">
            <div className="cart-item-image-details-mobile">
              <img src={item.image} alt={item.title} />
              <div className="cart-details-mobile">
                <h4>{item.title}</h4>
                <p>₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="cart-actions">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!item.itemId) return;
                  try {
                    if (item.quantity <= 1) {
                      await dispatch(removeFromCartWithBackendSync(item.itemId)).unwrap();
                    } else {
                      await dispatch(
                        updateCartItemQuantityWithBackendSync({
                          itemId: item.itemId,
                          quantity: item.quantity - 1,
                        })
                      ).unwrap();
                    }
                  } catch (error) {
                    console.error("Failed to update cart:", error);
                  }
                }}
              >
                -
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!item.itemId) return;
                  try {
                    await dispatch(
                      updateCartItemQuantityWithBackendSync({
                        itemId: item.itemId,
                        quantity: item.quantity + 1,
                      })
                    ).unwrap();
                  } catch (error) {
                    console.error("Failed to update cart:", error);
                  }
                }}
              >
                +
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!item.itemId) return;
                  try {
                    await dispatch(removeFromCartWithBackendSync(item.itemId)).unwrap();
                  } catch (error) {
                    console.error("Failed to remove from cart:", error);
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-summary-title">Summary</div>
        <div className="cart-total">Total: ₹{totalAmount}</div>
        <button
          className="clear-cart-btn"
          onClick={async () => {
            try {
              await dispatch(clearCartFromBackend()).unwrap();
            } catch (error) {
              console.error("Failed to clear cart:", error);
            }
          }}
        >
          Clear Cart
        </button>
        <button
          className="place-order-btn"
          onClick={() => navigate("/order-checkout")}
        >
          Place Order
        </button>
      </div>
    </div>
    </div>
  );
};

export default CartPage;