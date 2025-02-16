import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image, Text, Touchable, Styles } from '../../../../re-kits';
import { colors, SCREEN_WIDTH } from '../../../utils';
import LinearGradient from 'react-native-linear-gradient';
import Moment from 'moment';
const item_width = SCREEN_WIDTH - 40 - 0;
const item_height = SCREEN_WIDTH * 0.5;
class CarouselCard extends React.Component {
  render() {
    const { isOdd, post, onPress, onLongPress } = this.props;
    const formatedDate = Moment(post.happenedAt);

    return (
      <Touchable
        style={{ width: item_width, height: item_height + 35, paddingTop: 35 }}
        onPress={onPress}
      >
        <Image
          source={{
            uri: post.imageUrls[0].imageUrl,
          }}
          processType={'post'}
          onLongPress={onLongPress}
          style={{
            width: item_width,
            height: item_height,
          }}
        />
        <View
          style={[
            styles.textContainer,
            { backgroundColor: colors.transparent },
          ]}
        >
          <LinearGradient
            style={Styles.absolute}
            colors={['rgba(33,33,33,0)', 'rgba(33,33,33,0.7)']}
          />
          <Text style={{ color: colors.white }} numberOfLines={2}>
            {post.content}
          </Text>
        </View>
        <View style={[styles.dateContainer, Styles.shadow, Styles.center]}>
          <View>
            <Text style={styles.year}>{formatedDate.format('YYYY')}</Text>
            <Text style={styles.month}>
              {formatedDate.format('MMM') + ' ' + formatedDate.format('DD')}
            </Text>
          </View>
        </View>
      </Touchable>
    );
  }
}

const styles = StyleSheet.create({
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  dateContainer: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 70,
    height: 70,
    backgroundColor: colors.white,
  },
  year: {
    fontSize: 20,
    fontWeight: '200',
  },
  month: {
    fontSize: 16,
  },
});

export default CarouselCard;
