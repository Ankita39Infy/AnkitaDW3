# Code Smells

1. To make the variable names more descriptive changed the name convention in the `book-search.component.html` and -b is replaced with book.

2. Added angular built-in date pipe for performance improvement in `book-search.component.html` for published date. This will fetch the response once and will fetch from the last result only.

3. Used ngSubmit instead of submit in the `book-search.component.html` this is done to prevent default submit when the handler code throws and causes an actual http post request. HTML `submit` event tries to POST the form to the current URL. `ngSubmit` prevents default submit event by returning false hence switched to ngSubmit.

4. For displaying the book data Added `async` pipe this is used in the template which unsubscribes when component is torn down.

5. For better readability of the list in the `reading-list.component.html` added space while join (book.authors.join( ', ' ))

# Improvements

1.  Loading spinner should be added to show the ongoing process while API responds to give better user experience.

2.  Custom error message should be displayed in case of API failure at network end or at API end.

# Web Accessibility issues

## From Lighthouse report:

1. `aria-label` attribute is added to buttons since it didn't had accessible names to the search button in `book-search.component.html`.

2. Updated background and foreground colors to achieve sufficient contrast in the reading list component.

## Manually detected:

1. For better accessibility, we can provide a label for objects wherever needed so that it can be read by assistive technology. For this reason added `aria-label` in book-search.component.html and app.component.html.

2. Updated the background color for better visibility of the button in `app.component.scss`.

3. Added `hover` effect to the button for better accessibity.

4. In `book-search.component.html` to improve accessibility, added button element in place of the anchor tag (<a>) used as a button. Anchor tag are better used for navigation in between pages here added button which is used for in page action with an click event listener.

5. The buttons can be made visually focusable and accessible. The closing button of reading list in `app.component.html` is made focusable by adding outline in `app.component.scss`.

6. Added `alt` for the image for the reading list and book list. The required to specifies an alternate text for an interactive image, if the image for some reason cannot be displayed (because of slow connection, an error in the src attribute, or if the user uses a screen reader) we can keep it empty for non interactive image. This is added in `book-search.component.html` and `reading-list.component.html`.
