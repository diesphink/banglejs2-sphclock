// timeout used to update every minute
var drawTimeout;

const CLOCK = 1;
const CALENDAR = 2;

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
    draw("timer");
  }, 60000 - (Date.now() % 60000));
};

let draw = function (origin) {
  var date = new Date();
  console.log(`Draw by ${origin}`);

  g.reset();

  switch (state.show) {
    case CLOCK:
      require("sphclock.background.js").drawBackground();
      require("sphclock.clock.js").drawClock(date, 53);
      require("sphclock.agenda.js").drawCalendar(date);
      require("sphclock.lock.js").drawLocked();
      require("sphclock.bateria.js").drawBattery(158, 7);
      require("sphclock.weather.js").drawWeather();
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
draw("initial");

Bangle.on("charging", function () {
  draw("charging");
});

Bangle.on("lock", function () {
  if (state.show == CALENDAR) state.show = CLOCK;
  draw("lock");
});

Bangle.on("touch", function (button, xy) {
  // console.log("touch", button, xy);
  if (state.show == CLOCK && xy.x < 88 && xy.y < 53) {
    Bangle.buzz(100, 0.1);
    state.show = CALENDAR;
    state.calendarDate = new Date();
    draw("touch to calendar");
    // E.showMessage("These are\nLots of\nLines", "My Title");
  } else if (state.show == CALENDAR) {
    Bangle.buzz(100, 0.1);
    if (xy.y <= 40) {
      if (xy.x < 60)
        state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
      if (xy.x > 116)
        state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
      draw("change month on calendar");
    } else {
      state.show = CLOCK;
      draw("touch to clock");
    }
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
