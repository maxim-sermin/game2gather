import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      const futurePast = Math.sign(seconds) > 0 ? 'ago' : 'from now';
      const secondsAbs = Math.abs(seconds);
      if (secondsAbs < 29) // 30 seconds in the future or past will show as 'just now'
        return 'just now';

      const intervals: Interval[] = [
        {duration: 31536000, singular: 'year', plural: 'years'},
        {duration: 2592000, singular: 'month', plural: 'months'},
        {duration: 604800, singular: 'week', plural: 'weeks'},
        {duration: 86400, singular: 'day', plural: 'days'},
        {duration: 3600, singular: 'hour', plural: 'hours'},
        {duration: 60, singular: 'minute', plural: 'minutes'},
        {duration: 1, singular: 'second', plural: 'seconds'}];

      let counter;
      for (const interval of intervals) {
        counter = Math.floor(secondsAbs / interval.duration);
        if (counter > 0)
          if (counter === 1) {
            return  `${counter} ${interval.singular} ${futurePast}`;
          } else {
            return  `${counter} ${interval.plural} ${futurePast}`;
          }
      }
    }
    return value;
  }

}

interface Interval {
  duration: number;
  singular: string;
  plural: string;
}
