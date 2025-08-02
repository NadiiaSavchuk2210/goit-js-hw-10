import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const snackbarFormEl = document.querySelector('.snackbar-form');
const submitBtnEl = document.querySelector('.snackbar-form-btn[type="submit"]');

const initialFormData = { delay: null, state: null };
let formData = { ...initialFormData };

snackbarFormEl.addEventListener('input', handleFormElInput);
snackbarFormEl.addEventListener('submit', handleFormElSubmit);

//!======================================================
function handleFormElInput(e) {
  const { name, value } = e.target;

  if (!(name in formData)) {
    submitBtnEl.disabled = true;
    return;
  }

  formData[name] = value;

  const isValidFormData = isFormValid();
  submitBtnEl.disabled = !isValidFormData;
}

function handleFormElSubmit(e) {
  e.preventDefault();
  const isValidFormData = isFormValid();

  if (!isValidFormData) {
    submitBtnEl.disabled = true;
    return;
  }

  const { state, delay } = formData;
  createPromise({ state, delay }).then(onFulfilled).catch(onRejected);
  resetForm();
}

//!======================================================
function resetForm() {
  snackbarFormEl.reset();
  formData = { ...initialFormData };
  submitBtnEl.disabled = true;
}

function isFormValid() {
  if (formData.delay == null) return false;

  const delayTrimmedStr = String(formData.delay).trim();
  if (!delayTrimmedStr) return false;

  const delay = Number(formData.delay);
  formData.delay = delay;
  const isDelayValid = Number.isFinite(delay) && delay >= 0;
  const isStateValid = Boolean(formData.state);

  return isDelayValid && isStateValid;
}

//!======================================================

const createPromise = ({ state, delay }) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const isFulfilled = checkFulfilledState(state);

      if (isFulfilled) {
        resolve(delay);
      } else {
        reject(delay);
      }
    }, delay);
  });

  return promise;
};

function onFulfilled(delay) {
  showMessage(delay, true);
}

function onRejected(delay) {
  showMessage(delay, false);
}

function checkFulfilledState(state) {
  return state === 'fulfilled';
}

function showMessage(delay, isFulfilled) {
  const toastClass = isFulfilled ? 'success' : 'error';
  const toastMessage = isFulfilled
    ? `✅ Fulfilled promise in ${delay}ms`
    : `❌ Rejected promise in ${delay}ms`;

  iziToast.show({
    message: toastMessage,
    titleColor: '#fff',
    position: 'topRight',
    class: `custom-${toastClass}-toast`,
    timeout: Math.max(delay, 1000),
  });
}
