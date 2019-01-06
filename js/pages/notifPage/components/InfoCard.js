import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Image, Assets, Touchable } from '../../../../re-kits';
import { base, I18n } from '../../../utils';
import PropTypes from 'prop-types';
const { SCREEN_WIDTH, colors, colorSets, randomItem } = base;
const item_height = 60;
const item_width = SCREEN_WIDTH;
class Card extends Component {
  constructor(props) {
    super(props);
    this.tintColor = randomItem(colorSets);
  }
  componentWillMount() {}

  render() {
    const { title, onPress, style, iconSource } = this.props;
    return (
      <Touchable onPress={onPress}>
        <View style={[styles.container, style]}>
          <Image source={iconSource || Assets.bk3.source} size={'small'} />
          <Text style={styles.text}>{title}</Text>
          <Image
            source={Assets.arrow_right.source}
            size={'verySmall'}
            tintColor={this.tintColor}
            resizeMode={'contain'}
          />
        </View>
      </Touchable>
    );
  }
}
Card.propTypes = {};

const styles = StyleSheet.create({
  container: {
    height: item_height,
    width: item_width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 2,
    backgroundColor: colors.pureWhite,
  },
  text: {
    flex: 1,
    marginHorizontal: 20,
    fontSize: 14,
  },
});

export default Card;
