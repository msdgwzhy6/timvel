import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import PropTypes from 'prop-types';
import {
  Button,
  NavBar,
  Image,
  InfiniteText,
  Text,
  Assets,
  ContentByTag,
} from '../../../re-kits';
import { base, I18n } from '../../utils';
import { connect2 } from '../../utils/Setup';
import { interval, Subject, of, from } from 'rxjs';
import {
  take,
  concatMap,
  map,
  tap,
  multicast,
  publish,
  debounceTime,
} from 'rxjs/operators';
import GiftsModal from './components/GiftsModal';
const {
  SCREEN_WIDTH,
  NAV_BAR_HEIGHT,
  randomItem,
  randomNumber,
  SCREEN_HEIGHT,
} = base;
const image_width = SCREEN_WIDTH;
const image_height = SCREEN_WIDTH * 0.7;
const scroll_height = image_height - NAV_BAR_HEIGHT;
const flowerPatterns = [
  Assets.flower1.source,
  Assets.flower2.source,
  Assets.flower3.source,
  Assets.flower4.source,
];
const shitPatterns = [
  Assets.shit1.source,
  Assets.shit2.source,
  Assets.shit3.source,
  Assets.shit4.source,
  Assets.shit5.source,
];
const fs_size = 20;

@connect2('strangerProfile')
class StrangerProfile extends Component {
  constructor(props) {
    super(props);
    this._nScrollY = new Animated.Value(0);
    this.image_translateY = this._nScrollY.interpolate({
      inputRange: [-25, 0, scroll_height * 1.6],
      outputRange: [-18, 0, -scroll_height],
      extrapolateRight: 'clamp',
    });
    this.imgScale = this._nScrollY.interpolate({
      inputRange: [-25, 0],
      outputRange: [1.1, 1],
      extrapolateRight: 'clamp',
    });
  }
  componentWillMount() {
    this.user = this.props.navigation.getParam('user', {});
    this.props.logic('STRANGER_PROFILE_FETCH_POSTS', {
      userId: this.user.userId,
    });
    this.props.logic('STRANGER_PROFILE_FETCH_USER_INFOS', {
      userId: this.user.userId,
      callback: this._connect,
    });
  }
  componentWillUnmount() {
    this.props.logic('STRANGER_PROFILE_RESET_STATE');
    this.addFS$ && this.addFS$.unsubscribe();
  }
  componentDidMount() {}

  _startRenderFS = (flowerAmount = 0, shitAmount = 0) => {
    let source$ = interval(300).pipe(
      take(Math.max(flowerAmount, shitAmount)),
      map(() => {
        const { flowers, shits } = this.props.state;
        let flower =
          flowers.length < flowerAmount
            ? {
                x: randomNumber(0, SCREEN_WIDTH - fs_size),
                y: randomNumber(NAV_BAR_HEIGHT, SCREEN_HEIGHT - fs_size),
                source: randomItem(flowerPatterns),
                size: fs_size,
              }
            : null;
        let shit =
          shits.length < shitAmount
            ? {
                x: randomNumber(0, SCREEN_WIDTH - fs_size),
                y: randomNumber(NAV_BAR_HEIGHT, SCREEN_HEIGHT - fs_size),
                source: randomItem(shitPatterns),
                size: fs_size,
              }
            : null;
        return {
          flower,
          shit,
        };
      }),
    );
    this.giftSubject$ = new Subject();
    source$.subscribe(value => this.giftSubject$.next(value));
    return this.giftSubject$.subscribe({
      next: ({ flower, shit }) => {
        const { flowers, shits } = this.props.state;
        this.props.logic('STRANGER_PROFILE_SET_STATE', {
          flowers: flower ? flowers.concat([flower]) : flowers,
          shits: shit ? shits.concat([shit]) : shits,
        });
      },
      complete: () => {
        console.warn('complete');
      },
    });
  };
  _connect = (f, s) => {
    console.warn('connect');
    this.addFS$ = this._startRenderFS(f, s);
  };
  _goBack = () => {
    const { navigation } = this.props;
    this.props.logic('NAVIGATION_BACK', {
      navigation,
    });
  };

  _modalController = bool => () => {
    this.props.logic('STRANGER_PROFILE_SET_STATE', {
      showModal: bool,
    });
  };

  _onConfirmSendGift = type => {
    this.giftSubject$.next({
      flower: {
        x: randomNumber(0, SCREEN_WIDTH - fs_size),
        y: randomNumber(NAV_BAR_HEIGHT, SCREEN_HEIGHT - fs_size),
        source: randomItem(flowerPatterns),
        size: 40,
      },
      shit: null,
    });
    this.props.logic('STRANGER_PROFILE_SEND_GIFT', {
      receiver: 1,
      giftType: 1,
    });
  };

  render() {
    const { postsByTag, userInfo, flowers, shits } = this.props.state;
    return (
      <View style={styles.container}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          stickyHeaderIndices={[0]}
          scrollEventThrottle={8}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this._nScrollY } } }],
            { useNativeDriver: true },
          )}
        >
          {this.renderUserInfo()}
          {this.renderCards()}
        </Animated.ScrollView>
        <Button title={'show'} onPress={this._modalController(true)} />
        <NavBar
          title={'f' + `${flowers.length}`}
          sourceLeft={Assets.arrow_left.source}
          onPressLeft={this._goBack}
          style={{ position: 'absolute', top: 0 }}
        />
        {this.renderFS(flowers)}
        {this.renderFS(shits)}
        {this.renderGiftsModal()}
      </View>
    );
  }

  renderGiftsModal = () => {
    const { showModal } = this.props.state;
    return (
      <GiftsModal
        show={showModal}
        modalController={this._modalController}
        onPressConfirm={this._onConfirmSendGift}
      />
    );
  };
  renderUserInfo = () => {
    return (
      <Animated.View>
        <Animated.Image
          source={Assets.bk2.source}
          style={{
            height: image_height,
            width: image_width,
            transform: [
              {
                translateY: this.image_translateY,
              },
              {
                scale: this.imgScale,
              },
            ],
          }}
        />
      </Animated.View>
    );
  };
  renderCards = (key, index) => {
    const { postsByTag } = this.props.state;
    return Object.keys(postsByTag).map((key, index) => {
      return (
        <ContentByTag key={'sp' + index} tag={key} posts={postsByTag[key]} />
      );
    });
  };
  renderFS = (data = []) => {
    const { hide } = this.props.state;
    if (data.length === 0) {
      return null;
    }
    if (hide) {
      return null;
    }
    return data.map((item, index) => (
      <Image
        key={'f' + index}
        source={item.source}
        style={{
          width: item.size,
          height: item.size,
          position: 'absolute',
          left: item.x,
          top: item.y,
        }}
        resizeMode={'contain'}
      />
    ));
  };
}
StrangerProfile.propTypes = {};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default StrangerProfile;
