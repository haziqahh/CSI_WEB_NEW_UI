import { message } from "antd";
import axios from "axios";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const API_URL = "https://csiesg-api.azurewebsites.net/api/";

let isAPIFailed = true;
let errorCode = "";

const fetching = (url, method, body, customHeaders) => {
  let authHeaders = {};
  let isRemember = localStorage.getItem("remember");
  let token = sessionStorage.getItem("accessToken");
  if (
    !url.includes("login") &&
    !url.includes("register") &&
    !url.includes("smeRegister") &&
    !url.includes("corporateRegister") &&
    !url.includes("contactUs") &&
    !url.includes("smeSubscription")
  ) {
    if (token !== undefined && token !== null) {
      authHeaders = {
        Authorization: "Bearer " + token,
      };
    } else if (isRemember === "true" || isRemember === true) {
      let date = new Date();
      let rememberToken = localStorage.getItem("accessToken");
      if (rememberToken !== undefined && rememberToken !== null) {
        let token = JSON.parse(rememberToken);
        if (date.getTime() > token.expiry) {
          removeLocalToken();
          return;
        } else {
          sessionStorage.setItem("accessToken", token.value);
          authHeaders = {
            Authorization: "Bearer " + token.value,
          };
        }
      } else {
        redirectToLogin("Session Expired. Please login again");
      }
    } else {
      redirectToLogin("Session Expired. Please login again");
    }
  }

  const headers = Object.assign({}, defaultHeaders, authHeaders, customHeaders);
  let config = {
    method: method,
    url: API_URL + url,
    headers: headers,
    data: body,
  };

  return Promise.race([
    fetchAPI(config),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (isAPIFailed && errorCode >= 400) {
          redirectToHomePage(errorCode);
        }
        reject("timeout");
      }, 90000);
    }),
  ]);
};

const removeLocalToken = () => {
  localStorage.removeItem("remember");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
};

const promptError = (errorMessage) => {
  message.error({
    content: errorMessage,
    style: {
      fontSize: "20px",
      marginTop: "100px",
    },
    duration: 8,
  });
};

const redirectToHomePage = (errorCode) => {
  promptError(
    "The server encountered a temporary error. Please try again in 30 seconds."
  );
  window.location.replace("/404/" + errorCode);
};
const redirectToLogin = (errorMessage) => {
  promptError(errorMessage);
  let role = localStorage.getItem("role");
  if (role === "admin") {
    window.location.replace("/");
  } else if (role === "client") {
    window.location.replace("/");
  } else {
    window.location.replace("/");
  }
  return;
};

const fetchAPI = (config) => {
  // The request was made but no response was received
  return new Promise((resolve, reject) => {
    axios(config)
      .then((res) => {
        isAPIFailed = false;
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const GET = (uri, body, customHeaders) =>
  fetching(uri, "GET", body, customHeaders);
const POST = (uri, body, customHeaders) =>
  fetching(uri, "POST", body, customHeaders);
const PATCH = (uri, body, customHeaders) =>
  fetching(uri, "PATCH", body, customHeaders);
const PUT = (uri, body, customHeaders) =>
  fetching(uri, "PUT", body, customHeaders);
const DELETE = (uri, body, customHeaders) =>
  fetching(uri, "DELETE", body, customHeaders);

export default {
  GET,
  POST,
  PATCH,
  PUT,
  DELETE,
};
