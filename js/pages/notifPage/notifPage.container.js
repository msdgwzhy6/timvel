import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { NavBar, Assets, NAV_BAR_HEIGHT_FULL } from '../../../re-kits';
import { colors, TAB_BAR_HEIGHT, curried, I18n } from '../../utils';
import { InfoBar } from '../../components';
class NotifPage extends Component {
  componentWillMount() {
    this.props.dispatch('NOTIFI_PAGE_FETCH_COMMENTS');
  }

  _goBack = () => {
    this.props.navigation.goBack();
  };
  _setState = (nextState = {}) =>
    this.props.dispatch('NOTIF_PAGE_SET_STATE', nextState);

  _goTo = (routeName, params = {}) => {
    if (!routeName) {
      return;
    }
    this.props.navigation.navigate({
      routeName,
      params,
    });
  };
  render() {
    const { comments } = this.props.state;
    const numOfMessage = comments.filter(o => !o.isRead).length;
    return (
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT,
            paddingTop: NAV_BAR_HEIGHT_FULL,
          }}
        >
          <InfoBar
            title={I18n.t('replies')}
            onPress={curried(this._goTo)('postReplies')}
            numOfMessage={numOfMessage}
            imgSource={Assets.NotificationReplay.source}
          />
          {/* <InfoCard title={'回复我的'} onPress={() => {}} /> */}
        </ScrollView>
        <NavBar title={'消息'} style={{ position: 'absolute' }} blur={true} />
      </View>
    );
  }
}
NotifPage.propTypes = {};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default NotifPage;
