import * as React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, createMoveableComp, PriceTag } from '../../re-kits';
import RootSiblings from 'react-native-root-siblings';
import { map } from 'rxjs/operators';
import { base, User, runAfter } from '../utils';
const {
  colors,
  Styles,
  randomItem,
  randomNumber,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  NAV_BAR_HEIGHT,
} = base;
import * as Animatable from 'react-native-animatable';
// import Moment from 'moment'
import { ITEM_SIZE, COIN, BUBBLE_SIZE } from './CoinIncreaseConstants';
import {
  $sourceSecond,
  $sourceOneMinue,
  // $sourceTenSeconds,
  $CENTER,
  $TYPES,
} from '../utils/$observable';
const deleteObject = (obj, key) => () => delete obj[key];
const MAXIMUM_BUBBLE = 3;
const getRandomCoin = () => {
  const random = Math.random();
  if (random > 0.95) {
    return 10;
  }
  if (random > 0.9) {
    return 8;
  }
  if (random > 0.8) {
    return 4;
  }
  if (random > 0.7) {
    return 3;
  }
  if (random > 0.5) {
    return 2;
  }
  return 1;
};
class CoinIncrease extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      second: 0,
      show: false,
    };
    this.rootSibling;
    this.bubblePool = {};
  }
  componentDidMount() {
    this._userMountListener();
  }
  _userMountListener = () => {
    const listener = $CENTER.subscribe(({ type }) => {
      if (type === $TYPES.userMount) {
        this.setState({
          show: true,
        });
        console.warn('timer init');
        this._init();
        listener.unsubscribe();
      }
    });
  };
  _init = () => {
    $sourceSecond.pipe(map(_ => _ + 1)).subscribe(second =>
      this.setState({
        second,
      }),
    );
    $sourceOneMinue.subscribe(runAfter(this._renderCoinBubble));
  };
  _renderCoinBubble = () => {
    if (Object.keys(this.bubblePool).length >= MAXIMUM_BUBBLE) {
      this._destroyBubble();
    }
    this._createRootView();
  };

  _onPressBubble = (id, coin) => () => {
    this._destroyBubble(id);
    $CENTER.next({
      type: $TYPES.coinTransaction,
      payload: {
        transaction: coin,
      },
    });
    User.increaseCoin(coin);
  };

  _destroyBubble = (id = null) => {
    if (!id) {
      const keys = Object.keys(this.bubblePool);
      if (keys.length === 0) {
        return;
      }
      this._destroyBubble(keys[0]);
      return;
    }
    this.bubblePool[id].rootView.destroy(deleteObject(this.bubblePool, id));
  };

  _createRootView = () => {
    const top = randomNumber(0, SCREEN_HEIGHT - BUBBLE_SIZE - NAV_BAR_HEIGHT);
    const left = randomNumber(0, SCREEN_WIDTH - BUBBLE_SIZE);
    const coin = getRandomCoin();
    const delay = randomItem([100, 200, 300, 400]);
    const id = Date.now();
    const style = {
      position: 'absolute',
      left,
      top,
      width: BUBBLE_SIZE + 10,
      height: BUBBLE_SIZE + 10,
      padding: 5,
    };
    const comp = (
      <View style={style}>
        <CoinBubble
          onPress={this._onPressBubble(id, coin)}
          price={coin}
          delay={delay}
        />
      </View>
    );
    const bubbleObj = {
      id,
      rootView: new RootSiblings(comp),
    };
    setTimeout(() => {
      this.bubblePool[id] = bubbleObj;
    }, 0);
  };
  render() {
    const { second, show } = this.state;
    if (!show) {
      return null;
    }
    const minute = Math.floor(second / 60);
    let seconds = second % 60;
    seconds = seconds.toString().length === 1 ? `0${seconds}` : seconds;
    return (
      <View style={[styles.container, Styles.center]}>
        <Text>{`${minute}:${seconds}`}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function CoinBubble({ style, price, onPress, delay = 0 }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animatable.View
        style={[styles.bubble, style]}
        animation={'pulse'}
        easing={'ease-out'}
        iterationCount={'infinite'}
        delay={delay}
      >
        <PriceTag price={price} />
      </Animatable.View>
    </TouchableWithoutFeedback>
  );
}

export default createMoveableComp(CoinIncrease);
