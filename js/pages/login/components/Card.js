import React, { Component } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Image, Text } from '../../../../re-kits';
import {} from '../../../utils';
import PropTypes from 'prop-types';

class Card extends Component {
  componentWillMount() {}

  render() {
    return (
      <View style={styles.container}>
        <Text>{'welcome'}</Text>
      </View>
    );
  }
}
Card.propTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default Card;
