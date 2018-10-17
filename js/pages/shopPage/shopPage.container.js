import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
} from 'react-native';
import { Button, NavBar, Image, InfiniteText, Assets } from '../../../re-kits';
import { base, User } from '../../utils';
import ProductCard from './components/ProductCard';
import ConfirmPurchase from './pages/ConfirmPurchase';
const { PADDING_TOP, colors, PADDING_BOTTOM } = base;
const product_types = [
  'avatar',
  'draw_lots',
  'sticker',
  'one_time',
  'title',
  'draw_title',
];
class ShopPage extends Component {
  componentWillMount() {
    this._fetchProducts();
  }

  _fetchProducts = () => {
    this.props.logic('SHOP_PAGE_FETCH_PRODUCTS');
  };

  _openModal = () => {
    this.props.logic('SHOP_PAGE_SET_STATE', {
      showModal: true,
    });
  };

  _closeModal = () => {
    this.props.logic('SHOP_PAGE_SET_STATE', {
      showModal: false,
    });
  };

  _onPressRight = () => {
    this.props.logic('NAVIGATION_NAVIGATE', {
      routeName: 'publishProduct',
    });
  };

  _onPressPurchase = product => {
    if (!product_types.includes(product.productType)) {
      this.props.logic('SHOW_SNAKE_BAR', {
        type: 'ERROR',
        content: 'Unknown product type.',
      });
      return;
    }
    switch (product.productType) {
      case 'avatar':
        this._typeAvatar(product);
        break;
      case 'draw_lots':
        this._typeDrawLots(product);
        break;
      case 'sticker':
        this._typeSticker(product);
        break;
      case 'one_time':
        this._typeOnetime(product);
        break;
      case 'title':
        this._typeTitle(product);
        break;
      case 'draw_title':
        this._drawTitle(product);
        break;
      default:
        return;
    }
  };

  //change avatar
  _typeAvatar = async product => {
    try {
      await User.updateAvatar(product.imageUrl);
      this.props.logic('SHOW_SNAKE_BAR', {
        content: 'Avatar updated!',
      });
    } catch (error) {
      console.warn(error);
    }
  };
  //
  _typeDrawLots = product => {};

  //save to album
  _typeSticker = product => {
    this.props.logic('SHOP_PAGE_SAVE_IMAGE_TO_ALBUM', {
      imageUrl: 'http://lc-uygandza.cn-n1.lcfile.com/00906d947703a0db1bcf.jpg',
    });
  };

  //show image one time
  _typeOnetime = product => {};

  //buy a title
  _typeTitle = product => {};

  //draw a title
  _drawTitle = product => {};
  render() {
    const { showModal, products } = this.props.state;
    const renderProduct = products.map((item, index) => {
      console.warn(item);
      return (
        <ProductCard
          key={index}
          product={item}
          onPressPurchase={() => {
            this._confirmPurchase.open();
          }}
        />
      );
    });
    return (
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.lightGrey }}
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingTop: PADDING_TOP + 44,
            paddingBottom: PADDING_BOTTOM + 48,
            justifyContent: 'space-between',
          }}
        >
          {renderProduct}
        </ScrollView>
        <NavBar
          title={'Shop'}
          style={{ position: 'absolute', top: 0 }}
          sourceRight={Assets.add.source}
          onPressRight={this._onPressRight}
        />
        <ConfirmPurchase
          ref={r => (this._confirmPurchase = r)}
          show={showModal}
          openModal={this._openModal}
          closeModal={this._closeModal}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default ShopPage;
