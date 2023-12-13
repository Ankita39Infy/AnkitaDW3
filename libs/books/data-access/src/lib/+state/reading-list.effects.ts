import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { Book, ReadingListItem } from '@tmo/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import * as ReadingListActions from './reading-list.actions';
import { BOOKS_DATA_ACCESS_CONSTANTS as CONSTANTS } from '../books-data-access.module.constants';

@Injectable()
export class ReadingListEffects implements OnInitEffects {
  loadReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.init),
      exhaustMap(() =>
        this.http.get<ReadingListItem[]>(CONSTANTS.READING_LIST_API).pipe(
          map((data) =>
            ReadingListActions.loadReadingListSuccess({ list: data })
          ),
          catchError((error) =>
            of(ReadingListActions.loadReadingListError({ error }))
          )
        )
      )
    )
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.addToReadingList),
      concatMap(({ book, addBook }) =>
        this.http.post(CONSTANTS.READING_LIST_API, book).pipe(
          map(() =>
            ReadingListActions.confirmedAddToReadingList({ book, addBook })
          ),
          catchError(() =>
            of(ReadingListActions.failedAddToReadingList({ book }))
          )
        )
      )
    )
  );

  removeBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.removeFromReadingList),
      concatMap(({ readingListItem, removeBook }) =>
        this.http.delete(`/api/reading-list/${readingListItem.bookId}`).pipe(
          map(() =>
            ReadingListActions.confirmedRemoveFromReadingList({
              readingListItem,
              removeBook,
            })
          ),
          catchError(() =>
            of(
              ReadingListActions.failedRemoveFromReadingList({
                readingListItem,
              })
            )
          )
        )
      )
    )
  );

  showSnackBarOnAdd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.confirmedAddToReadingList),
      concatMap((action) => {
        const typeItem: ReadingListItem = {
          ...action.book,
          bookId: action.book.id,
        };
        if (action.addBook === true) {
          return this.snackBar
            .open(`Added ${action.book.title} to reading list`, 'Undo', {
              duration: 2000,
            })
            .onAction()
            .pipe(
              map(() =>
                ReadingListActions.removeFromReadingList({
                  readingListItem: typeItem,
                  removeBook: true,
                })
              )
            );
        } else {
          return [];
        }
      })
    )
  );

  showSnackBarOnRemove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.confirmedRemoveFromReadingList),
      concatMap((action) => {
        const typeBook: Book = {
          id: action.readingListItem.bookId,
          ...action.readingListItem,
        };
        if (action.removeBook === false) {
          return this.snackBar
            .open(
              `Removed ${action.readingListItem.title} from reading list`,
              'Undo',
              { duration: CONSTANTS.SNACK_BAR.DURATION }
            )
            .onAction()
            .pipe(
              map(() =>
                ReadingListActions.addToReadingList({
                  book: typeBook,
                  addBook: true,
                })
              )
            );
        } else {
          return [];
        }
      })
    )
  );

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private readonly store: Store
  ) {}
}
