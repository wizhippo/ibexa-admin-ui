!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("AlloyEditor")):"function"==typeof define&&define.amd?define(["AlloyEditor"],t):"object"==typeof exports?exports.ezTableConfig=t(require("AlloyEditor")):(e.eZ=e.eZ||{},e.eZ.ezAlloyEditor=e.eZ.ezAlloyEditor||{},e.eZ.ezAlloyEditor.ezTableConfig=t(e.AlloyEditor))}("undefined"!=typeof self?self:this,function(e){return function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var o={};return t.m=e,t.c=o,t.d=function(e,o,n){t.o(e,o)||Object.defineProperty(e,o,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(o,"a",o),o},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=62)}({62:function(e,t,o){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=o(7),l=function(e){return e&&e.__esModule?e:{default:e}}(r),i=function e(){n(this,e),this.name="table",this.buttons=["ezmoveup","ezmovedown","tableHeading","eztablerow","eztablecolumn","eztablecell","eztableremove"],this.getArrowBoxClasses=l.default.SelectionGetArrowBoxClasses.table,this.setPosition=l.default.SelectionSetPosition.table,this.test=l.default.SelectionTest.table};t.default=i},7:function(t,o){t.exports=e}}).default});
//# sourceMappingURL=ezTableConfig.js.map