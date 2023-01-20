import React from 'react';
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

const smallLogo = require('@/assets/images/logo-small.png');
const logoTitle = require('@/assets/images/logo-title.png');

const OverViewSettings = () => {
  const vm = useViewModel();
  return (
    <SafeAreaView flex={1}>
      <KeyboardAwareScrollView style={{flex: 1}}>
        <Column flex={1} px={4}>
          <FormControl isInvalid={!!vm.errors.email}>
            <HStack space={4}>
              <TitledPlainInput
                width="48%"
                mt={vs(10)}
                title={'Temp Range'}
                inputProps={{
                  // value: vm.email,
                  // onChangeText: vm.setEmail,
                  // keyboardType: 'email-address',
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
                  // value: vm.email,
                  // onChangeText: vm.setEmail,
                  // keyboardType: 'email-address',
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
              {vm.errors.email}
            </FormControl.ErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!vm.errors.password}>
            <TitledPlainSelect
              mt={vs(10)}
              title={'Device List'}
              inputProps={{
                // secureTextEntry: true,
                placeholder: 'Select Device',
                // value: vm.password,
                // onChangeText: vm.setPassword,
              }}>
              <Select.Item label="Select Device" value="" />
              <Select.Item label="Device 1" value="1" />
              <Select.Item label="Device 2" value="2" />
            </TitledPlainSelect>
            <FormControl.ErrorMessage>
              {vm.errors.password}
            </FormControl.ErrorMessage>
          </FormControl>
          <Stack space={3} my="5">
            <Stack direction="row" justifyContent="space-between">
              <Text fontSize="14" fontWeight="500" color="#2B2B2B">
                Include temperature in automation
              </Text>
              <Switch color="#0F47AF" />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Text fontSize="14" fontWeight="500" color="#2B2B2B">
                Include humidity in automation include
              </Text>
              <Switch color="#0F47AF" />
            </Stack>
          </Stack>
        </Column>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default OverViewSettings;
