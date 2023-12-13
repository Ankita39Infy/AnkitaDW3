import { fakeAsync, TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import {
  createBook,
  createReadingListItem,
  SharedTestingModule,
} from "@tmo/shared/testing";
import { ReadingListEffects } from "./reading-list.effects";
import * as ReadingListActions from "./reading-list.actions";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Book, ReadingListItem } from "@tmo/shared/models";
import { takeUntil } from "rxjs/operators";

describe("ReadingListEffect", () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;
  let readingListItem: ReadingListItem;
  let book: Book;
  let snackBar: MatSnackBar;
  let store: MockStore;

  beforeAll(() => {
    readingListItem = createReadingListItem("A");
    book = createBook("B");
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, MatSnackBarModule],
      providers: [
        ReadingListEffects,
        {
          provide: MatSnackBar,
          useVale: {
            open: (param1, param2) => {
              return;
            },
          },
        },
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    actions = new ReplaySubject();
    store = TestBed.inject(MockStore);
    snackBar = TestBed.inject(MatSnackBar);
  });

  describe("loadReadingList$", () => {
    it("should load reading list successfully", (done) => {
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne("/api/reading-list").flush([]);
    });
  });

  describe("addBook$", () => {
    it("should add a book to the reading list successfully", fakeAsync(() => {
      actions.next(
        ReadingListActions.addToReadingList({ book, addBook: false })
      );

      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({ book, addBook: false })
        );
      });

      httpMock.expectOne("/api/reading-list").flush({});
    }));

    it("should remove the added book when API returns error", fakeAsync(() => {
      actions.next(
        ReadingListActions.addToReadingList({ book, addBook: false })
      );

      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedAddToReadingList({ book })
        );
      });

      httpMock
        .expectOne("/api/reading-list")
        .flush({}, { status: 500, statusText: "Server Error" });
    }));

    it("show snackbar on add book", async () => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.confirmedAddToReadingList({ book, addBook: false })
      );

      effects.showSnackBarOnAdd$.subscribe(() => {
        snackBar
          .open(`Added ${book.title} to reading list`, "Undo", {
            duration: 2000,
          })
          .onAction()
          .subscribe((action) => {
            expect(action).toEqual(
              ReadingListActions.removeFromReadingList({
                readingListItem: readingListItem,
                removeBook: true,
              })
            );
          });
      });
    });
  });

  describe("removeBook$", () => {
    it("should remove book successfully from reading list", (done) => {
      actions.next(
        ReadingListActions.removeFromReadingList({
          readingListItem,
          removeBook: false,
        })
      );

      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({
            readingListItem,
            removeBook: false,
          })
        );

        done();
      });

      httpMock
        .expectOne(`/api/reading-list/${readingListItem.bookId}`)
        .flush({});
    });

    it("should add removed book when API returns error", fakeAsync(() => {
      actions.next(
        ReadingListActions.removeFromReadingList({
          readingListItem,
          removeBook: false,
        })
      );

      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedRemoveFromReadingList({ readingListItem })
        );
      });

      httpMock
        .expectOne(`/api/reading-list/${readingListItem.bookId}`)
        .flush({}, { status: 500, statusText: "Server Error" });
    }));

    it("show snackbar on remove book", async () => {
      actions = new ReplaySubject();
      actions.next(
        ReadingListActions.confirmedRemoveFromReadingList({
          readingListItem,
          removeBook: false,
        })
      );

      effects.showSnackBarOnRemove$.subscribe(() => {
        snackBar
          .open(`Removed ${readingListItem.title} from reading list`, "Undo", {
            duration: 2000,
          })
          .onAction()
          .subscribe((action) => {
            expect(action).toEqual(
              ReadingListActions.addToReadingList({ book: book, addBook: true })
            );
          });
      });
    });
  });
});
