import { createSlice } from '@reduxjs/toolkit';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser(state, action) {
      const user = parseJwt(action.payload.token); 
      if (user) {
        state.currentUser = { ...user, token: action.payload.token }; 
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.token); 
      }
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token'); 
    },
    initializeUser(state) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = parseJwt(token); 
          const currentTime = Date.now() / 1000; 

          if (decoded && decoded.exp > currentTime) {
            state.currentUser = { ...decoded, token }; 
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Failed to decode token', error);
          state.isAuthenticated = false;
        }
      } else {
        state.isAuthenticated = false;
      }
    },
  },
});

export const { setUser, logout, initializeUser } = userSlice.actions;
export default userSlice.reducer;