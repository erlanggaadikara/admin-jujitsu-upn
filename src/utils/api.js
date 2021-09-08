import * as Axios from "axios";

const ENDPOINT = "https://jujitsu.api.irfanarifstudio.net/api";

Axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
Axios.defaults.headers.common["Content-Type"] = "application/json";

const csrfToken = async () => {
  const csrf = await Get("/check_csrf/honeybadger");
  return csrf;
};

export const Get = async (url) => {
  const send = await Axios(ENDPOINT + url);

  if (send.data) return send.data;
  return send;
};

export const Post = async (url, data) => {
  const csrf = await csrfToken();
  const send = await Axios({
    url: ENDPOINT + url,
    method: "POST",
    headers: {
      "X-CSRF-TOKEN": csrf,
    },
    data,
  });

  if (send.data) return send.data;

  return send;
};
