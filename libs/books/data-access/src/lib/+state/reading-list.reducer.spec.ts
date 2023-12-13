import * as ReadingListActions from './reading-list.actions';
import { initialState, readingListAdapter, reducer, State } from './reading-list.reducer';
import { createBook, createReadingListItem } from '@tmo/shared/testing';

describe( 'Reading List Reducer', () => {
    describe( 'valid Books actions', () => {
        let state: State;

        beforeEach( () => {
            state = readingListAdapter.setAll(
                [ createReadingListItem( 'A' ), createReadingListItem( 'B' ) ],
                initialState
            );
        } );

        it( 'loadBooksSuccess action should load books from reading list', () => {
            const list = [
                createReadingListItem( 'A' ),
                createReadingListItem( 'B' ),
                createReadingListItem( 'C' )
            ];
            const action = ReadingListActions.loadReadingListSuccess( { list } );

            const result: State = reducer( initialState, action );

            expect( result.loaded ).toBe( true );
            expect( result.ids.length ).toEqual( 3 );
        } );

        it( 'failedAddToReadingList action should undo book addition to the state', () => {
            const action = ReadingListActions.failedAddToReadingList( {
                                                                          book : createBook( 'B' )
                                                                      } );

            const result: State = reducer( state, action );

            expect( result.ids ).toEqual( [ 'A' ] );
        } );

        it( 'failedRemoveFromReadingList action should undo book removal from the state', () => {
            const action = ReadingListActions.failedRemoveFromReadingList( {
                                                                               item : createReadingListItem( 'C' )
                                                                           } );

            const result: State = reducer( state, action );

            expect( result.ids ).toEqual( [ 'A', 'B', 'C' ] );
        } );
    } );

    describe( 'mark book as finished', () => {

        let state: State;
        state = readingListAdapter.setAll(
            [ createReadingListItem( 'A' ), createReadingListItem( 'B' ) ],
            initialState
        );

        it( 'markBookAsFinished action should successfully mark the book as finished', () => {
            const action = ReadingListActions.markBookAsFinished( {
                                                                      item : createReadingListItem( 'A' ),
                                                                      finishedDate : new Date().toISOString()
                                                                  } );

            const result: State = reducer( state, action );

            expect( result.entities[ 'A' ].finished ).toEqual( true );
        } );

        it( 'failedToMarkBookAsFinished action should fail to mark the book as finished', () => {
            const action = ReadingListActions.failedToMarkBookAsFinished( {
                                                                            item : createReadingListItem( 'A' )
                                                                        } );

            const result: State = reducer( state, action );

            expect( result.entities[ 'A' ].finished ).toEqual( false );
        } );
    } );

    describe( 'unknown action', () => {
        it( 'should return the previous state', () => {
            const action = {} as any;

            const result = reducer(initialState, action);

            expect(result).toEqual(initialState);
        });
    });
});
