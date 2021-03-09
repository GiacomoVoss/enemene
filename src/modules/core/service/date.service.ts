import moment = require("moment");
import Diff = moment.unitOfTime.Diff;

export class DateService {

    public static formatDate(date: Date): string {
        return moment(date).format("DD.MM.YYYY");
    }


    public static formatTime(date: Date): string {
        return moment(date).format("HH:mm");
    }


    public static formatDateTime(date: Date): string {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }


    public static dateTimeString(date: Date): string {
        return moment(date).format("YYYY-MM-DD_HH-mm");
    }


    public static diff(date1: Date, date2: Date, mode: Diff): number {
        return moment(date1).diff(moment(date2), mode);
    }


    public static diffFromNow(date: Date, mode: Diff): number {
        return moment().diff(moment(date), mode);
    }
}