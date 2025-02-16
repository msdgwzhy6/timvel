import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Button,
  NavBar,
  Image,
  Assets,
  BasicView,
  NAV_BAR_HEIGHT_FULL,
} from '../../../re-kits';
import {
  colors,
  TAB_BAR_HEIGHT,
  User,
  curried,
  retry3,
  HANDLE,
  showCoinIncreaseAnimation,
  Network,
  I18n,
  apiClient,
} from '../../utils';
import ProductCard from './components/ProductCard';
import ConfirmPurchase from './pages/ConfirmPurchase';
const PRODUCT_TYPES = [
  'avatar',
  'draw_lots',
  'sticker',
  'one_time',
  'title',
  'draw_title',
];
class ShopPage extends Component {
  componentDidMount() {
    this._fetchProducts();
  }

  _setState = (nextState = {}) =>
    this.props.dispatch('SHOP_PAGE_SET_STATE', nextState);
  _fetchProducts = () => {
    this.props.dispatch('SHOP_PAGE_FETCH_PRODUCTS');
  };

  _openModal = () => {
    this._setState({
      showModal: true,
    });
  };

  _closeModal = () => {
    this._setState({
      showModal: false,
    });
  };

  _onPressRight = () => {
    if (!User.isLoggedIn) {
      this.props.dispatch('GLOBAL_SHOW_SIGN_UP');
      return;
    }
    this.props.navigation.navigate({
      routeName: 'publishProduct',
    });
  };

  _onPressPurchase = product => {
    if (!User.isLoggedIn) {
      this.props.dispatch('GLOBAL_SHOW_SIGN_UP');
      return;
    }
    if (!PRODUCT_TYPES.includes(product.productType)) {
      this.props.dispatch('SHOW_SNAKE_BAR', {
        type: 'ERROR',
        content: I18n.t('unknownProductType'),
      });
      return;
    }
    this._setState({
      currentProduct: product,
    });
    this._confirmPurchaseModal.open();
  };
  _switchProductHandler = currentProduct => {
    switch (currentProduct.productType) {
      case 'avatar':
        return this._typeAvatar(currentProduct);
      case 'draw_lots':
        return this._typeDrawLots(currentProduct);
      case 'sticker':
        return this._typeSticker(currentProduct);
      case 'one_time':
        return this._typeOnetime(currentProduct);
      // case 'title':
      //   return this._typeTitle(currentProduct);
      case 'draw_title':
        return this._drawTitle(currentProduct);
      default:
        return;
    }
  };
  _confirmPurchase = async currentProduct => {
    try {
      if (!PRODUCT_TYPES.includes(currentProduct.productType)) {
        this.props.dispatch('SHOW_SNAKE_BAR', {
          type: 'ERROR',
          content: I18n.t('unknownProductType'),
        });
        return;
      }
      if (!(await User.ableToBuy(currentProduct.price))) {
        this.props.dispatch('SHOW_SNAKE_BAR', {
          type: 'ERROR',
          content: I18n.t('noEnoughCoin'),
        });
        return;
      }
      await this._transaction(currentProduct);
      showCoinIncreaseAnimation(-parseInt(currentProduct.price));
      this.props.snakeBar(I18n.t('niceDeal'));
      this._switchProductHandler(currentProduct);
    } catch (error) {
      console.warn(error.message);
    }
  };

  _transaction = product => {
    return apiClient.post('/product/purchase', {
      buyer_user_id: User.objectId,
      price: product.price,
      product_id: product.productId,
      seller_user_id: product.userId,
      product_type: product.productType,
      title_id: product.titleId,
    });
  };
  /**
   *
   *
   * @memberof ShopPage
   * change avatar
   */
  _typeAvatar = async product => {
    try {
      await User.updateAvatar(product.imageUrl);
      this.props.snakeBar('Avatar updated!');
    } catch (error) {
      console.warn(error);
    }
  };

  /**
   *
   *
   * @memberof ShopPage
   * add data to database
   * then draw one manually
   */
  _typeDrawLots = product => {};

  /**
   *
   *
   * @memberof ShopPage
   * save to album
   */
  _typeSticker = product => {
    this.props.dispatch('SHOP_PAGE_SAVE_IMAGE_TO_ALBUM', {
      imageUrl: product.imageUrl,
    });
  };

  /**
   *
   *
   * @memberof ShopPage
   * show image one time
   */
  _typeOnetime = product => {
    this.props.dispatch('PHOTO_BROWSER_SHOW', {
      images: [product.imageUrl],
    });
    this.props.dispatch('SHOW_SNAKE_BAR', {
      content: I18n.t('oneTimeWarn'),
    });
  };

  /**
   *
   *
   * @memberof ShopPage
   * buy a title
   */
  _typeTitle = product => {};

  /**
   *
   *
   * @memberof ShopPage
   * draw a title
   */
  _drawTitle = product => {};

  render() {
    const { products, isLoading, isError } = this.props.state;
    const renderProducts = products.map(this._renderItem);
    return (
      <View style={styles.container}>
        <BasicView
          isLoading={isLoading}
          isError={isError}
          onPressError={this._fetchProducts}
          style={styles.container}
        >
          <ScrollView
            style={{ flex: 1, backgroundColor: colors.lightGrey }}
            contentContainerStyle={styles.scrollContainer}
          >
            {renderProducts}
          </ScrollView>
        </BasicView>
        <NavBar
          title={I18n.t('shop')}
          style={{ position: 'absolute', top: 0 }}
          sourceRight={Assets.add.source}
          onPressRight={this._onPressRight}
          blur={true}
        />
        {this._renderConfrimPurchase()}
      </View>
    );
  }

  _renderItem = (item, index) => {
    return (
      <ProductCard
        key={index}
        product={item}
        onPressPurchase={curried(this._onPressPurchase)(item)}
      />
    );
  };
  _renderConfrimPurchase = () => {
    const { showModal, currentProduct } = this.props.state;
    return (
      <ConfirmPurchase
        ref={r => (this._confirmPurchaseModal = r)}
        show={showModal}
        openModal={this._openModal}
        closeModal={this._closeModal}
        currentProduct={currentProduct}
        onPressPurchase={curried(this._confirmPurchase)(currentProduct)}
      />
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: NAV_BAR_HEIGHT_FULL,
    paddingBottom: TAB_BAR_HEIGHT,
    justifyContent: 'space-between',
  },
});

export default ShopPage;
