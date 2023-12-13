import { TestBed } from '@angular/core/testing';
import { ReplaySubject, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import {
  createReadingListItem,
  SharedTestingModule,
} from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import { takeUntil } from 'rxjs/operators';
import * as ReadingListActions from './reading-list.actions';

describe('ReadingListEffect', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;
  let unsubscribe$: Subject<void>;
  actions = new ReplaySubject();
  const itemList = createReadingListItem('A');
  const finishedDate = new Date().toISOString();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    unsubscribe$ = new Subject<void>();
  });

  describe('loadReadingList$', () => {
    it('load reading list properly', (done) => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.init());

      effects.loadReadingList$
        .pipe(takeUntil(unsubscribe$))
        .subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.loadReadingListSuccess({ list: [] })
          );
          done();
        });

      httpMock.expectOne('/api/reading-list').flush([]);
    });
  });

  describe('markBookAsFinished$', () => {
    it('should mark book as finished', (done) => {
      actions.next(
        ReadingListActions.markBookAsFinished({
          item: itemList,
          finishedDate: finishedDate,
        })
      );

      effects.markBookAsFinished$
        .pipe(takeUntil(unsubscribe$))
        .subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.markBookAsFinishedSuccess({
              item: itemList,
              finishedDate: finishedDate,
            })
          );
          done();
        });

      httpMock
        .expectOne('/api/reading-list/A/finished')
        .flush({
          item: itemList,
          finishedDate: finishedDate,
          type: '[Reading List API] Mark book as finished',
        });
    });
    it('should undo the added book when API returns error', (done) => {
      actions.next(
        ReadingListActions.markBookAsFinished({
          item: itemList,
          finishedDate: finishedDate,
        })
      );

      effects.markBookAsFinished$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedToMarkBookAsFinished({ item: itemList })
        );
        done();
      });

      httpMock
        .expectOne(`/api/reading-list/A/finished`)
        .flush({}, { status: 500, statusText: 'server error' });
    });
  });
});
