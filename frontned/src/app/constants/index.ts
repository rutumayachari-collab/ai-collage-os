export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
  },
  INQUIRIES: "/inquiries",
  APPLICANTS: "/applicants",
  DOCUMENTS: "/documents",
  ELIGIBILITY: "/eligibility",
  ADMISSIONS: "/admissions",
  STUDENTS: "/students",
  DEPARTMENTS: "/departments",
  COURSES: "/courses",
  FACULTY: "/faculty",
  SUBJECTS: "/subjects",
  EXAMS: "/exams",
  FEES: "/fees",
  ATTENDANCE: "/attendance",
  HOSTEL: "/hostel",
  TRANSPORT: "/transport",
  LIBRARY: "/library",
  PLACEMENTS: "/placements",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  UPLOAD: "/upload",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const TOKEN_STORAGE_KEY = "aicos_auth_token";
export const REFRESH_TOKEN_STORAGE_KEY = "aicos_refresh_token";
export const USER_STORAGE_KEY = "aicos_user";

export const THEME_STORAGE_KEY = "aicos_theme";
