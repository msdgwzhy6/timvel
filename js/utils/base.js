import React, { Component } from 'react';
import { Platform, Dimensions, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  'window',
);

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export function realSize(px) {
  return px * SCREEN_WIDTH / 375;
}

export function randomItem(arr, returnLength) {
  if (typeof returnLength === 'undefined') {
    let i = Math.floor(Math.random() * arr.length);
    return arr[i];
  } else {
    let returnArr = [];
    let flag = 0;
    for (let i = 0; i++; i < returnLength.length) {
      let item = randomItem(_.difference(arr, returnArr));
      if (returnArr.includes(item)) {
        flag = flag + 1;
      } else {
        returnArr.push(item);
      }
    }
    return returnArr;
  }
}

export const Styles = {
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: isIOS
    ? {
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
          height: 4,
          width: 3,
        },
      }
    : { elevation: 1 },
};

export const isIphoneX =
  isIOS &&
  ((SCREEN_HEIGHT === 812 && SCREEN_WIDTH === 375) ||
    (SCREEN_HEIGHT === 375 && SCREEN_WIDTH === 812));

export const colors = {
  main: '#00e5ff',
  red: '#ff8a80',
  white: '#fafafa',
  lightGrey: '#f5f5f5',
  midGrey: '#9e9e9e',
  depGrey: '#616161',
};

export const PADDING_TOP = isIOS ? (isIphoneX ? 44 : 20) : 0;
export const PADDING_BOTTOM = isIphoneX ? 34 : 0;
export const NAV_BAR_HEIGHT = isIOS ? (isIphoneX ? 44 + 44 : 20 + 44) : 44;
export const TAB_BAR_HEIGHT = isIphoneX ? 34 + 48 : 48;
export function renderTitle(title, customStyle) {
  const renderText = style => {
    return <Text style={[styles.qing, style]}>{title}</Text>;
  };

  var style = {};
  switch (title) {
    case '青': {
      style = {
        color: '#00ffff',
        borderColor: '#00ffff',
      };
      break;
    }

    case '神': {
      style = {
        borderColor: '#ffc400',
        color: '#ffc400',
      };
      break;
    }

    case '侠': {
      style = {
        color: '#00b0ff',
        borderColor: '#00b0ff',
      };
      break;
    }

    case '魅': {
      style = {
        color: '#ec407a',
        borderColor: '#ec407a',
      };
      break;
    }

    case '萌': {
      style = {
        color: '#f484b1',
        borderColor: '#f484b1',
      };
      break;
    }

    case '邪': {
      style = {
        color: '#d500f9',
        borderColor: '#d500f9',
      };
      break;
    }

    case '魔': {
      style = {
        color: '#311b92',
        borderColor: '#311b92',
      };
      break;
    }

    case '妖': {
      style = {
        color: '#7cb342',
        borderColor: '#7cb342',
      };
      break;
    }

    case '绫': {
      style = {
        color: '#4dd0e1',
        borderColor: '#4dd0e1',
      };
      break;
    }

    case '鱼唇': {
      style = {
        color: '#ff7043',
        borderColor: '#ffc400',
      };
      break;
    }

    default:
      if (customStyle) {
        return renderText(customStyle);
      } else {
        return null;
      }
  }

  return renderText(style);
}

const styles = StyleSheet.create({
  qing: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    textAlign: 'center',
    marginLeft: realSize(2),
    fontSize: realSize(12),
    borderWidth: realSize(1),
    marginHorizontal: realSize(4),
  },
});
