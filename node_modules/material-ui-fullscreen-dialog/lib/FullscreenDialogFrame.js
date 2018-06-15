'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = FullscreenDialogFrame;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Transition = require('react-transition-group/Transition');

var _Transition2 = _interopRequireDefault(_Transition);

var _AutoLockScrolling = require('material-ui/internal/AutoLockScrolling');

var _AutoLockScrolling2 = _interopRequireDefault(_AutoLockScrolling);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
  root: {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1500,
    background: '#fafafa'
  },
  transition: {
    entering: {
      opacity: 0,
      transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)',
      transform: 'translate(0, 56px)'
    },
    entered: {
      opacity: 1,
      transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)',
      transform: 'translate(0, 0px)'
    },
    exiting: {
      opacity: 0,
      transition: 'all 195ms cubic-bezier(0.4, 0.0, 1, 1)',
      transform: 'translate(0, 56px)'
    },
    exited: {
      opacity: 0,
      display: 'none',
      transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)',
      transform: 'translate(0, 56px)'
    }
  }
};

function FullscreenDialogFrame(_ref) {
  var children = _ref.children,
      open = _ref.open,
      style = _ref.style;

  return _react2.default.createElement(
    _Transition2.default,
    {
      'in': open,
      timeout: { exit: 225, enter: 225 },
      component: 'div',
      appear: true,
      enter: true
    },
    function (state) {
      return _react2.default.createElement(
        'div',
        { style: _extends({}, style, styles.root, styles.transition[state]) },
        children,
        _react2.default.createElement(_AutoLockScrolling2.default, { lock: open })
      );
    }
  );
}

FullscreenDialogFrame.propTypes = {
  children: _propTypes2.default.node,
  open: _propTypes2.default.bool.isRequired,
  style: _propTypes2.default.object
};