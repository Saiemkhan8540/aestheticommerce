import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const storedUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const initialState = {
  user: storedUser ? storedUser.user : null,
  token: storedUser ? storedUser.token : null,
  msg: "",
  loading: false,
  error: null,
};

// ✅ Register user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ✅ Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ✅ forgot Password Password
export const ForgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (userData, thunkAPI) => {
    try {
      console.log("email in forgot password action:- ", userData.email);
      return await authService.forgotPassword(userData.email);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Forgot Password failed"
      );
    }
  }
);

export const verifOtp = createAsyncThunk(
  "auth/verifyOtp",
  async(verifyOtpData, thunkAPI)=>{
    try{
      return await authService.verifOtp(verifyOtpData);
    }catch(error){
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Verify OTP failed"
      );
    }
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async(resetPasswordData, thunkAPI)=>{
    try{
      return await authService.resetPassword(resetPasswordData);
    }catch(error){
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Reset Password failed"
      );
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ 1. NEW ACTION: Restores state from Session Storage on refresh
    restoreUserFromSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.msg = "Session Restored";
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.msg = "";
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.msg = action.payload.msg;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.msg = action.payload.msg;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ ForgotPassword
      .addCase(ForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.msg = action.payload.message;
      })
      .addCase(ForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      // ✅ Verify OTP
      builder
      .addCase(verifOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.msg = action.payload.message;
        // localStorage.setItem("user", JSON.stringify(action.payload));
        sessionStorage.setItem("tempUser", JSON.stringify(action.payload));
      })
      .addCase(verifOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      })

      //Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logoutUser,restoreUserFromSession } = authSlice.actions;
export default authSlice.reducer;
