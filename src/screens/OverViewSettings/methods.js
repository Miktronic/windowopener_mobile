import React from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@/hooks';
import {resetWithScreen} from '@/services/navigation';
import {Screens} from '@/constants/Navigation';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {assignIn} from 'lodash';
import {object, string} from 'yup';
import {errorMessage} from '@/utils/Yup';

const yup = object().shape({
  email: string()
    .trim()
    .required(errorMessage('email', 'Enter e-mail address'))
    .email(errorMessage('email', 'Enter valid e-mail address')),
  password: string()
    .trim()
    .required(errorMessage('password', 'Enter password')),
});

function useViewModel() {
  const navigation = useNavigation();
  const store = useStore();
  const route = useRoute();

  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [errors, setErrors] = React.useState({});

  // const onPressLogin = async () => {
  //   setErrors({});
  //   try {
  //     const values = yup.validateSync({email, password}, {abortEarly: false});
  //     store.hud.show();
  //     const {access_token, token_type} = await Api.logIn(values);

  //     store.notification.showSuccess('Login success');
  //     store.user.logIn(email, access_token);

  //     // on successful sign up, go to login
  //     resetWithScreen(navigation, Screens.mainTabs);
  //   } catch (ex) {
  //     const apiError = apiError2Message(ex);
  //     if (apiError) {
  //       store.notification.showError(apiError);
  //     } else if (ex.errors) {
  //       const _errors = assignIn({}, ...ex.errors);
  //       setErrors(_errors);
  //     } else {
  //       //Toast.show({title: 'Signup Failed', status: 'error'});
  //       store.notification.showError(ex.message);
  //     }
  //   } finally {
  //     store.hud.hide();
  //   }
  //   //resetWithScreen(navigation, Screens.mainTabs);
  // };

  return {
    store,
    errors,
    email,
    setEmail,
    password,
    setPassword,
  };
}

export default useViewModel;
