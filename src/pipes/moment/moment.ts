import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'moment',
})
export class MomentPipe implements PipeTransform {
  transform(date: Date | moment.Moment, ...args) {
    return moment(date).format(args[0]);
  }
}
