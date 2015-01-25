qoo-koes5.js
======================================================================

qoo-koes5.js is a thin wrapper library for knockout-es5. It uses "convention over configuration" approach.

Dependencies
----------------------------------------------------------------------

This library requires [Knockout.js](http://knockoutjs.com/), [knockout-es5](https://github.com/SteveSanderson/knockout-es5) and [qoo.js](https://github.com/no22/qoo) to work.


Usage
----------------------------------------------------------------------

### Define Model class:

The property which has '$' as a postfix is treated as observables automatically.
The function property which has "$" as a postfix similarly is treated as computed observavbles.

```javascript
function User(data) {

  // observable property
  // postfix: $
  this.firstName$ = data.firstName;
  this.lastName$ = data.lastName;
  this.age$ = data.age;
  this.friends$ = data.friends || [];

  // computed observable function
  // postfix: $
  this.friendCount$ = function() {
    return this.friends$.length;
  };

  // computed observable property
  // postfix: $$
  this.fullName$$ = {
    get: function() {
      return this.firstName$ + " " + this.lastName$;
    },
    set: function(value) {
      var lastSpacePos = value.lastIndexOf(" ");
      if (lastSpacePos > 0) {
          this.firstName$ = value.substring(0, lastSpacePos);
          this.lastName$ = value.substring(lastSpacePos + 1);
      }
    }
  };

  // subscriber function
  // postfix: Subscriber
  this.age$Subscriber = function(value, subscription) {
    console.log('age changed ' + value);
  };

  // event handler function
  // postfix: Handler
  this.addFriendHandler = function(contextObject, friend, event) {
    // 'this' in event handler always bind model instance.
    this.friends$.push(friend);
  };
  this.removeFriendHandler = function(contextObject, friend, event) {
    this.friends$.remove(friend);
  };

  // start tracking
  qoo.ko.track(this);
}

// various options
User.$options = {
  friendCount$: {
    option: { pure: true },
    extend: { rateLimit: 50 }
  },
  age$Subscriber: {
    subscribe: 'beforeChanege'
  }
};

```

### Define Model class in more classical manner:

qoo-koes5.js provide base class which can be used for a model class definition in more classical manner.

```javascript
var User = qoo.ko.KoBase.extend({
  init: function(data) {
    this.firstName$ = data.firstName;
    this.lastName$ = data.lastName;
    this.age$ = data.age;
    this.friends$ = data.friends || [];
    // qoo.ko.track(this) is executed implicitly
  },
  friendCount$: function() {
    return this.friends$.length;
  },
  fullName$$: {
    get: function() {
      return this.firstName$ + " " + this.lastName$;
    },
    set: function(value) {
      var lastSpacePos = value.lastIndexOf(" ");
      if (lastSpacePos > 0) {
        this.firstName$ = value.substring(0, lastSpacePos);
        this.lastName$ = value.substring(lastSpacePos + 1);
      }
    }
  },
  age$Subscriber: function(value, subscription) {
    console.log('age changed ' + value);
  },
  addFriendHandler: function(contextObject, friend, event) {
    this.friends$.push(friend);
  },
  removeFriendHandler: function(contextObject, friend, event) {
    this.friends$.remove(friend);
  }
}).koOptions({
  friendCount$: {
    option: { pure: true },
    extend: { rateLimit: 50 }
  },
  age$Subscriber: {
    subscribe: 'beforeChanege'
  }
});

```

License
----------------------------------------------------------------------

Copyright (c) 2014, 2015 Hiroyuki OHARA Licensed under the MIT license.
