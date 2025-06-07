"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindDirection = exports.SiteType = exports.createFailure = exports.createSuccess = void 0;
// Utility type constructors
const createSuccess = (data) => ({
    success: true,
    data,
});
exports.createSuccess = createSuccess;
const createFailure = (error) => ({
    success: false,
    error,
});
exports.createFailure = createFailure;
var SiteType;
(function (SiteType) {
    SiteType["TakeOff"] = "takeoff";
    SiteType["Landing"] = "landing";
})(SiteType || (exports.SiteType = SiteType = {}));
// FFVL API types
var WindDirection;
(function (WindDirection) {
    WindDirection["N"] = "N";
    WindDirection["NE"] = "NE";
    WindDirection["E"] = "E";
    WindDirection["SE"] = "SE";
    WindDirection["S"] = "S";
    WindDirection["SW"] = "SW";
    WindDirection["W"] = "W";
    WindDirection["NW"] = "NW";
})(WindDirection || (exports.WindDirection = WindDirection = {}));
