import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.PROD
      ? "https://tank-coin.ru/api"
      : "/api"
});

export default api;
