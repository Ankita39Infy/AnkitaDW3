describe("When: Use the search feature", () => {
  it("Then: I should see search results as I am typing", () => {
    cy.startAt("/");
    cy.get('input[type="search"]').type("study");
    cy.get('[data-testing="book-item"]').should("have.length.greaterThan", 1);
  });
});
