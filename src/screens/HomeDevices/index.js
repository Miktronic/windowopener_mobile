import React, {useRef} from 'react';
import {
  Column,
  Text,
  Image,
  FlatList,
  Row,
  Switch,
  Slider,
  Icon,
  ScrollView,
} from 'native-base';
import {observer} from 'mobx-react';
import useViewModel from './methods';
import ActionButton from '@/components/buttons/ActionButton';
import {useNavigation} from '@react-navigation/native';
import {Screens} from '@/constants/Navigation';
import {TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {confirmAlert} from '@/utils/alert';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {assignIn} from 'lodash';
import {useStore} from '@/hooks';
import {getCityDetailById, getStateDetailById} from '@/services/api';
import {queryWeather} from '@/services/weather';
import Overview from './Overview';
const noDevices = require('@/assets/images/logo_no_devices.png');
const iconWifi = require('@/assets/images/keyboard.png');
const iconWindow = require('@/assets/images/right.png');
const iconWeatherSunny = require('@/assets/images/ic_weather_sunny.png');
import {StaticDevices} from '@/data';

const HomeDevices = () => {
  const vm = useViewModel();
  return (
    <ScrollView>
      <Overview settingsData={vm.settingsData} devices={vm.devices} />
      <FlatList
        p={4}
        flex={1}
        data={vm.devices}
        onRefresh={vm.onRefresh}
        refreshing={vm.isLoading}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <DeviceItem
            item={item}
            isExpanded={vm.devicesExpanded.includes(item.deviceId)}
            onToggleDeviceExpanded={() =>
              vm.toggleDeviceExpanded(item.deviceId)
            }
            onPressConfig={() => vm.onPressConfig(item)}
          />
        )}
        ListEmptyComponent={vm.isLoading ? null : EmptyItemsView}></FlatList>
    </ScrollView>
  );
};

const DeviceItem = ({
  item,
  isExpanded,
  onToggleDeviceExpanded,
  onPressConfig,
}) => {
  const [sliderValue, setSliderValue] = React.useState(item.status);
  const sliderPrevValue = useRef(null);
  const allowPrevValue = useRef(true);
  const store = useStore();

  const onOpenStatusChange = async newValue => {
    if (!(await confirmAlert('Are you sure?'))) {
      // switch back to old mode
      setSliderValue(sliderPrevValue.current);
      return;
    }
    try {
      // call api
      store.hud.show();
      await Api.setOpenStatus(item.id, sliderValue);
      setSliderValue(newValue);
      allowPrevValue.current = true;
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else if (ex.errors) {
        const _errors = assignIn({}, ...ex.errors);
        setErrors(_errors);
      } else {
        store.notification.showError(ex.message);
      }
      setSliderValue(sliderPrevValue.current);
    } finally {
      store.hud.hide();
    }
  };

  return (
    <Column>
      <TouchableOpacity onPress={onToggleDeviceExpanded} activeOpacity={1.0}>
        <Row bg={'#FFFFFF'} alignItems={'center'} mt={2} p={2} borderRadius={8}>
          <Image source={iconWifi} style={{height: 40, width: 40}} alt="logo" />
          <Text
            flex={1}
            color={'#2B2B2B'}
            fontSize={14}
            fontWeight={500}
            ml={4}>
            {item.name}
          </Text>
          <Image
            source={iconWindow}
            style={{height: 30, width: 30}}
            alt="Icon"
          />
        </Row>
      </TouchableOpacity>
      {isExpanded && (
        <Column px={5} bg={'white'} borderRadius={8} mt={1}>
          <Row alignItems={'center'} justifyContent={'flex-end'} mt={4}>
            <TouchableOpacity onPress={onPressConfig}>
              <Icon as={Feather} name={'settings'} size={'md'} mx={1} my={1} />
            </TouchableOpacity>
          </Row>
          <CustomSlider
            value={sliderValue}
            setValue={setSliderValue}
            onOpenStatusChange={onOpenStatusChange}
            sliderPrevValue={sliderPrevValue}
            allowPrevValue={allowPrevValue}
          />
          <Row justifyContent={'space-between'}>
            <Text italic ml={-3} color={'#8b8b8b'}>
              Close
            </Text>
            <Text mr={5} color={'#8b8b8b'}>
              |
            </Text>
            <Text color={'#8b8b8b'}>|</Text>
            <Text ml={5} color={'#8b8b8b'}>
              |
            </Text>
            <Text italic mr={-3} color={'#8b8b8b'}>
              Open
            </Text>
          </Row>
        </Column>
      )}
    </Column>
  );
};

const EmptyItemsView = () => {
  const nav = useNavigation();
  return (
    <Column alignItems={'center'} justifyContent={'center'} my={5}>
      <Image source={noDevices} alt="NO Devices" />
      <Text mt={3} italic color={'#8B8B88'} fontSize={21} textAlign={'center'}>
        {"It looks like your haven't\n added any device"}
      </Text>
      <ActionButton mt={5} onPress={() => nav.navigate(Screens.searchDevices)}>
        GET STARTED
      </ActionButton>
    </Column>
  );
};

const CustomSlider = React.memo(
  ({value, setValue, onOpenStatusChange, sliderPrevValue, allowPrevValue}) => {
    return (
      <Slider
        mt={5}
        size={'lg'}
        minValue={0}
        maxValue={100}
        step={25}
        defaultValue={50}
        value={value}
        onChange={v => {
          if (allowPrevValue.current) {
            sliderPrevValue.current = value;
            allowPrevValue.current = false;
          }
          setValue(v);
        }}
        onChangeEnd={value => onOpenStatusChange(value)}>
        <Slider.Track>
          <Slider.FilledTrack />
        </Slider.Track>
        <Slider.Thumb />
      </Slider>
    );
  },
);

export default observer(HomeDevices);
