import React, {useEffect, useState} from 'react';
import {
  Column,
  Text,
  FormControl,
  HStack,
  Select,
  Stack,
  Switch,
} from 'native-base';
import {vs} from 'react-native-size-matters';
import {observer} from 'mobx-react';

import useViewModel from './methods';
import LoginBackground from '@/components/LoginBackground';
import {SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import TitledInput from '@/components/TitledInput';
import ActionButton from '@/components/buttons/ActionButton';
import {TitledPlainInput, TitledPlainSelect} from '@/components/Inputs';
import {useRoute} from '@react-navigation/native';
import * as Api from '@/services/api';
import {confirmAlert} from '@/utils/alert';
import {apiError2Message} from '@/utils';
import {errorMessage} from '@/utils/Yup';

const smallLogo = require('@/assets/images/logo-small.png');
const logoTitle = require('@/assets/images/logo-title.png');

const OverViewSettings = () => {
  const vm = useViewModel();
  const route = useRoute();
  const devices = route.params?.devices;
  useEffect(() => {
    const settingsData = route.params?.settingsData;
    console.log(settingsData.low_temperature);
    vm.setLowTemp(settingsData.low_temperature);
    vm.setHighTemp(settingsData.high_temperature);
  }, [route.params]);
  return (
    <SafeAreaView flex={1}>
      <KeyboardAwareScrollView style={{flex: 1}}>
        <Column flex={1} px={4}>
          <FormControl isInvalid={!!vm.errors.lowTemp}>
            <HStack space={4}>
              <TitledPlainInput
                width="48%"
                mt={vs(10)}
                title={'Temp Range'}
                inputProps={{
                  value: String(vm.lowTemp),
                  onChangeText: vm.setLowTemp,
                  keyboardType: 'numeric',
                  placeholder: 'Minimum Temp',
                  // _input: {
                  //   autoCapitalize: 'none',
                  //   autoCorrect: false,
                  //   autoComplete: 'off',
                  // },
                }}
              />
              <TitledPlainInput
                mt={vs(10)}
                width="48%"
                type="select"
                // title={'Email address'}
                inputProps={{
                  value: String(vm.highTemp),
                  onChangeText: vm.setHighTemp,
                  keyboardType: 'numeric',
                  placeholder: 'Maximum Temp',
                  // _input: {
                  //   autoCapitalize: 'none',
                  //   autoCorrect: false,
                  //   autoComplete: 'off',
                  // },
                }}
              />
            </HStack>
            <FormControl.ErrorMessage>
              {vm.errors.lowTemp}
            </FormControl.ErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!vm.errors.highTemp}>
            <FormControl.ErrorMessage>
              {vm.errors.highTemp}
            </FormControl.ErrorMessage>
          </FormControl>
          <Stack space={3} my="5">
            {devices?.map((device, idx) => (
              <DeviceItem key={idx} device={device} />
            ))}
          </Stack>
          <ActionButton mt={5} onPress={vm.onPressSave}>
            Save
          </ActionButton>
        </Column>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const DeviceItem = ({device}) => {
  const [includeTemp, setIncludeTemp] = useState(device.is_temp_include == 1);
  return (
    <Column p={5} bg={'white'} borderRadius={8} mt={1}>
      <Stack direction="row" justifyContent="space-between" style={{}}>
        <Text fontSize="14" fontWeight="500" color="#2B2B2B">
          {device.name}
        </Text>
        <Text fontSize="14" fontWeight="500" color="#2B2B2B">
          Include temperature
        </Text>
        <Switch
          color="#0F47AF"
          value={includeTemp}
          onToggle={async () => {
            if (!(await confirmAlert('Are you sure?'))) {
              return;
            }
            try {
              const {data} = await Api.updateSingleDevice(device.id, {
                is_temp_include: includeTemp ? 0 : 1,
              });
              console.log(data);
              setIncludeTemp(data.is_temp_include == 1);
            } catch (ex) {
              const apiError = apiError2Message(ex);
              store.notification.showError(apiError);
            }
          }}
        />
      </Stack>
    </Column>
  );
};

export default OverViewSettings;
