"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateService = void 0;
const moment = require("moment");
exports.DateService = {
    formatDate,
    formatTime,
    formatDateTime,
    dateTimeString,
    diff,
    diffFromNow,
};
function formatDate(date) {
    return moment(date).format("DD.MM.YYYY");
}
function formatTime(date) {
    return moment(date).format("HH:mm");
}
function formatDateTime(date) {
    return formatDate(date) + " " + formatTime(date);
}
function dateTimeString(date) {
    return moment(date).format("YYYY-MM-DD_HH-mm");
}
function diff(date1, date2, mode) {
    return moment(date1).diff(moment(date2), mode);
}
function diffFromNow(date, mode) {
    return moment().diff(moment(date), mode);
}
//# sourceMappingURL=date.service.js.map