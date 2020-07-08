import moment = require("moment");
import Diff = moment.unitOfTime.Diff;
export declare const DateService: {
    formatDate: typeof formatDate;
    formatTime: typeof formatTime;
    formatDateTime: typeof formatDateTime;
    dateTimeString: typeof dateTimeString;
    diff: typeof diff;
    diffFromNow: typeof diffFromNow;
};
declare function formatDate(date: Date): string;
declare function formatTime(date: Date): string;
declare function formatDateTime(date: Date): string;
declare function dateTimeString(date: Date): string;
declare function diff(date1: Date, date2: Date, mode: Diff): number;
declare function diffFromNow(date: Date, mode: Diff): number;
export {};
