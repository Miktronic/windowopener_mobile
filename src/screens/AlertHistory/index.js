import React, {useState, useRef} from 'react';
import {Column, Image, Pressable, Row, Text, View} from 'native-base';
import {observer} from 'mobx-react';
import {TouchableOpacity} from 'react-native';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import * as Api from '@/services/api';

import {SwipeListView} from 'react-native-swipe-list-view';
import {useStore} from '@/hooks';
import {apiError2Message} from '@/utils';
import {confirmAlert} from '@/utils/alert';

const iconNoMessages = require('@/assets/images/logo_no_alerts.png');
dayjs.extend(calendar);

const AlertHistory = () => {
  const store = useStore();
  const [isLoading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const maxPage = useRef(null);
  const [messages, setMessages] = useState([]);

  const onPressDelete = async item => {
    if (!(await confirmAlert('Are you sure?'))) {
      return;
    }
    try {
      store.hud.show();
      await Api.deleteLog(item.id);
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
      setLoading(false);
    }
    loadMessages()
      .then()
      .catch(() => {});
  };

  const loadMessages = async (page) => {
    try {
      setLoading(true);
     
      const {totalPage, items, perPage} = await Api.getLogs(page);
      maxPage.current = totalPage;
      if(page == 1) {
        setMessages(items)
      } else {
        setMessages(prev => [...prev,...items]);
      }
      
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      
      setLoading(false);
    }
  };

  const onRefresh = (page) => {
    loadMessages(page).then().catch();
  };

  React.useEffect(() => {
    onRefresh(page);
  }, [page]);

  return (
    <SwipeListView
      flex={1}
      data={messages}
      ItemSeparatorComponent={Separator}
      closeOnRowBeginSwipe
      closeOnRowOpen
      keyExtractor={item => item.id}
      onRefresh={() => {setPage(1); onRefresh(1)}}
      refreshing={isLoading}
      ListEmptyComponent={EmptyItemsView}
      renderItem={({item}) => {
        return (<MessageItem
          title={item.alias}
          content={item.content}
          time={item.timestamp}
        />)
      }
      }
      renderHiddenItem={({item}) => (
        <Row justifyContent={'flex-end'} flex={1} alignSelf={'stretch'}>
          <Pressable
            w="70"
            bg={'red.500'}
            justifyContent={'center'}
            alignSelf={'stretch'}
            alignItems={'center'}
            onPress={() => {
              onPressDelete(item);
            }}
            _pressed={{opacity: 0.5}}>
            <Text color={'white'}>Delete</Text>
          </Pressable>
        </Row>
      )}
      rightOpenValue={-70}
      onEndReached={() => {
        if(page < maxPage.current) {
          setPage(page => page + 1)
        }
      }}
      onEndReachedThreshold={0.2}
    />
  );
};

const MessageItem = ({title, content, time}) => {
  const timeText = React.useMemo(() => {
    return dayjs(time).calendar(null, {
      sameDay: 'h:mm A',
      nextDay: 'MM/DD/YYYY',
      nextWeek: 'MM/DD/YYYY',
      lastWeek: 'MM/DD/YYYY',
      lastDay: '[Yesterday]',
      sameElse: 'MM/DD/YYYY',
    });
  }, [time]);
  return (
    <Column bg={'white'}>
      <TouchableOpacity style={{backgroundColor: 'white'}}>
        <Row mx={4} mt={2}>
          <Text flex={1} bold>
            {title}
          </Text>
          <Text fontSize={'sm'} color={'#8b8b8b'}>
            {timeText}
          </Text>
        </Row>
        <Text mx={4} my={1}>
          {content}
        </Text>
      </TouchableOpacity>
    </Column>
  );
};

const Separator = () => {
  return (
    <View height={0} borderBottomWidth={'0.3'} borderBottomColor={'#CCCCCC'} />
  );
};

const EmptyItemsView = () => {
  return (
    <Column alignItems={'center'} justifyContent={'center'} mt={20}>
      <Image source={iconNoMessages} alt="icon"/>
      <Text mt={3} italic color={'#8B8B88'} fontSize={21} textAlign={'center'}>
        No Events to show
      </Text>
    </Column>
  );
};

export default observer(AlertHistory);
