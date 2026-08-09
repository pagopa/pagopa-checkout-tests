@auth @spid
Feature: Checkout SPID Authentication
  As a user of the Checkout platform
  I want to authenticate using SPID identity provider
  So that I can securely access the payment checkout

  Background:
    Given the user is on the Checkout homepage
    And the language is set to "it"

  @smoke
  Scenario: Successful login via SPID identity provider
    When the user starts the login process
    And the user authenticates with the SPID identity provider
    Then the user should be logged in successfully

  @smoke
  Scenario: Successful logout after SPID authentication
    Given the user is authenticated via SPID
    When the user requests to logout
    And the user confirms the logout
    Then the user should be logged out
    And the login button should be visible
