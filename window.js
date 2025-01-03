function openLoginWindow(loginUrl) {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  const loginWindow = window.open(
    loginUrl,
    'loginWindow',
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=yes`
  );

  if (!loginWindow) {
    alert('Popup blocked! Please allow popups for this website.');
    return;
  }

  const checkWindowClosed = setInterval(() => {
    if (loginWindow.closed) {
      clearInterval(checkWindowClosed);
      alert('Login window closed.');
    }
  }, 1000);
}

const loginUrl = 'http://localhost:8080';
document.getElementById('loginButton').addEventListener('click', () => {
  openLoginWindow(loginUrl);
});

