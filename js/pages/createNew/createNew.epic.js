import { from, Observable, of, merge } from 'rxjs';
import { ofType } from 'redux-observable';
import {
  exhaustMap,
  switchMap,
  throttleTime,
  catchError,
  map,
} from 'rxjs/operators';
import Moment from 'moment';
import {
  XIAOMI_WEATHER_TYPE,
  DARK_SKY_WEATHER_TYPE,
} from './untils/weatherData';
import { Cache } from '../../utils';
import { CoinTransactionRecords } from '../../services';
const postInitialValues = {
  postType: 'normal',
  angry: 0,
  laugh: 0,
  nofeeling: 0,
  shock: 0,
  vomit: 0,
  popularity: 0,
  numOfComments: 0,
};
const getXiaomiWeather = weatherCode => {
  const found = XIAOMI_WEATHER_TYPE.find(o => o.code == weatherCode);
  if (found) {
    return found;
  } else {
    return XIAOMI_WEATHER_TYPE[0];
  }
};
const createPost = (
  action$,
  state$,
  { dispatch, httpClient, OSS, User, navigation },
) =>
  action$.pipe(
    ofType('CREATE_NEW_SEND_POST'),
    exhaustMap(({ payload }) =>
      Observable.create(async observer => {
        try {
          const {
            images,
            content,
            weatherInfo,
            tagId,
            tag,
            date,
            datePrecision,
          } = payload;
          observer.next(
            dispatch('GLOBAL_SET_STATE', {
              isLoading: true,
            }),
          );
          let imageUrls = [];
          for (let image of images) {
            if (
              image.type === 'unsplash' ||
              (image.type === 'local' && !!image.imageUrl)
            ) {
              imageUrls.push({ ...image });
            } else {
              const imageUrl = await OSS.upLoadImage(image.path);
              imageUrls.push({
                imageUrl,
                type: 'local',
                width: image.width,
                height: image.height,
                mime: image.mime,
                size: image.size,
                exif: image.exif,
              });
            }
          }
          const { data } = await httpClient.post('/post', {
            content: content,
            image_urls: imageUrls,
            user_id: User.objectId,
            weather_info: weatherInfo,
            post_type: 'normal',
            tag_id: tagId,
            happened_at: date,
            precision: datePrecision,
          });
          // observer.next(
          //   dispatch('HOME_PAGE_MUTATE_POSTS', {
          //     posts: {
          //       postId: data.postId,
          //       content,
          //       imageUrls,
          //       tagId,
          //       tag,
          //       happenedAt: date,
          //       weatherInfo,
          //       precision: datePrecision,
          //       userId: User.objectId,
          //       avatar: User.avatar,
          //       username: User.username,
          //       ...postInitialValues,
          //     },
          //   }),
          // );
          observer.next(
            dispatch('GLOBAL_SET_STATE', {
              isLoading: false,
            }),
          );
          navigation.back();
          CoinTransactionRecords.consume(10, 'create_post');
          observer.next(
            dispatch('SHOW_SNAKE_BAR', {
              content: '发布成功! +10',
              type: 'SUCCESS',
            }),
          );
        } catch (error) {
          console.warn(error.message);
          observer.next(
            dispatch('GLOBAL_SET_STATE', {
              isLoading: false,
            }),
          );
          observer.next(
            dispatch('SHOW_SNAKE_BAR', {
              content: '网络错误..!',
              type: 'ERROR',
            }),
          );
        } finally {
          observer.complete();
        }
      }),
    ),
  );
const getWeather = (action$, _, { dispatch, Network }) =>
  action$.pipe(
    ofType('CREATE_NEW_GET_WEATHER'),
    throttleTime(1000),
    exhaustMap(action =>
      Observable.create(async observer => {
        const { date } = action.payload;
        const isToady = Moment(date).isSame(Moment().format('YYYY-MM-DD'));
        const isFuture = Moment(date).isAfter(Moment().format('YYYY-MM-DD'));
        const isBefore1970 = Moment(date).isBefore('1970-01-01');
        const timestamp = Moment(date + 'T12:00:00+08:00').unix();
        if (isBefore1970) {
          observer.next(
            dispatch('SHOW_SNAKE_BAR', {
              type: 'ERROR',
              content: '这个时间不可以',
            }),
          );
          observer.complete();
          return;
        }
        if (isFuture) {
          observer.next(
            dispatch('SHOW_SNAKE_BAR', {
              type: 'ERROR',
              content: '未来的事情怎么会知道呢?',
            }),
          );
          observer.complete();
          return;
        }
        try {
          observer.next(
            dispatch('CREATE_NEW_SET_STATE', {
              isFetchingWeather: true,
            }),
          );
          const { data: ipInfo } = await Network.getIpInfo();
          let weatherInfo = {};

          if (isToady) {
            let { data: xiaomiWeather } = await Network.getWeatherInfoToday(
              ipInfo.lat,
              ipInfo.lon,
            );
            weatherInfo = {
              temperature: xiaomiWeather.current.temperature.value,
              weather: getXiaomiWeather(xiaomiWeather.current.weather).icon,
              weatherCode: xiaomiWeather.current.weather,
            };
          } else {
            let { data: darkSkyWeather } = await Network.getWeatherInfoBefore(
              ipInfo.lat,
              ipInfo.lon,
              timestamp,
            );
            weatherInfo = {
              temperature: darkSkyWeather.currently.temperature.toFixed(0),
              weather: DARK_SKY_WEATHER_TYPE[darkSkyWeather.currently.icon],
              weatherCode: darkSkyWeather.currently.icon,
            };
          }

          observer.next(
            dispatch('CREATE_NEW_SET_STATE', {
              weatherInfo,
              isFetchingWeather: false,
            }),
          );
          observer.complete();
        } catch (error) {
          observer.next(
            dispatch('CREATE_NEW_SET_STATE', {
              isFetchingWeather: false,
            }),
          );
          console.warn(error.message);
          observer.complete();
        }
      }),
    ),
  );
const fetchUserRecentlyUsedTags = (
  action$,
  _,
  { httpClient, User, dispatch, $retryDelay },
) =>
  action$.pipe(
    ofType('CREATE_NEW_FETCH_USER_USED_TAGS'),
    switchMap(_ => {
      if (!User.isLoggedIn) {
        return of(dispatch(null));
      }
      const arr = [];
      arr.push(
        from(Cache.get(Cache.CACHE_KEYS.USER_USED_TAGS)).pipe(
          map(data =>
            data
              ? dispatch('CREATE_NEW_SET_STATE', {
                  tags: data,
                })
              : dispatch(null),
          ),
        ),
      );
      arr.push(
        from(
          httpClient.get('/tag/user_tag', {
            params: {
              user_id: User.objectId,
            },
          }),
        ).pipe(
          map(({ data }) =>
            dispatch('CREATE_NEW_SET_STATE', {
              tags: data,
            }),
          ),
          $retryDelay(),
          catchError(error => {
            console.warn(error);
            return of(dispatch(null));
          }),
        ),
      );
      return merge(...arr);
    }),
  );
export default [createPost, getWeather, fetchUserRecentlyUsedTags];
