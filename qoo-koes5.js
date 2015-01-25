/*!
 * qoo-koes5.js
 *
 * qoo-koes5.js is a thin wrapper library for knockout-es5.
 *
 * @version 1.0.1
 * @author Hiroyuki OHARA <Hiroyuki.no22@gmail.com>
 * @copyright (c) 2014, 2015 Hiroyuki OHARA
 * @see https://github.com/no22/qoo-koes5
 * @license MIT
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(['qoo', 'knockout', 'knockout-es5'], factory);
  } else {
    factory(root.qoo, root.ko);
  }
})(this, function(qoo, ko) {
  var root = this || (0, eval)('this'), $ = root.jQuery ? root.jQuery : null,
    defaultPostfix = {
      subscriber: 'Subscriber',
      eventHandler: 'Handler',
      property: '$$',
      observable: '$'
    };

  function hasPostfix(str, postfix) {
    var len = postfix.length;
    return str.length > len && str.slice(-len) === postfix ;
  }

  function setExtenders(obj, options, properties, callback) {
    var key, i, len = properties.length;
    for(i = 0; i < len; i++) {
      key = properties[i];
      if (callback) callback(obj, key);
      if (options[key] && options[key].extend) {
        observable = ko.getObservable(obj, key);
        if (observable) observable.extend(options[key].extend);
      }
    }
  }

  function setSubscriber(self, observable, func, option) {
    var subscription;
    function makeSubscriber(self, func) {
      return function(value) {
        return func.call(self, value, subscription);
      };
    }
    subscription = observable.subscribe(makeSubscriber(self, func), null, option);
  }

  function defineComputedProperty(obj, key, computed, option) {
      var computedOptions = { owner: obj, deferEvaluation: true };
      if (option) {
        computedOptions = qoo.extend(computedOptions, option);
      }
      if (typeof computed === 'function') {
        computedOptions.read = computed;
      } else {
        computedOptions.read = computed.get;
        computedOptions.write = computed.set;
      }
      obj[key] = ko.computed(computedOptions);
      ko.track(obj, [key]);
      return obj;
  }

  function track(obj) {
    var key, value, len, i, observable,
      postfix = obj.constructor.$postfix ? obj.constructor.$postfix : defaultPostfix,
      slen = postfix.subscriber.length,
      properties = [], computedProperties = [], subscribers = [],
      options = obj.constructor.$options ? obj.constructor.$options : {};
    for(key in obj) {
      value = obj[key];
      if (hasPostfix(key, postfix.subscriber)) {
        subscribers.push(key);
      } else if (hasPostfix(key, postfix.eventHandler)) {
        if (typeof value === "function") {
          obj[key] = (function(self, func) {
            return function() {
              return func.apply(self, [this].concat(Array.prototype.slice.call(arguments)));
            };
          })(obj, value);
        }
      } else if (hasPostfix(key, postfix.property)) {
        computedProperties.push(key);
      } else if (hasPostfix(key, postfix.observable)) {
        if (typeof value === "function") {
          computedProperties.push(key);
        } else {
          properties.push(key);
        }
      }
    }
    ko.track(obj, properties);
    setExtenders(obj, options, properties);
    setExtenders(obj, options, computedProperties, function(obj, key) {
      var option = options[key] ? options[key].option : null ;
      defineComputedProperty(obj, key, obj[key], option);
    });
    setExtenders(obj, options, subscribers, function(obj, key) {
      var target = key.slice(0, -slen), observable = ko.getObservable(obj, target);
      if (observable) {
        if (options[key] && options[key].subscribe) {
          setSubscriber(obj, observable, obj[key], options[key].subscribe);
        } else {
          setSubscriber(obj, observable, obj[key]);
        }
      }
    });
    return obj;
  }

  var KnockoutEs5 = {
    koinit: function() {
      return track(this);
    }
  };

  function KnockoutEs5Options($super) {
    return {
      $postfix: defaultPostfix,
      $options: {},
      _inherit_: function(klass) {
        $super._inherit_.call(this, klass);
        klass.$options = qoo.extend({}, this.$options);
        klass.$postfix = qoo.extend({}, this.$postfix);
      },
      koOptions: function(options) {
        qoo.extend(this.$options, options);
        return this;
      },
      koPostfix: function(options) {
        qoo.extend(this.$postfix, options);
        return this;
      }
    };
  }

  var KoBase = qoo.Base.extend({
    constructor: function KoBase() {
      this.init.apply(this, arguments);
      this.koinit();
      this.afterInit();
    },
    init: function() {},
    afterInit: function() {}
  }, KnockoutEs5).classExtend(KnockoutEs5Options);

  if (!qoo.ko) qoo.ko = {};
  qoo.ko.KnockoutEs5 = KnockoutEs5;
  qoo.ko.KnockoutEs5Options = KnockoutEs5Options;
  qoo.ko.KoBase = KoBase;
  qoo.ko.track = track;
  qoo.ko.defineComputed = defineComputedProperty;

  // utilities
  if (!!$) {
    qoo.ko.viewModels = {};
    qoo.ko.vmDataAttr = 'kovm';
    qoo.ko.init = function(container, callback) {
      container = container || root ;
      var useResolve = container.resolve && typeof container.resolve === 'function';
      function resolve(name) {
        return useResolve ? container.resolve(name) : container[name] ;
      }
      $('[data-' + qoo.ko.vmDataAttr + ']').each(function(){
        var vmname = $(this).data(qoo.ko.vmDataAttr), vm = resolve(vmname);
        var v = qoo.ko.viewModels[vmname] = new vm;
        ko.applyBindings(v, this);
      });
      if (callback) {
        callback(qoo.ko.viewModels);
      }
      return qoo.ko;
    };
  }

  return qoo.ko;
});
