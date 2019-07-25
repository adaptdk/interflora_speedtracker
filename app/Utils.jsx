const getColor = (color, opacity) => (
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity || 1})`
);

const formatProfileDropdown = (values) => {
  const options = [];

  values.forEach(({ slug, name }) => {
    options.push({
      key: slug,
      text: name,
      value: slug,
    });
  });

  return options;
};

const getDateRangeForPeriod = (period) => {
  const currentDate = new Date();
  const pastDate = new Date(currentDate.getTime());

  switch (period) {
    case 'day':
      pastDate.setDate(pastDate.getDate() - 1);
      break;
    case 'week':
      pastDate.setDate(pastDate.getDate() - 7);
      break;
    case 'month':
      pastDate.setMonth(pastDate.getMonth() - 1);
      break;
    case 'year':
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      break;
    default:
      pastDate.setMonth(pastDate.getMonth() - 1); // Needs a change
  }

  return {
    from: pastDate,
    to: currentDate,
  };
};

const leftPad = (input, length, pad) => {
  const inputStr = input.toString();
  const lengthDiff = length - inputStr.length;

  if (lengthDiff > 0) {
    return (pad || '0').repeat(lengthDiff) + inputStr;
  }

  return inputStr;
};

const getVideoFrameURL = (baseURL, id, frame) => {
  const { _t: time, _i: name } = frame;

  const filename = name || `frame_${leftPad(time / 100, 4)}.jpg`;

  return `${baseURL || 'https://www.webpagetest.org'}/getfile.php?test=${id}&video=video_1&file=${filename}`;
};


const traverseObject = (obj, callback, path) => {
  if ((typeof obj === 'object') && !(obj instanceof Array)) {
    Object.keys(obj).forEach((key) => {
      traverseObject(obj[key], callback, (path || []).concat(key));
    });
  } else {
    callback(obj, (path || []));
  }
};

const getTimestampsByInterval = (timestamps, dateFrom, dateTo) => (
  Object.keys(timestamps).filter((timestamp) => {
    const timestampMillis = timestamp * 1000;

    return (timestampMillis >= dateFrom) && (timestampMillis <= dateTo);
  })
);

const formatDashboard = (props) => {
  const {
    results,
    period,
    profile: { parameters: { url }, wptUrl: wpt },
  } = props;

  const dates = getDateRangeForPeriod(period);
  const dateFrom = dates.from.getTime();
  const dateTo = dates.to.getTime();
  const timestamps = getTimestampsByInterval(results, dateFrom, dateTo);
  const lastTs = timestamps[timestamps.length - 1];
  const lastResult = results[lastTs];
  const videoFrames = (lastResult && lastResult.videoFrames) || [];
  let wptUrl = null;

  if (wpt) {
    if (wpt.indexOf('http') === 0) {
      wptUrl = wpt;
    }
  } else {
    wptUrl = 'https://www.webpagetest.org';
  }

  const profileUrl = url;

  return {
    timestamps,
    profileUrl,
    lastResult,
    wptUrl,
    videoFrames,
    results,
  };
};

export {
  getColor,
  getDateRangeForPeriod,
  getVideoFrameURL,
  getTimestampsByInterval,
  traverseObject,
  formatProfileDropdown,
  formatDashboard,
};
