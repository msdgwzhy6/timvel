import { ofType } from 'redux-observable';
import { Observable, from, of, throwError, merge } from 'rxjs';
import {
  mergeMap,
  throttleTime,
  concatMap,
  catchError,
  tap,
  map,
  switchMap,
  startWith,
  delay,
} from 'rxjs/operators';
import { randomItem, Cache, retry3, sortPosts, I18n } from '../../utils';
import { colorSets } from '../../../re-kits';
import * as R from 'ramda';
const generateColorsUntil = (colors = [], toNum) => {
  const _colors = colors.concat(randomItem(colorSets, toNum - colors.length));
  if (_colors.length >= toNum) {
    return _colors;
  }
  return generateColorsUntil(_colors, toNum);
};
const fetchMostPopularPosts = (action$, state$, { httpClient, dispatch }) =>
  action$.pipe(
    ofType('HOME_PAGE_FETCH_POPULAR_POSTS'),
    mergeMap(action =>
      Observable.create(async observer => {
        try {
          const cached = await Cache.get(Cache.CACHE_KEYS.HOME_PAGE_POPULAR);
          if (cached) {
            observer.next(
              dispatch('HOME_PAGE_SET_STATE', {
                popularPosts: cached,
              }),
            );
          }
          const { data } = await httpClient.get('/post/popular', {
            params: {
              limit: 5,
            },
          });
          observer.next(
            dispatch('HOME_PAGE_SET_STATE', {
              popularPosts: data,
            }),
          );
          Cache.set(Cache.CACHE_KEYS.HOME_PAGE_POPULAR, data)
            .then(() => {})
            .catch(() => {});
        } catch (error) {
          console.warn(error.message);
        } finally {
          observer.complete();
        }
      }),
    ),
  );

const fetchPosts = (action$, state$, { dispatch, httpClient }) =>
  action$.pipe(
    ofType('HOME_PAGE_FETCH_POSTS'),
    mergeMap(action =>
      Observable.create(async observer => {
        try {
          const { happenedAt, offset } = action.payload;
          const cached = await Cache.get(Cache.CACHE_KEYS.HOME_PAGE_FEEDS);
          if (cached) {
            observer.next(
              dispatch('HOME_PAGE_MUTATE_POSTS', { posts: cached }),
            );
          } else {
            observer.next(
              dispatch('HOME_PAGE_SET_STATE', {
                isHeaderLoading: true,
              }),
            );
          }
          const { data } = await httpClient.get('/post', {
            happened_at: happenedAt,
            offset,
          });
          observer.next(dispatch('HOME_PAGE_MUTATE_POSTS', { posts: data }));
          Cache.set(Cache.CACHE_KEYS.HOME_PAGE_FEEDS, data)
            .then(() => {})
            .catch(() => {});
          if (!cached) {
            observer.next(
              dispatch('HOME_PAGE_SET_STATE', {
                isHeaderLoading: false,
              }),
            );
          }
        } catch (error) {
          console.warn(error.message);
          observer.next(
            dispatch('HOME_PAGE_SET_STATE', {
              isHeaderLoading: false,
            }),
          );
        } finally {
          observer.complete();
        }
      }),
    ),
  );

const fetchMorePosts = (action$, state$, { dispatch, httpClient }) =>
  action$.pipe(
    ofType('HOME_PAGE_FETCH_MORE_POSTS'),
    throttleTime(3000),
    switchMap(({ payload }) => {
      const { date, postIds } = payload;
      const actions = [];
      actions.push(
        of(
          dispatch('HOME_PAGE_SET_STATE', {
            isFooterLoading: true,
          }),
        ),
      );
      actions.push(
        retry3(
          httpClient.get('/post/more', {
            params: {
              happened_at: date,
              post_ids: postIds,
            },
          }),
        ).pipe(
          map(({ data }) =>
            data.length === 0
              ? dispatch('SHOW_SNAKE_BAR', {
                  message: I18n.t('noMoreData'),
                })
              : dispatch('HOME_PAGE_MUTATE_POSTS', {
                  posts: data,
                  isFooterLoading: false,
                }),
          ),
          catchError(err => {
            console.warn('err', err.message);
            return of(
              dispatch('HOME_PAGE_SET_STATE', {
                isFooterLoading: false,
              }),
            );
          }),
        ),
      );

      return merge(...actions);
    }),
  );
const pressEmoji = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofType('HOME_PAGE_PRESS_EMOJI'),
    concatMap(action => {
      const { emoji, postId } = action.payload;
      const { posts } = state$.value.homePage;
      const fixedPosts = posts.map(o => {
        if (o.postId === postId) {
          return {
            ...o,
            [emoji]: o[emoji] + 1,
          };
        }
        return o;
      });
      return of(
        dispatch('HOME_PAGE_SET_STATE', {
          posts: fixedPosts,
        }),
        dispatch('HOME_PAGE_PRESS_EMOJI_SEND_REQUEST', action.payload),
      );
    }),
  );

const onPressEmojiRequest = (action$, state$, { httpClient, User, dispatch }) =>
  action$.pipe(
    ofType('HOME_PAGE_PRESS_EMOJI_SEND_REQUEST'),
    throttleTime(500),
    concatMap(({ payload }) => {
      if (!User.isLoggedIn) {
        return of(dispatch('GLOBAL_SHOW_SIGN_UP'));
      }
      return from(
        httpClient.post('/post/emoji', {
          emoji: payload.emoji,
          post_id: payload.postId,
          user_id: User.objectId,
        }),
      ).pipe(
        tap(_ => console.warn('success')),
        map(_ => dispatch(null)),
        catchError(err => {
          console.warn(err.message);
          return of(dispatch(null));
        }),
      );
    }),
  );
const mutatePosts = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofType('HOME_PAGE_MUTATE_POSTS'),
    map(({ payload }) => {
      const { posts: nextPosts, ...additionalProps } = payload;
      const { posts, colorsSets } = state$.value.homePage;
      const next = R.uniqBy(
        a => a.postId,
        Array.isArray(nextPosts)
          ? posts.concat(nextPosts)
          : [nextPosts].concat(posts),
      );
      const nextColors = generateColorsUntil(colorsSets, next.length + 1);
      return dispatch('HOME_PAGE_SET_STATE', {
        colorsSets: nextColors,
        posts: sortPosts(next),
        ...additionalProps,
      });
    }),
  );

export default [
  fetchMostPopularPosts,
  fetchPosts,
  pressEmoji,
  onPressEmojiRequest,
  fetchMorePosts,
  mutatePosts,
];
