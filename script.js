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
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
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
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  // slice: to actually take a copy of movements array
  // more readable and useful than (...) spread operator
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(
      currentAccount.movementsDates[movements.indexOf(mov)]
    );
    const formattedDate = `${padStartDate(date.getDate())}/${padStartDate(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
              <div class="movements__date">${formattedDate}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
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
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const outcomes = account.movements
    .filter(mov => mov < 0)
    .reduce((mov, acc) => mov + acc, 0);
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const updateUI = function () {
  // Display movements
  displayMovements(currentAccount.movements);

  // Display Balance
  calculateBalance(currentAccount);
  labelBalance.textContent = `${currentAccount.balance.toFixed(2)}€`;

  // Created NOW Date
  const now = new Date();
  const formattedNow = `${padStartDate(now.getDate())}/${padStartDate(
    now.getMonth() + 1
  )}/${now.getFullYear()}`;
  labelDate.textContent = formattedNow;

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
    console.log(currentAccount);
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
