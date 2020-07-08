import moment = require("moment");
import Diff = moment.unitOfTime.Diff;

export const DateService = {
    formatDate,
    formatTime,
    formatDateTime,
    dateTimeString,
    diff,
    diffFromNow,
};

function formatDate(date: Date): string {
    return moment(date).format("DD.MM.YYYY");
}

function formatTime(date: Date): string {
    return moment(date).format("HH:mm");
}

function formatDateTime(date: Date): string {
    return formatDate(date) + " " + formatTime(date);
}

function dateTimeString(date: Date): string {
    return moment(date).format("YYYY-MM-DD_HH-mm");
}

function diff(date1: Date, date2: Date, mode: Diff): number {
    return moment(date1).diff(moment(date2), mode);
}

function diffFromNow(date: Date, mode: Diff): number {
    return moment().diff(moment(date), mode);
}
