'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.errorHandler = errorHandler;
exports.getOrder = getOrder;
exports.getWhere = getWhere;

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _waterlineErrors = require('waterline-errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function errorHandler(error) {
  var feathersError = error;

  if (error.constructor.name && (error.constructor.name === 'WLValidationError' || error.constructor.name === 'WLUsageError')) {
    var e = error.toJSON();
    var data = _extends({ errors: error.errors }, e);

    feathersError = new _feathersErrors2.default.BadRequest(e.summary, data);
  } else if (error.message) {
    switch (error.message) {
      case _waterlineErrors.adapter.PrimaryKeyUpdate.toString():
      case _waterlineErrors.adapter.PrimaryKeyMissing.toString():
      case _waterlineErrors.adapter.PrimaryKeyCollision.toString():
      case _waterlineErrors.adapter.NotUnique.toString():
      case _waterlineErrors.adapter.InvalidAutoIncrement.toString():
        feathersError = new _feathersErrors2.default.BadRequest(error);
        break;
      case _waterlineErrors.adapter.NotFound.toString():
        feathersError = new _feathersErrors2.default.NotFound(error);
        break;
      case _waterlineErrors.adapter.AuthFailure.toString():
        feathersError = new _feathersErrors2.default.NotAuthenticated(error);
        break;
      case _waterlineErrors.adapter.CollectionNotRegistered.toString():
      case _waterlineErrors.adapter.InvalidConnection.toString():
      case _waterlineErrors.adapter.InvalidGroupBy.toString():
      case _waterlineErrors.adapter.ConnectionRelease.toString():
      case _waterlineErrors.adapter.IdentityMissing.toString():
        feathersError = new _feathersErrors2.default.GeneralError(error);
        break;
      case _waterlineErrors.adapter.IdentityDuplicate.toString():
        feathersError = new _feathersErrors2.default.Conflict(error);
        break;
    }
  }

  throw feathersError;
}

function getOrder() {
  var sort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var order = {};

  Object.keys(sort).forEach(function (name) {
    order[name] = sort[name] === 1 ? 'asc' : 'desc';
  });

  return order;
}

var queryMappings = {
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $ne: '!',
  $nin: '!'
};

var specials = ['$sort', '$limit', '$skip', '$select', '$min', '$max', '$sum', '$groupBy'];

function getValue(value, prop) {
  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && specials.indexOf(prop) === -1) {
    var query = {};

    Object.keys(value).forEach(function (key) {
      if (queryMappings[key]) {
        query[queryMappings[key]] = value[key];
      } else {
        query[key] = value[key];
      }
    });

    return query;
  }

  return value;
}

function getWhere(query) {
  var where = {};

  if ((typeof query === 'undefined' ? 'undefined' : _typeof(query)) !== 'object') {
    return {};
  }

  Object.keys(query).forEach(function (prop) {
    var value = query[prop];

    if (prop === '$or') {
      where.or = value;
    } else if (value && value.$in) {
      where[prop] = value.$in;
    } else {
      where[prop] = getValue(value, prop);
    }
  });

  return where;
}
