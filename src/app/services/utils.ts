import colorLib from "@kurkle/color";
import {DateTime} from "luxon";
import "chartjs-adapter-luxon";
import {ScriptableLineSegmentContext} from "chart.js";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";
import {FearAndGreedName} from "../models/enum/fear-and-greed-name.enum";

// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
let _seed = Date.now();

export function srand(seed): any {
  _seed = seed;
}

export function rand(min, max): any {
  min = min;
  max = max;
  _seed = (_seed * 9301 + 49297) % 233280;
  return min + (_seed / 233280) * (max - min);
}

export function numbers(config): any[] {
  const cfg = config || {};
  const min = cfg.min;
  const max = cfg.max;
  const from = cfg.from;
  const count = cfg.count;
  const decimals = cfg.decimals;
  const continuity = cfg.continuity;
  const dfactor = Math.pow(10, decimals) || 0;
  const data = [];
  let i;
  let value;

  for (i = 0; i < count; ++i) {
    value = (from[i] || 0) + this.rand(min, max);
    if (this.rand() <= continuity) {
      data.push(Math.round(dfactor * value) / dfactor);
    } else {
      data.push(null);
    }
  }

  return data;
}

export function points(config): any {
  const xs = this.numbers(config);
  const ys = this.numbers(config);
  return xs.map((x, i) => ({x, y: ys[i]}));
}

export function bubbles(config): any {
  return this.points(config).map(pt => {
    pt.r = this.rand(config.rmin, config.rmax);
    return pt;
  });
}

export function labels(config): any {
  const cfg = config || {};
  const min = cfg.min || 0;
  const max = cfg.max || 100;
  const count = cfg.count || 8;
  const step = (max - min) / count;
  const decimals = cfg.decimals || 8;
  const dfactor = Math.pow(10, decimals) || 0;
  const prefix = cfg.prefix || "";
  const values = [];
  let i;

  for (i = min; i < max; i += step) {
    values.push(prefix + Math.round(dfactor * i) / dfactor);
  }

  return values;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function months(config): any {
  const cfg = config || {};
  const count = cfg.count || 12;
  const section = cfg.section;
  const values = [];
  let i;
  let value;

  for (i = 0; i < count; ++i) {
    value = MONTHS[Math.ceil(i) % 12];
    values.push(value.substring(0, section));
  }

  return values;
}

const COLORS = [
  "#4dc9f6",
  "#f67019",
  "#f53794",
  "#537bc4",
  "#acc236",
  "#166a8f",
  "#00a950",
  "#58595b",
  "#8549ba"
];

export function color(index): any {
  return COLORS[index % COLORS.length];
}

export function transparentize(value, opacity): any {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

export function skipped(ctx, value): any {
  return ctx.p0.skip || ctx.p1.skip ? value : undefined;
}

export function getColorForSegment(value: FearAndGreedName): any {
  return getColorForIndex(value);
}

export function getColorForIndex(value: string): any {
  switch (value) {
    case FearAndGreedName.ExtremeFear:
      return "rgb(164,15,15)";
    case FearAndGreedName.Fear:
      return "rgb(255,8,8)";
    case FearAndGreedName.Neutral:
      return "#ffd138";
    case FearAndGreedName.Greed:
      return "rgb(158,234,114)";
    case FearAndGreedName.ExtremeGreed:
      return "#04ff00";
  }
}


export function down(ctx, value): string {
  return ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
}

/*const down = (ctx, value) => {
  return ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
};*/
/*
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;*/

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)"
};

export const footer = (tooltipItems): string => {
  let sum = 0;

  tooltipItems.forEach((tooltipItem) => {
    return sum += tooltipItem.parsed.y;
  });
  return "Sum: " + sum;
};


const NAMED_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.yellow,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.grey,
];

export function namedColor(index): any {
  return NAMED_COLORS[index % NAMED_COLORS.length];
}

export function newDate(days): any {
  return DateTime.now().plus({days}).toJSDate();
}

export function getDayDiff(startDate: Date, endDate: Date): number {
  const msInDay = 24 * 60 * 60 * 1000;

  return Math.round(Math.abs(Number(endDate) - Number(startDate)) / msInDay);
}

export function newDateString(days): any {
  return DateTime.now().plus({days}).toISO();
}

export function parseISODate(str): any {
  return DateTime.fromISO(str);
}

export function addDays(date: Date, days: number): Date {
  const result: Date = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function dayCheck(daysArray: Date[]): boolean {
  for (let i = 1; i < daysArray.length; i++) {
    const day: Date = new Date(daysArray[i - 1]);
    day.setDate(day.getDate() + 1);
    if (new Date(daysArray[i]).getTime() !== day.getTime()) {
      return false;
    }
  }
  return true;
}
