import React from 'react';
import {Box, Switch, Image, Text, Stack, Icon} from 'native-base';
import Feather from 'react-native-vector-icons/Feather';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Screens} from '@/constants/Navigation';
import useViewModel from './methods';
import {confirmAlert} from '@/utils/alert';

const outside = require('@/assets/myImages/outside.png');
const onboard = require('@/assets/myImages/onboard.png');
import {useNavigation} from '@react-navigation/native';
import {setAutoMode} from '@/services/api';

const Overview = ({settingsData, devices}) => {
  const nav = useNavigation();
  const vm = useViewModel();
  const onPressAdd = () => {
    nav.navigate(Screens.overview, {
      settingsData,
      devices,
    });
  };
  return (
    <Box
      m={4}
      rounded="lg"
      overflow="hidden"
      borderColor="coolGray.200"
      borderWidth="1"
      _dark={{
        borderColor: 'coolGray.600',
        backgroundColor: 'gray.700',
      }}
      _web={{
        shadow: 2,
        borderWidth: 0,
      }}
      _light={{
        backgroundColor: 'gray.50',
      }}>
      <Stack p="4" space={5}>
        <Stack direction="row" justifyContent="space-between">
          <Text fontSize="16" fontWeight="500">
            Overview
          </Text>
          <TouchableOpacity onPress={onPressAdd}>
            <Icon as={Feather} name={'settings'} size={'md'} color={'grey'} />
          </TouchableOpacity>
        </Stack>

        <Stack direction="row" space={3}>
          <Temp
            image={outside}
            digree={`${
              settingsData?.outside_temperature
                ? settingsData?.outside_temperature
                : ''
            }° F`}
            data="Outside temp"
          />
          <Temp
            image={onboard}
            digree={`${
              settingsData?.inside_temperature
                ? settingsData?.inside_temperature
                : ''
            }° F`}
            data="Onboard temp"
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Text fontSize="16" fontWeight="500">
            “Auto mode” switch to control
          </Text>
          <Switch
            color="#0F47AF"
            value={vm.autoMode}
            onToggle={vm.toggleAutoMode}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default Overview;

const Temp = ({image, digree, data}) => {
  return (
    <Stack direction="row">
      <Image source={image} style={styles.imageStyle} alt="image"/>
      <Stack space={1}>
        <Text fontSize="16" fontWeight="500">
          {digree}
        </Text>
        <Text fontSize="12" fontWeight="400" color="#6E6E6E">
          {data}
        </Text>
      </Stack>
    </Stack>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});
