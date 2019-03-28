/*
 * File: /Users/origami/Desktop/timvel/js/utils/Vibration.js
 * Project: /Users/origami/Desktop/timvel
 * Created Date: Saturday March 23rd 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Thursday March 28th 2019 9:41:00 am
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import { Vibration } from 'react-native';
import { isIOS } from './base';
const PATTERN = 120;
export const vibrate = num => {
  if (isIOS) {
    return;
  }
  Vibration.vibrate(num || PATTERN);
};
