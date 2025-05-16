import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import alertReducer from "./slices/alertSlice";
import wishlistReducer from "./slices/wishlistSlice";
import userDashboardReducer from "./slices/userDashboardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    alert: alertReducer,
    userDashboard: userDashboardReducer,
  },
});

export default store;