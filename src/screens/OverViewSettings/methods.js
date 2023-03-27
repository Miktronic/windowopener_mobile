import React, {useEffect} from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@/hooks';
import {resetWithScreen} from '@/services/navigation';
import {Screens} from '@/constants/Navigation';
import * as Api from '@/services/api';
import {assignIn} from 'lodash';
import {number, object, string} from 'yup';
import {apiError2Message} from '@/utils';
import {errorMessage} from '@/utils/Yup';

const yup = object().shape({
  lowTemp: string()
    .min(-200)
    .max(200)
    .required(errorMessage('lowTemp', 'Please enter minimum temperature')),
  highTemp: string()
    .min(-200)
    .max(200)
    .required(errorMessage('highTemp', 'Please enter maximum temperature')),
});

function useViewModel() {
  const navigation = useNavigation();
  const store = useStore();
  const route = useRoute();

  const [lowTemp, setLowTemp] = React.useState('');
  const [highTemp, setHighTemp] = React.useState('');

  const [errors, setErrors] = React.useState({});

  const onPressSave = async () => {
    setErrors({});
    try {
      const values = yup.validateSync({lowTemp, highTemp}, {abortEarly: false});
      console.log(lowTemp, highTemp);
      if (lowTemp > highTemp) {
        store.notification.showError(
          'Low temp range must be smaller than high temp range',
        );
        return;
      }
      store.hud.show();
      const data = await Api.updateSettings({
        low_temperature: lowTemp,
        high_temperature: highTemp,
      });
      store.notification.showSuccess('Update Successfully');

      navigation.navigate(Screens.homeDevices, {
        refreshDevices: true,
      });
    } catch (ex) {
      console.log(JSON.stringify(ex));
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else if (ex.errors) {
        const _errors = assignIn({}, ...ex.errors);
        setErrors(_errors);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
  };

  return {
    store,
    errors,
    lowTemp,
    setLowTemp,
    highTemp,
    setHighTemp,
    onPressSave,
  };
}

export default useViewModel;
