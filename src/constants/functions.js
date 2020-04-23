export const downloadJSON = (data, fileName) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'text/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName + '.json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
