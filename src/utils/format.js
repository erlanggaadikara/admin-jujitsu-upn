export const formatDate = (date) => {
  const seconds = Math.floor((date.getSeconds() / 1000) % 60);
  const minutes = Math.floor((date.getMinutes() / 1000 / 60) % 60);
  const hours = Math.floor(date.getHours() / 1000 / 60 / 60);

  const pad = (numberString, size) => {
    let padded = numberString;
    while (padded.length < size) padded = `0${padded}`;
    return padded;
  };

  const humanized = [
    pad(hours.toString(), 2),
    pad(minutes.toString(), 2),
    pad(seconds.toString(), 2),
  ].join(":");

  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate() +
    " " +
    humanized
  );
};

export const setLocalDate = (date) => {
  const d = date ? new Date(date) : new Date();

  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
    2,
    0
  )}-${`${d.getDate()}`.padStart(2, 0)}`;
};
