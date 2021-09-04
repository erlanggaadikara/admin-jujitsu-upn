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
