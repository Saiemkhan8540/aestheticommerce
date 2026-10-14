import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartFromBackend } from '../Redux/cartSlice';
import { fetchFavoritesFromBackend } from '../Redux/favoritesSlice';

export const useCartPersistence = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  useEffect(() => {
    if (user && token) {
      // Fetch cart from backend
      dispatch(fetchCartFromBackend());
      // Fetch favorites from backend
      dispatch(fetchFavoritesFromBackend());
    }
  }, [dispatch, user, token]);
};