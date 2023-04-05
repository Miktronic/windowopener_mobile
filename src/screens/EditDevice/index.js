import React, {useState} from 'react';
import {observer} from 'mobx-react';
import {Column, FormControl, Input, Row, Switch, Text, View} from 'native-base';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ModalSelector from 'react-native-modal-selector';
import ActionButton from '@/components/buttons/ActionButton';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Screens} from '@/constants/Navigation';
import {object, string, number} from 'yup';
import {errorMessage} from '@/utils/Yup';
import {assignIn} from 'lodash';
import FormInput from '@/components/FormInput';
import {useGeoHooks} from '@/hooks/geohooks';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {useStore} from '@/hooks';
import {confirmAlert} from '@/utils/alert';

const yup = object().shape({
  name: string().trim().required(errorMessage('name', 'Enter name')),
});

const EditDevice = () => {
  const store = useStore();
  const route = useRoute();
  const device = route.params?.device;
  const [name, setName] = useState(device?.name);
  // const [country, setCountry] = useState(device?.country);
  // const [state, setState] = useState(device?.state);
  // const [city, setCity] = useState(device?.city);
  // const {countries, states, cities} = useGeoHooks(country, state);
  const [autoMode, setAutoMode] = useState(device?.autoMode ?? false);
  const [lowTemp, setLowTemp] = useState(`${device?.lowTemp}`);
  const [highTemp, setHighTemp] = useState(`${device?.highTemp}`);
  const [errors, setErrors] = useState({});

  const nav = useNavigation();

  const onPressDelete = async () => {
    if (!device.id) {
      return;
    }
    if (!(await confirmAlert('Are you sure you want to delete this device?'))) {
      return;
    }
    try {
      store.hud.show();
      await Api.deleteDevice(device.id);
      store.notification.showSuccess('Device removed');
      // back to home scree
      nav.navigate(Screens.homeDevices, {
        refreshDevices: true,
      });
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        return store.notification.showError(apiError);
      }
      store.notification.showError(ex.message);
    } finally {
      store.hud.hide();
    }
  };

  const onPressSave = async () => {
    try {
      store.hud.show();
      setErrors({});
      let values = {
        name,
        type: 'opener',
      };
      values = await yup.validate(values, {abortEarly: false});

      await Api.updateDevice(device.id, values);

      // back to home scree
      nav.navigate(Screens.homeDevices, {
        refreshDevices: true,
      });
      store.notification.showSuccess('Device updated');
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        return store.notification.showError(apiError);
      }
      store.notification.showError(ex.message);
    } finally {
      store.hud.hide();
    }
  };
  return (
    <Column px={2} flex={1}>
      <KeyboardAwareScrollView flex={1}>
        <FormControl>
          <FormControl.Label>Device ID</FormControl.Label>
          <Text>{device?.deviceId ?? ''}</Text>
        </FormControl>
        <FormControl mt={3} isInvalid={!!errors.name}>
          <FormControl.Label>Name</FormControl.Label>
          <FormInput
            onChangeText={setName}
            value={name}
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
          />
          <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
        </FormControl>
        <ActionButton mt={5} onPress={onPressSave}>
          Save
        </ActionButton>
        <ActionButton mt={2} danger onPress={onPressDelete}>
          Delete
        </ActionButton>
      </KeyboardAwareScrollView>
    </Column>
  );
};

export default observer(EditDevice);
