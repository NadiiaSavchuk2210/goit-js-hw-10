import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  startBtnEl: document.querySelector('button[data-start]'),
  datetimePickerEl: document.querySelector('#datetime-picker'),
  clockfacEl: document.querySelector('.timer'),

  timer: {
    daysEl: document.querySelector('span[data-days]'),
    hoursEl: document.querySelector('span[data-hours]'),
    minutesEl: document.querySelector('span[data-minutes]'),
    secondsEl: document.querySelector('span[data-seconds]'),
  },
};

let userSelectedDate = null;

const customLocale = {
  weekdays: {
    shorthand: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    longhand: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
  },
  months: {
    shorthand: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    longhand: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  firstDayOfWeek: 1,
};

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  locale: customLocale,
  disableMobile: true,
  onClose(selectedDates) {
    const currentDate = Date.now();
    userSelectedDate = selectedDates[0];

    if (userSelectedDate) {
      const isValidDate = isFutureDate({
        currentDate,
        userSelectedDate,
      });
      handleDateInputChange(isValidDate);
    }
  },
};

const fp = flatpickr('#datetime-picker', options);

//!======================================================
const timer = {
  intervalId: null,

  start() {
    if (this.intervalId) return;
    if (!userSelectedDate) return;

    toggleDisabled({ elem: refs.startBtnEl, disabled: true });
    toggleDisabled({ elem: refs.datetimePickerEl, disabled: true });

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  },

  stop() {
    clearInterval(this.intervalId);
    toggleDisabled({ elem: refs.startBtnEl, disabled: false });
    toggleDisabled({ elem: refs.datetimePickerEl, disabled: false });

    userSelectedDate = null;
    this.intervalId = null;
    updateTimerMarkup(
      refs.timer,
      formatTimeData({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    );
  },

  tick() {
    const currentTime = Date.now();
    const diffMs = userSelectedDate - currentTime;

    if (diffMs <= 0) {
      timer.stop();
      return;
    }

    const timeObj = convertMs(diffMs);
    updateTimerMarkup(refs.timer, formatTimeData(timeObj));
  },
};

refs.startBtnEl.addEventListener('click', () => {
  timer.start();
});

//!======================================================
function isFutureDate({ currentDate, userSelectedDate }) {
  const diff = userSelectedDate - currentDate;
  return diff > 1000;
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);
  return { days, hours, minutes, seconds };
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function formatTimeData(timerData) {
  const dateKeys = Object.keys(timerData);
  let formattedData = {};

  for (const key of dateKeys) {
    formattedData[key] = addLeadingZero(timerData[key]);
  }
  return formattedData;
}

//!======================================================
function toggleDisabled({ disabled = true, elem = {} }) {
  elem.disabled = disabled;
}

function handleDateInputChange(isValidDate) {
  if (!isValidDate) {
    toggleDisabled({ elem: refs.startBtnEl, disabled: true });
    showMessage();
    return;
  }
  toggleDisabled({ elem: refs.startBtnEl, disabled: false });
}

function showMessage() {
  iziToast.show({
    title: 'Error',
    message: 'Please choose a date in the future',
    titleColor: '#fff',
    icon: '../img/error-icon.svg',
    position: 'topRight',
    class: 'custom-error-toast',
    timeout: 3000,
  });
}

function updateTimerMarkup(timerObjElems, timerValues) {
  const timerElems = Object.keys(timerObjElems);

  for (const elemKey of timerElems) {
    const key = elemKey.slice(0, -2);
    const timerElem = timerObjElems[elemKey];
    timerElem.textContent = timerValues[key];
  }
}
