'use strict';

/*
// Data 1
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
*/

// DATA 2
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-01-25T14:18:46.235Z',
    '2025-02-05T16:33:06.386Z',
    '2025-03-11T14:43:26.374Z',
    '2025-03-16T18:49:59.371Z',
    '2025-03-17T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-01-25T14:18:46.235Z',
    '2025-02-05T16:33:06.386Z',
    '2025-03-10T14:43:26.374Z',
    '2025-03-09T18:49:59.371Z',
    '2025-03-13T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Global Functions
const padStartDate = date => `${date}`.padStart(2, 0);

// 'Steven Thomas Williams' -> 'stw'
// Adding username in each account
(function (accounts) {
  accounts.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join(''))
  );
})(accounts);

let currentAccount;
let numberFormatter;

const formatDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return 'Yesterday';
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    /*
    const formattedDate = `${padStartDate(date.getDate())}/${padStartDate(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;

    return formattedDate;
    */
    return new Intl.DateTimeFormat(currentAccount.locale).format(date);
  }
};

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  // slice: to actually take a copy of movements array
  // more readable and useful than (...) spread operator
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(
      currentAccount.movementsDates.at(movements.indexOf(mov))
    );
    const formattedMov = numberFormatter.format(mov.toFixed(2));

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
              <div class="movements__date">${formatDate(date)}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calculateBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
};

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((mov, acc) => mov + acc, 0);
  labelSumIn.textContent = `${numberFormatter.format(incomes.toFixed(2))}`;

  const outcomes = account.movements
    .filter(mov => mov < 0)
    .reduce((mov, acc) => mov + acc, 0);
  labelSumOut.textContent = `${numberFormatter.format(
    Math.abs(outcomes).toFixed(2)
  )}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${numberFormatter.format(
    interest.toFixed(2)
  )}`;
};

const updateUI = function () {
  // Display movements
  displayMovements(currentAccount.movements);

  // Display Balance
  calculateBalance(currentAccount);
  labelBalance.textContent = `${numberFormatter.format(
    currentAccount.balance.toFixed(2)
  )}`;

  // Created NOW Date
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);

  // Display Summary
  calcDisplaySummary(currentAccount);
};

const logIn = event => {
  // Prevent form from submitting
  event.preventDefault();

  currentAccount = accounts.find(
    acc =>
      acc.username === inputLoginUsername.value &&
      acc.pin === +inputLoginPin.value
  );
  if (currentAccount) {
    // Display UI
    containerApp.style.opacity = 1;

    // Display welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;

    // Reset input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    numberFormatter = new Intl.NumberFormat(currentAccount.locale, {
      style: 'currency',
      currency: currentAccount.currency,
    });

    updateUI();
  }
};

const transferMoney = function (event) {
  // Prevent form from submitting
  event.preventDefault();

  const amount = +inputTransferAmount.value;
  const recieverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );

  // Reset input fields
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    currentAccount?.balance >= amount &&
    recieverAccount?.username !== currentAccount?.username
  ) {
    // Doing Transfer
    currentAccount.movements.push(-amount);

    // Adding Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());

    recieverAccount.movements.push(amount);
    recieverAccount.movementsDates.push(new Date().toISOString());
    updateUI();
  }
};

const closeAccount = function (event) {
  // Prevent form from submitting
  event.preventDefault();

  const username = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  // Resetting inputs
  inputCloseUsername.value = inputClosePin.value = '';

  if (currentAccount.username === username && currentAccount.pin === pin) {
    const index = accounts.findIndex(
      acc => acc.username === username && acc.pin === pin
    );

    // Deleting account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
};

const requestLoan = function (event) {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount?.movements.some(mov => mov > amount * 0.1)) {
    // Adding Loan
    currentAccount.movements.push(amount);

    // Adding Loan Date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Updating Loan
    updateUI();
  }

  // Resetting the inputs
  inputLoanAmount.value = '';
};

let sorted = false;
const sortMovements = function (event) {
  event.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
};

// Excecuting Login
btnLogin.addEventListener('click', logIn);

// Executing Transfers
btnTransfer.addEventListener('click', transferMoney);

// Close Account
btnClose.addEventListener('click', closeAccount);

// Executing loan
btnLoan.addEventListener('click', requestLoan);

// Sort Movements
btnSort.addEventListener('click', sortMovements);
