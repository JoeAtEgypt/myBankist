'use strict';

// Data
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

  const movs = sort ? movements.sort() : movements;

  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
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
  labelSumIn.textContent = `${incomes}€`;

  const outcomes = account.movements
    .filter(mov => mov < 0)
    .reduce((mov, acc) => mov + acc, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const updateUI = function () {
  // Display movements
  displayMovements(currentAccount.movements);

  // Display Balance
  calculateBalance(currentAccount);
  labelBalance.textContent = `${currentAccount.balance}€`;

  // Display Summary
  calcDisplaySummary(currentAccount);
};

const logIn = event => {
  // Prevent form from submitting
  event.preventDefault();

  currentAccount = accounts.find(
    acc =>
      acc.username === inputLoginUsername.value &&
      acc.pin === Number(inputLoginPin.value)
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
    updateUI();
  }
};

const transferMoney = function (event) {
  // Prevent form from submitting
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);
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
    recieverAccount.movements.push(amount);
    updateUI();
  }
};

const closeAccount = function (event) {
  // Prevent form from submitting
  event.preventDefault();

  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

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

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount?.movements.some(mov => mov > amount * 0.1)) {
    // Adding Loan
    currentAccount.movements.push(amount);

    // Updating Loan
    updateUI();
  }

  // Resetting the inputs
  inputLoanAmount.value = '';
};

// Excecuting Login
btnLogin.addEventListener('click', logIn);

// Executing Transfers
btnTransfer.addEventListener('click', transferMoney);

// Close Account
btnClose.addEventListener('click', closeAccount);

// Executing loan
btnLoan.addEventListener('click', requestLoan);
