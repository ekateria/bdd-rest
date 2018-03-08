# Massive REST API testing

## How to install

    yarn install

## How to run

    1. Rename ./profiles/default/config.yml.example to config.yml and change properties to your needs
    2. Run yarn test

    [if not defined then tests are run with default profile]

## How to run with profile

    Profiles are defined in ./cucumber.js

    Then use

    yarn test --profile=<profilename>

## How to add new profile

    Profiles are defined in ./cucumber.js

    1. create new directory in ./profiles/<profile_name>
    2. add new property to ./cucumber.js module

        '<profile_name>': common + '<another cli parameters see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md >',
 