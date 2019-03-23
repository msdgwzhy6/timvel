import { ofType } from 'redux-observable';
import { Observable, pipe, interval } from 'rxjs';
import { map, mergeMap, throttle, takeLast, debounce } from 'rxjs/operators';

const fetchPopularTags = (action$, state$, { httpClient, dispatch }) =>
  action$.pipe(
    ofType('ADD_TAG_FETCH_POPULAR'),
    mergeMap(action =>
      Observable.create(async observer => {
        try {
          const { data } = await httpClient.get('/tag/popular');
          observer.next(
            dispatch('ADD_TAG_SET_STATE', {
              popularTags: data,
            }),
          );
        } catch (error) {
          console.warn(error);
        } finally {
          observer.complete();
        }
      }),
    ),
  );

const insertTag = (action$, state$, { httpClient, dispatch }) =>
  action$.pipe(
    ofType('ADD_TAG_ADD_TAG'),
    mergeMap(action =>
      Observable.create(async observer => {
        try {
          const { tag, callback } = action.payload;
          const { data } = await httpClient.post('/tag', {
            tag: tag.trim(),
          });
          observer.next(
            dispatch('SHOW_SNAKE_BAR', {
              type: 'SUCCESS',
              content: 'Tag added!',
            }),
          );
          callback && callback({ tag, popularity: 0, ...data });
        } catch (error) {
          console.warn(error);
        } finally {
          observer.complete();
        }
      }),
    ),
  );
const searchTag = (action$, state$, { httpClient, dispatch }) =>
  action$.pipe(
    ofType('ADD_TAG_SEARCH_TAG'),
    debounce(action => interval(300)),
    mergeMap(action =>
      Observable.create(async observer => {
        try {
          const { tag } = action.payload;
          let fixedTag = tag
            .trim()
            .split('')
            .join('%');
          if (tag.trim().length === 0) {
            fixedTag = null;
          }
          const { data } = await httpClient.get('/tag', {
            params: {
              tag: fixedTag,
            },
          });
          observer.next(
            dispatch('ADD_TAG_SET_STATE', {
              searchResults: data,
            }),
          );
        } catch (error) {
          console.warn(error);
        } finally {
          observer.complete();
        }
      }),
    ),
  );
export default [fetchPopularTags, insertTag, searchTag];
