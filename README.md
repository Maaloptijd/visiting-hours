# 🕐 Visiting hours

A simple library that allows you to provide visiting hours and extract information from it based on a provided Date.

This library was built to run continuously and for that reason optimized for lookup speed.

## Features

Some of the features and characteristics of this library.

- 0 Dependencies 🦄
- Live mode, returns same reference when in cache (useful with mobx)
- 3.9 kB (minified + gzipped)
- Timezone support (specify zone in config or luxon instance or `DateInputInterface` in method calls.)
- Multiple ranges on days (allows for lunch breaks! 🥪)
- Check if provided Date falls within visiting hours
- Allows special dates to be provided (holidays and such)
- Works past-midnight
- Works with leap years (even for special dates)
- Check if open at all on provided Date's day, and if so at what time
- Extensive test coverage

This library is optimized to perform well when called frequently for many venues.

## Usage

I prefer code over lengthy explanations so, take a gander:

```ts
import { VisitingHours, Utils } from 'visiting-hours';
import { DateTime } from 'luxon';

const hours = new VisitingHours({
  // Optional. Requires IANA tz identifiers.
  // zone: 'America/New_York',

  live: false, // Set to true to optimize for frequent lookups.
  regular: {
    sunday: { isOpen: false },
    monday: {
      hours: [
        { open: '08:00', close: '12:00' },

        // Had a really nice lunch break
        { open: '13:30', close: '20:00' },

        // Past midnight
        { open: '23:30', close: '03:30' },
      ],
      isOpen: true
    },
    friday: {
      hours: [
        { open: '08:00', close: '18:00' }
      ],
      isOpen: true
    },
  },
  special: [
    // This venue is down with Christmas.
    { date: '25/12', isOpen: false }
  ]
});

// Monday, July 13th of 2020 at 11:15, result: true
hours.isOpen(new Date(2020, 6, 13, 11, 15)).open;

// Monday, July 13th of 2020 at 12:35, result: false
hours.isOpen(new Date(2020, 6, 13, 12, 35)).open;

// Tuesday, July 14th of 2020 at 02:15, result: true
hours.isOpen(new Date(2020, 6, 14, 2, 15)).open;

// Friday, July 17th of 2020 at 14:15, result: true
hours.isOpen(new Date(2020, 6, 17, 14, 15)).open;

// Friday, December 25th of 2020 at 14:15, result: false
hours.isOpen(new Date(2020, 11, 25, 14, 15)).open;

// You can use luxon objects, too.
hours.isOpen(DateTime.local()).open;

// Or use vanilla JS for timezone support
//  (requires IANA tz identifiers. Modern browsers will work.)
hours.isOpen(Utils.fromDate(new Date(2020, 6, 16, 15, 40), 'Europe/Amsterdam')).open;
```

## Interfaces

Sometimes it's nice to know what's possible by taking a quick look at the README. This is one of those times!

### VisitingHoursConfigInterface

| key | type | required | description |
|---|---|---|---|
| live | `boolean` | `false` | Will expect frequent lookups and optimize accordingly when set to true |
| zone | `string` | `false` | IANA timezone identifier, will be applied to all Date arguments used on this instance.<br>**Examples:** `Europe/Amsterdam` or `America/New_York` |
| regular | `RegularHoursInterface` | `false` | Regular visiting hours for week days. |
| special | `HoursDayInterface[]` | `false` | Override visiting hours, for example holidays.<br>**Example:** `{ date: '25/12', isOpen: false }` |

### RegularHoursInterface

An interface where the key is the name of the week, and the value is an HoursDayInterface. Example:

**Example:**

```ts
{
  sunday: { isOpen: false },
  monday: {
    hours: [
      { close: '01:00', open: '11:15' }
    ],
    isOpen: true
  }
}
```

### DateInputInterface

An object that contains all the info needed and allows you to use your own timezone changes or other magic.

| key | type | required | description |
|---|---|---|---|
| zoneName | `number` | `false` | The name of the timezone this instance is in. Required for `live` and `zone`. |
| ts | `number` | `true` | The timestamp of the date object. |
| offset | `number` | `true` | The timezone offset of the date object. |
| month | `number` | `true` | The month of the date object. |
| day | `number` | `true` | The day of the date object. |
| weekday | `number` | `true` | The weekday of the date object. |
| hour | `number` | `true` | The hour(s) of the date object. |
| minute | `number` | `true` | The minute(s) of the date object. |
| isInLeapYear | `boolean` | `true` | If this object's date falls in a leap year. |

### HoursDayInterface

Holds opening hours for a week day or specific date (when it's an override).

| key | type | required | description |
|---|---|---|---|
| date | `string` | `false` | Used for special dates. Format: `dd/mm` |
| isOpen | `boolean` | `true` | Used to specify if open on specified day/date.<br> _**Note:**  will ignore provided hours when false._ |
| hours | `HoursInterface[]` | `false` | The hours for this day/date. |

### HourMatchInterface

This is the shape you'll get back when calling `.isOpen()`.

| key | type | description |
|---|---|---|
| open | `boolean` | If the provided date fall within visiting hours |
| match | `HourMatchSetInterface` or `null` | Objects of the opening and closing hours matched or null. |
| soonest | `VisitingHour` or `null` | If no match, the soonest match for the provided day or null when closed all day. |

### VisitingHour

An instance with a few getters that represent an opening hour.

| key | type | description |
|---|---|---|
| hours | `number` | The hours of the matched time. |
| minutes | `number` | The minutes of the matched time. |
| military | `string` | The match in military notation. |
| date | `Date` | `Date` instance of the matched time. |
| formatted | `string` | Returns `.toLocaleTimeString()` on `date` |

### HourMatchSetInterface

A set of open/close hours.

| key | type | description |
|---|---|---|
| open | `VisitingHour` | Open value of the matched visiting hours. |
| close | `VisitingHour` | Close value of the matched visiting hours. |

## Compatibility

Works in all modern browsers. Most features should work in IE (caches an timezones require [Polyfills](https://formatjs.io/docs/polyfills).),

### React Native: Android

For android you have two options:

- [jsc-android-buildscripts](https://github.com/react-native-community/jsc-android-buildscripts#international-variant) _(recommended)_
- [Polyfills](https://formatjs.io/docs/polyfills) _(include all required polyfills, there's a chart)_

When using a polyfill you can prevent from adding to your bundle size on iOS and Web by using a `polyfills.android.js` file to only include them on android. Make sure to import the polyfills file in your App.js file.

## License

MIT
