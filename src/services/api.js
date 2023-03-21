import axios from 'axios';
import Config from '@/config';
import store from '@/mst';

const instance = axios.create({
  baseURL: Config.apiEndPoint.trim(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const isAuthorizedApi = url => {
  return !(
    url.startsWith('/user/login') ||
    url.startsWith('/user/register') ||
    url.startsWith('/geo/')
  );
};

// Add interceptor for injecting auth header
instance.interceptors.request.use(
  config => {
    // In case of authorized api and if auth header is not set, then put the auth header
    if (
      isAuthorizedApi(config.url) &&
      (!config.headers || !config.headers.Authorization)
    ) {
      const newHeaders = config.headers || {};
      newHeaders.Authorization = `Bearer ${store.user.token}`;
      config.headers = newHeaders;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// If 401 is returned, just logout.
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // When we got unauthorized,
    if (error.response && error.response.status === 401) {
      store.setUnAuthorized();
      return Promise.reject(new Error('Unauthorized'));
    }
    return Promise.reject(error);
  },
);

async function getDefaultApiParams() {
  return {};
}

export async function signUp({email, password}) {
  return instance.post('/user/register', {email, password}).then(r => r.data);
}

export async function logIn({email, password}) {
  return instance.post('/user/login', {email, password}).then(r => r.data);
}

export async function getCountries() {
  return instance.get('/geo/countries').then(r => {
    const countries = r.data?.data || [];
    // put usa at top
    const usaIndex = countries.findIndex(c => c.id === 233);
    if (usaIndex >= 0) {
      const usa = countries[usaIndex];
      countries.splice(usaIndex);
      countries.unshift(usa);
    }
    return countries;
  });
}

export async function getStates(countryId) {
  return instance
    .get('/geo/states', {
      params: {countryId},
    })
    .then(r => r.data?.data);
}

export async function getCities(stateId) {
  return instance
    .get('/geo/cities', {
      params: {stateId},
    })
    .then(r => r.data?.data);
}

export async function addDevice(values) {
  return instance
    .post('/device', {
      device_address: values.deviceId,
      alias: values.name,
      country: values.country,
      state: values.state,
      city: values.city,
      status: 0,
      type: values.type,
    })
    .then(r => r.data?.data);
}

export async function updateDevice(id, values) {
  return instance.put(`/device/${id}`, {
    alias: values.name,
    country_id: values?.country?.id,
    state_id: values?.state?.id,
    city_id: values?.city?.id,
  });
}
export async function updateSingleDevice(id, values) {
  return instance.put(`/device/${id}`, values);
}

export async function setAutoMode(id, value) {
  return instance
    .post(`/device/${id}/setAutoMode`, {
      value: value ? 'Yes' : 'No',
    })
    .then(r => r.data?.data);
}

export async function setOpenStatus(id, status) {
  return instance
    .put(`/device/${id}`, {
      status,
    })
    .then(r => r.data?.data);
}

export async function getDevices() {
  return instance.get('/device').then(r => {
    const devices = r.data?.data ?? [];
    return devices.map(d => ({
      id: d.id,
      deviceId: d.device_address,
      name: d.alias,
      country: d.country,
      state: d.state,
      city: d.city,
      status: d.status,
      is_temp_include: d.is_temp_include,
      is_hum_include: d.is_hum_include,
    }));
  });
}

export async function deleteDevice(id) {
  return instance.delete(`/device/${id}`).then(r => r.data?.data);
}

export async function getLogs() {
  return instance
    .get('/log', {
      page: 1,
      rows: 30,
    })
    .then(r => r.data?.data);
}

export async function deleteLog(id) {
  return instance.delete(`/log/${id}`).then(r => r.data?.data);
}

export async function changePassword(oldPassword, newPassword) {
  return instance
    .post('/user/changePassword', {
      oldPassword,
      newPassword,
    })
    .then(r => {
      const token = r.data?.access_token;
      if (token && token.length) {
        store.user.updateToken(token);
      }
      return r.data?.data;
    });
}

export async function getUserProfile() {
  return instance.get('/user/profile').then(r => r.data?.data);
}

export async function updateUserProfile({
  name,
  gps_location,
  address,
  zip_code,
  latitude,
  longitude,
}) {
  return instance
    .post('/user/profile', {
      name,
      gps_location,
      address,
      zip_code,
      latitude,
      longitude,
    })
    .then(r => r.data?.data);
}

export async function forgotPassword(email) {
  return instance.post('/user/forgotPassword', {email}).then(r => r.data?.data);
}

export async function resetPassword({email, otp}) {
  return instance
    .post('/user/resetPassword', {email, otp})
    .then(r => r.data?.data);
}

export async function emailVerification({otp}) {
  return instance
    .post('/emailVerification', {otp})
    .then(r => r.data?.data);
}

export async function getStateDetailById(id) {
  return instance.get(`/geo/state/${id}/latlng`).then(r => r.data?.data);
}

export async function getCityDetailById(id) {
  return instance.get(`/geo/city/${id}/latlng`).then(r => r.data?.data);
}

export async function getSettings() {
  return instance.get(`/settings`).then(r => r.data?.data);
}

export async function updateSettings(data) {
  return instance.put(`/settings`, data).then(r => r.data?.data);
}

export {instance};
