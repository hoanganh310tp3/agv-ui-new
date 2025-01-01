import {
  CreateLoginDto,
  CreateLogoutDto,
  CreateRegisterDto,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
} from "@/types/Auth.types";
import api from "@/utils/axiosCustomize";

const LOGIN_URL = "login";
const REGISTER_URL = "register";
const LOGOUT_URL = "logout";
const USER_URL = "user";

const postLogin = async (loginInfo: CreateLoginDto): Promise<LoginResponse> => {
  try {
    const { data } = await api.post(LOGIN_URL, loginInfo, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid credentials");
    }
    const errorMessage = error.response?.data?.detail || "Failed to log in";
    console.error(">>> Error logging in:", errorMessage);
    throw new Error(errorMessage);
  }
};

const postRegister = async (
  registerInfo: CreateRegisterDto,
): Promise<RegisterResponse> => {
  try {
    const { data } = await api.post(REGISTER_URL, registerInfo, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return data;
  } catch (error) {
    console.error(">>> Full error object:", error);
    const errorMessageRegisteredEmail = error.response?.data?.email?.[0];
    const errorMessageRegisteredName = error.response?.data?.name?.[0];
    let errorMessage: string = "Failed to register";
    
    if (errorMessageRegisteredName) {
      errorMessage = `Name: ${errorMessageRegisteredName}`;
    } else if (errorMessageRegisteredEmail) {
      errorMessage = `Email: ${errorMessageRegisteredEmail}`;
    }
    throw new Error(errorMessage);
  }
};

const postLogout = async (
  logoutInfo: CreateLogoutDto,
): Promise<LogoutResponse> => {
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  const email = logoutInfo.email;

  if (!access_token || !refresh_token || !email) {
    // Nếu không có tokens, thực hiện cleanup và return
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return {
      message: "Logged out successfully"
    };
  }

  try {
    const { data } = await api.post(LOGOUT_URL, {
      email: email,
      refresh_token: refresh_token
    });
    
    // Xóa tokens sau khi logout thành công
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    return data;
  } catch (error) {
    // Nếu có lỗi 403, vẫn thực hiện cleanup
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    if (error.response?.status === 403) {
      return {
        message: "Logged out successfully"
      };
    }
    throw error;
  }
};


const getCurrentUser = async () => {
  try {
    const { data } = await api.get(USER_URL, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return data;
  } catch (error) {
    console.error(">>> Error fetching user:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch user data");
  }
};

export { postLogin, postLogout, postRegister, getCurrentUser };
