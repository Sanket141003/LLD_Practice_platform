import React, { useState, useEffect } from 'react';

let toastQueue = [];
let listeners = [];

function notify(listeners) {
  listeners.forEach(l => l([...toastQueue]));
}

export function toast(message, type = 'info', duration = 3500) {
  const id = Date.now() + Math.random();
  toastQueue.push({ id, message, type });
  notify(listeners);
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notify(listeners);
  }, duration);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(l => l !== setToasts); };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
