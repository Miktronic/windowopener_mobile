/* eslint-disable */
import ActionButton from '@/components/buttons/ActionButton';
import FormInput from '@/components/FormInput';
import {useStore} from '@/hooks';
import {useGeoHooks} from '@/hooks/geohooks';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import * as Location from 'expo-location';
import {observer} from 'mobx-react';
import {Column, FormControl, HStack, Switch, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ModalSelector from 'react-native-modal-selector';

const Settings = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [location, setLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [country, setCountry] = useState();
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const {countries, states, cities} = useGeoHooks(country, state);
  const store = useStore();
  const nav = useNavigation();

  const loadProfile = async () => {
    try {
      store.hud.show();
      const res = await Api.getUserProfile();
      const {
        name,
        gps_location,
        address,
        zip_code,
        latitude,
        longitude,
        country,
        state,
        city,
      } = res;
      console.log(res);
      setName(name);
      setIsSelected(false);
      setAddress(address);
      setZipCode(zip_code);
      setLatitude(latitude);
      setLongitude(longitude);
      if (country) setCountry(country);
      if (state) setState(state);
      if (city) setCity(city);
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
  };

  const getLocation = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      store.notification.showError(
        'Location Permission Not Granted. Please allow location permission for this app.',
      );
      return;
    }
    // let location = await Location.getLastKnownPositionAsync({});
    // console.log(location);
    // if (!location) {
    //   console.log('Getting last known position');
    //   location = await Location.getCurrentPositionAsync();
    // }
    // setLocation(location);
    // setLatitude(location.coords.latitude.toString());
    // setLongitude(location.coords.longitude.toString());
    Geolocation.getCurrentPosition(
      location => {
        console.log(location);
        setLocation(location);

        setLatitude(location.coords.latitude.toString());
        setLongitude(location.coords.longitude.toString());
      },
      err => {
        console.log(err);
        if (err?.message) {
          store.notification.showError(
            'Please enable gps from settings to get location automatically.',
          );
        }
      },
      {
        showLocationDialog: true,
        forceRequestLocation: true,
        forceLocationManager: true,
      },
    );
  };

  const checkNull = value => {
    if (value === null) {
      return '';
    } else {
      return value + ', ';
    }
  };

  useEffect(() => {
    const getPlace = async () => {
      if (location) {
        const place = await Location.reverseGeocodeAsync({
          latitude: Number(location.coords.latitude),
          longitude: Number(location.coords.longitude),
        });
        let placeName = place.map(p => {
          if (p.postalCode) {
            setZipCode(p.postalCode);
          }
          return (
            checkNull(p.streetNumber) +
            checkNull(p.street) +
            checkNull(p.city) +
            p.country
          );
        });
        // console.log(placeName,'placename....')
        if (placeName.length > 0) {
          setAddress(placeName[0]);
        }
      } else {
        setAddress('');
        setZipCode('');
      }
    };
    getPlace();
  }, [location]);

  const getDeviceLocation = value => {
    setIsSelected(value);
    if (value) {
      getLocation();
    } else {
      setLatitude('');
      setLongitude('');
      setAddress('');
      setZipCode('');
    }
  };

  React.useEffect(() => {
    loadProfile().then().catch();
  }, []);

  const onPressSave = async () => {
    try {
      store.hud.show();

      let body = {
        name,
        gps_location: isSelected,
        address,
        zip_code: zipCode,
        latitude,
        longitude,
        country_id: country?.id,
        state_id: state?.id,
        city_id: city?.id,
      };
      await Api.updateUserProfile(body);
      store.notification.showSuccess('Profile updated');
      nav.goBack();
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
  };

  return (
    <Column px={2} flex={1}>
      <KeyboardAwareScrollView flex={1}>
        <FormControl mt={3}>
          <FormControl.Label>Email</FormControl.Label>
          <Text>{store.user.email}</Text>
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Full Name</FormControl.Label>
          <FormInput
            onChangeText={setName}
            value={name}
            textContentType={'name'}
            autoCapitalize={'words'}
          />
        </FormControl>
        {/* <FormControl mt={3}>
          <FormControl.Label>Address</FormControl.Label>
          <FormInput onChangeText={setAddress} value={address} />
        </FormControl> */}

        <FormControl mt={3} isInvalid={!!errors.country}>
          <FormControl.Label>Country</FormControl.Label>
          <ModalSelector
            data={countries}
            keyExtractor={item => item.id}
            labelExtractor={item => `${item.emoji} ${item.name}`}
            animationType={'fade'}
            onChange={option => {
              // when country changed, clear out state and city
              if (country?.id !== option.id) {
                setState();
                setCity();
              }
              console.log(option);
              setCountry(option);
            }}
            cancelText={'Cancel'}>
            <FormInput editable={false} value={country?.name ?? ''} />
          </ModalSelector>
          <FormControl.ErrorMessage>{errors.country}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl mt={3} isInvalid={!!errors.state}>
          <FormControl.Label>State</FormControl.Label>
          <ModalSelector
            data={states}
            animationType={'fade'}
            keyExtractor={item => item.id}
            labelExtractor={item => item.name}
            onChange={option => {
              // when state changed, clear out city
              if (state?.id !== option.id) {
                setCity();
              }
              setState(option);
            }}
            cancelText={'Cancel'}>
            <FormInput editable={false} value={state?.name ?? ''} />
          </ModalSelector>
          <FormControl.ErrorMessage>{errors.state}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl mt={3} isInvalid={!!errors.city}>
          <FormControl.Label>City</FormControl.Label>
          <ModalSelector
            data={cities}
            keyExtractor={item => item.id}
            labelExtractor={item => item.name}
            animationType={'fade'}
            onChange={option => {
              setCity(option);
            }}
            cancelText={'Cancel'}>
            <FormInput editable={false} value={city?.name ?? ''} />
          </ModalSelector>
          <FormControl.ErrorMessage>{errors.city}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Use GPS</FormControl.Label>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <HStack mr={5}>
              <Switch
                size="lg"
                isChecked={isSelected}
                onValueChange={value => getDeviceLocation(value)}
              />
            </HStack>
            {
              <Text>
                {isSelected ? 'Get Location from GPS' : 'Set Location manullay'}
              </Text>
            }
          </View>
        </FormControl>
        {/* <FormControl mt={3}>
          <FormControl.Label>ZIP Code</FormControl.Label>
          <FormInput onChangeText={setZipCode} value={zipCode} />
        </FormControl> */}
        <FormControl mt={3}>
          <FormControl.Label>Latitude</FormControl.Label>
          <FormInput onChangeText={setLatitude} value={latitude} />
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Longitude</FormControl.Label>
          <FormInput onChangeText={setLongitude} value={longitude} />
        </FormControl>
        <ActionButton mt={5} onPress={onPressSave}>
          Save
        </ActionButton>
      </KeyboardAwareScrollView>
    </Column>
  );
};

export default observer(Settings);

/* eslint-disable */
