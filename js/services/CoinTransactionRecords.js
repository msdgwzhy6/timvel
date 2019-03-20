/*
 * File: /Users/origami/Desktop/timvel/js/services/CoinTransactionRecords.js
 * Project: /Users/origami/Desktop/timvel
 * Created Date: Saturday March 16th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Monday March 18th 2019 8:02:25 am
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import { Network, User, HANDLE, $retryDelay, $CENTER, $TYPES } from '../utils';
import { from } from 'rxjs';
import {} from 'rxjs/operators';
const insertNewTransactionRecord = ({ type, amount }) => {
  from(
    Network.apiClient.post('/transaction_records', {
      user_id: User.id(),
      type,
      amount,
    }),
  )
    .pipe($retryDelay())
    .subscribe(HANDLE());
};
const showAnimation = transaction => {
  $CENTER.next({
    type: $TYPES.coinTransaction,
    payload: {
      transaction,
    },
  });
};
const consume = (amount, type, insertRecord = true) => {
  showAnimation(amount);
  User.increaseCoin(amount);
  if (!insertRecord) {
    return;
  }
  insertNewTransactionRecord({
    type,
    amount,
  });
};

export { insertNewTransactionRecord, consume, showAnimation };
