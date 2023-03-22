import React, {useState, useEffect} from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@/hooks';
import {resetWithScreen} from '@/services/navigation';
import {Screens} from '@/constants/Navigation';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {assignIn} from 'lodash';
import {object, string} from 'yup';
import {errorMessage} from '@/utils/Yup';
import { PermissionsAndroid, View } from 'react-native';
import Geolocation from "react-native-geolocation-service";

const yup = object().shape({
  email: string().trim()
    .required(errorMessage('email', 'Enter e-mail address'))
    .email(errorMessage('email', 'Enter valid e-mail address'))
  ,
  password: string().
  trim()
    .required(errorMessage('password', 'Enter password')),
});

function useViewModel() {
  const navigation = useNavigation();
  const store = useStore();
  const route = useRoute();

  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [errors, setErrors] = React.useState({});
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [location, setLocation] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Geolocation Permission",
          message: "Can we access your location?",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      console.log("granted", granted);
      if (granted === "granted") {
        console.log("You can use Geolocation");
        return true;
      } else {
        console.log("You cannot use Geolocation");
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const getLocation = async() => {
    const result = requestLocationPermission();
    result.then((res) => {
      console.log("res is:", res);
      if (res) {
        Geolocation.getCurrentPosition(
          (position) => {
            setLocation(position);
            setLatitude(position?.coords?.latitude.toString());
            setLongitude(position?.coords?.longitude.toString());
           
          },
          (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    });
    console.log(location);
  };

  React.useEffect(() => {
    const email = route.params?.email;
    if (email) {
      setEmail(email);
    }
  }, [route.params]);

  useEffect(() => {
    getLocation().then().catch()
    console.log("getting location")
  }, [])

  const onPressLogin = async () => {
    setErrors({});
    try{
      const values = yup.validateSync({email, password}, {abortEarly: false});
      store.hud.show();
      const {access_token, token_type, data} = await Api.logIn(values);
      console.log(access_token, token_type, data);
      let lat = data?.latitude;
      let long = data?.longitude;
      console.log(lat, long);
        console.log(latitude, longitude)
      
      store.notification.showSuccess('Login success');
      store.user.logIn(email, access_token);
      if(!lat || !long) {
        console.log("setting data....")
        if(latitude && longitude) {
          await Api.updateUserProfile({ 
            latitude,
            longitude,
          })
        }
        
      }

      // on successful sign up, go to login
      resetWithScreen(navigation, Screens.mainTabs);
    }catch (ex){
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      }
      else if (ex.errors) {
        const _errors = assignIn({}, ...ex.errors);
        setErrors(_errors);
      } else {
        //Toast.show({title: 'Signup Failed', status: 'error'});
        store.notification.showError(ex.message);
      }
    }finally {
      store.hud.hide();
    }
    //resetWithScreen(navigation, Screens.mainTabs);
  };

  const onPressSignUp = () => {
    navigation.navigate(Screens.signUp);
  };

  const onPressForgetPassword = () => {
    navigation.navigate(Screens.forgetPassword);
  }

  return {
    store,
    errors,
    onPressLogin,
    onPressSignUp,
    onPressForgetPassword,
    email, setEmail,
    password, setPassword
  };
}

export default useViewModel;
