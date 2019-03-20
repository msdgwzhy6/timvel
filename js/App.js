import * as React from 'react';
import { View, UIManager, PushNotificationIOS, YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import SimpleApp from './Navigators';
import { Setup, base, Notification, Navigation } from './utils';
import * as Connectors from './connectors';
import CoinIncrease from './components/CoinIncrease';
import { CoinTransactionAnimation } from './components/CoinTransactionAnimation';
//ignore isMounted is deprecated, this warning fixed in higher version
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);
import AV from 'leancloud-storage';
AV.init({
  appId: 'UYganDzaND6XsvYaL552tlbs-gzGzoHsz',
  appKey: 'l5ld3QxRSvLCaJ4Rpv6gXbIq',
});
//@ts-ignore
import Installation from 'leancloud-installation';
Installation(AV);
const store = configureStore();
Setup.preventDoublePress(SimpleApp);
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);
export default class App extends React.Component {
  componentDidMount() {
    this._init();
    let notification = new Notification(Installation);
    if (base.isIOS) {
      notification.IOSinitPush();
    } else {
      notification.AndroidinitPush();
    }
    // try to prevent crash n._navigation.state
    if (base.isIOS) {
      return;
    }
    // Setup.androidBackButton(this._navigation, store);
  }
  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('register');
    store.dispatch({ type: 'UPDATE_USERINFO', payload: {} });
  }

  _init = async () => {
    try {
      CoinTransactionAnimation.init();
    } catch (error) {
      console.warn(error);
    }
  };

  render() {
    return (
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <SimpleApp
            ref={navigation => {
              Navigation.setNavigation(navigation);
              this._navigation = navigation;
            }}
          />

          <Connectors.global />
          <Connectors.alert />
          <Connectors.snakeBar />
          <CoinIncrease />
        </View>
      </Provider>
    );
  }
}
