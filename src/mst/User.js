import {types} from 'mobx-state-tree';
import {defString} from './Types';

const tag = 'MST.User::';

const User = types
  .model('User', {
    email: defString,
    token: defString,
    lat: defString,
    lang: defString
  })
  .actions(self => ({
    logIn: (email, token) => {
      self.email = email;
      self.token = token;
    },
    logOut: () =>  {
      self.email = '';
      self.token = '';
    },
    updateToken: (token) => {
      self.token = token;
    },
    storeLocation: (lat, lang) => {
      self.lat = lat,
      self.lang = lang
    }
  }))
  .views(self => ({
    get isLoggedIn() {
      return self.email && self.email.length && self.token && self.token.length
    }
  })
  );

export default User;
