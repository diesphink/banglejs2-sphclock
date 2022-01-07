// timeout used to update every minute
var drawTimeout;

const CLOCK = 1;
const CALENDAR = 2;

const INIT = 0;
const TIMER = 1;
const CHARGE_CHANGE = 2;
const LOCK_CHANGE = 3;
const CALENDAR = 4;

var state = {
  show: CLOCK,
  calendarDate: undefined,
};

require("sphclock.fonts.js");

// schedule a draw for the next minute
let queueDraw = function () {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw(TIMER);
  }, 60000 - (Date.now() % 60000));
};

let draw = function (condition) {
  var date = new Date();
  console.log(`Draw with conditions: ${condition}`);

  g.reset();

  switch (state.show) {
    case CLOCK:
      if (condition == INIT) {
        require("sphclock.background.js").drawBackground();
        require("sphclock.agenda.js").drawCalendar(date);
        require("sphclock.weather.js").drawWeather();
      }

      if (condition == INIT || condition == TIMER || condition == LOCK_CHANGE) {
        require("sphclock.clock.js").drawClock(date, 53);
        require("sphclock.lock.js").drawLocked();
      }
      if (condition == INIT || condition == TIMER || condition == CHARGE_CHANGE)
        require("sphclock.bateria.js").drawBattery(158, 7);

      queueDraw();
      break;
    case CALENDAR:
      if (drawTimeout) clearTimeout(drawTimeout);
      require("sphclock.background.js").drawBackground();
      require("sphclock.agenda.js").drawCalendarFull(state.calendarDate);
      break;
  }
};

// Clear the screen once, at startup
g.clear();

// draw immediately at first, queue update
draw(INIT);

function touched_date() {}

Bangle.on("charging", function () {
  draw(CHARGE_CHANGE);
});

Bangle.on("lock", function () {
  if (state.show == CALENDAR) {
    state.show = CLOCK;
    draw(INIT);
  } else {
    draw(LOCK_CHANGE);
  }
});

Bangle.on("touch", function (button, xy) {
  // On CLOCK
  if (state.show == CLOCK) {
    // Touch on date
    if (xy.x < 88 && xy.y < 53) {
      Bangle.buzz(100, 0.1);
      state.show = CALENDAR;
      state.calendarDate = new Date();
      draw(CALENDAR);
    }
  } else if (state.show == CALENDAR) {
    Bangle.buzz(100, 0.1);
    if (xy.y <= 40) {
      // Prev month
      if (xy.x < 60)
        state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
      // Next month
      if (xy.x > 116)
        state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
      draw(CALENDAR);
    } else {
      // "Main" calendar, back to clock
      state.show = CLOCK;
      draw(INIT);
    }
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
