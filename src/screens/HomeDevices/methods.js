import React from 'react';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@/hooks';
import {Screens} from '@/constants/Navigation';
import * as Api from '@/services/api';
import {apiError2Message} from '@/utils';
import {confirmAlert} from '@/utils/alert';

function useViewModel() {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  const [devices, setDevices] = React.useState([]);
  const [devicesExpanded, setDevicesExpanded] = React.useState([]);
  const [autoMode, setAutoMode] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [settingsData, setSettingsData] = React.useState(null);

  const onRefresh = () => {
    loadDevices();
    loadSettings();
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
      const data = await Api.getDevices()
      console.log(data)
      console.log('=========')
      setDevices(data);
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
      setSettingsData(data);
      setAutoMode(data.is_auto == 1 ? true : false);
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

  const toggleAutoMode = async value => {
    if (!(await confirmAlert('Are you sure?'))) {
      return;
    }
    store.hud.show();
    setLoading(true);
    try {
      const data = await Api.updateSettings({
        is_auto: autoMode ? 0 : 1,
      });
      setSettingsData(data);
      setAutoMode(data.is_auto == 1 ? true : false);
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
      loadSettings().then().catch();
    }
  }, [route.params]);

  const onPressConfig = device => {
    navigation.navigate(Screens.editDevice, {device});
  };

  return {
    store,
    devices,
    devicesExpanded,
    autoMode,
    setAutoMode,
    toggleDeviceExpanded,
    onPressConfig,
    toggleAutoMode,
    isLoading,
    onRefresh,
    settingsData,
  };
}

export default useViewModel;
