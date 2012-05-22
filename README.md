# Simple Security Helper for Meteor

A simple smart package for turning off Meteor's automatically generated Mongo accessors

Exports method for turning off all (or some) of the update/insert/remove server methods to prevent clients from changing data outside of the app's `Meteor.methods`.

## Installation

First download it and add it to your Meteor packages

Now add it to your app

    meteor add simple-secure

## Usage

Setup datasource

    ReadOnlyData = new Meteor.Collection('readOnlyData');

Secure data by turning off magic data methods

    Secure.noDataMagic();

Publish some data and stop worrying

    Meteor.publish('readOnlyData', function () {
      return ReadOnlyData.find();
    });

### Custom configurations

If you want to leave some collections or specific methods open (e.g. insert, remove, or update) you can specify what should be limited by passing in configuration objects as arguments. Restricting access to specific collections is especially useful if you're creating a package that exposes collections to the client and you want to restrict client side access to them without restricting to the rest of the end users' data collections.

**Block access to all the magic DB methods**

*Recommended for apps* 

    Secure.noDataMagic();

**Block access to a list of collections**

*Recommended for libraries*

    Secure.noDataMagic('readOnlyData', 'moreReadOnlyData');

or

    Secure.noDataMagic(['readOnlyData', 'moreReadOnlyData']);

**Block access only to specific methods**

Thie blocks all access to `readOnlyData` but only prevents deletion of `readAndWriteData`

    Secure.noDataMagic('readOnlyData', { readAndWriteData: 'remove' });

When specifying which methods to restrict you can use a string for a single action (see previous example) or an array of methods.

    // This collection will be readable and updatable but the user won't be able to 
    // create new or delete existing records
    Secure.noDataMagic({ readAndUpdateData: ['insert', 'remove'] });
