import React from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@/hooks';
import {Screens} from '@/constants/Navigation';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';

function useViewModel() {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  const [devices, setDevices] = React.useState([]);
  const [devicesExpanded, setDevicesExpanded] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [settingsData, setSettingsData] = React.useState(null);

  const onRefresh = () => {
    loadDevices();
  };

  const toggleDeviceExpanded = id => {
    if (devicesExpanded.includes(id)) {
      const idx = devicesExpanded.indexOf(id);
      devicesExpanded.splice(idx, 1);
      setDevicesExpanded([...devicesExpanded]);
    } else {
      setDevicesExpanded([...devicesExpanded, id]);
    }
  };

  const loadDevices = async () => {
    store.hud.show();
    setLoading(true);
    try {
      setDevices(await Api.getDevices());
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
    setLoading(false);
  };

  const loadSettings = async () => {
    store.hud.show();
    setLoading(true);
    try {
      const data = await Api.getSettings();
      console.log(data);
      setSettingsData(data);
    } catch (ex) {
      console.log(ex.response.data);
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadDevices().then().catch();
    loadSettings().then().catch();
  }, []);

  // when new device is added
  React.useEffect(() => {
    if (route.params?.refreshDevices) {
      loadDevices().then().catch();
    }
  }, [route.params]);

  const onPressConfig = device => {
    navigation.navigate(Screens.editDevice, {device});
  };

  return {
    store,
    devices,
    devicesExpanded,
    toggleDeviceExpanded,
    onPressConfig,
    isLoading,
    onRefresh,
    settingsData,
  };
}

export default useViewModel;
