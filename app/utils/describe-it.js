const describe = (description, testFunction) => {
  if (typeof description !== 'string') {
    throw new TypeError('first argument must be a string');
  }
  if (typeof testFunction !== 'function') {
    throw new TypeError('second argument must be a function');
  }

  console.group(`%c${description}`, 'font-weight: bold;');
  try {
    testFunction();
  } catch (err) {
    console.error('%cSUITE ERROR:', 'font-weight: bold;', err);
  };
  console.groupEnd();
};


const it = (() => {
  let itIsCalled = false;
  return (description, testFunction) => {
    if (itIsCalled) {
      throw new Error('can not call it from inside of it');
    }
    if (typeof description !== 'string') {
      throw new TypeError('first argument must be a string')
    }
    if (typeof testFunction !== 'function') {
      throw new TypeError('second argument must be a function');
    }

    itIsCalled = true;

    const consoleBackup = Object.assign({}, console);
    const consoleCalls = [];
    for (let key in console) {
      if (typeof console[key] === 'function') {
        console[key] = function () {
          consoleCalls.push({ method: key, args: Array.from(arguments) });
        };
      };
    };

    let thrownException = null;
    let threw = false;
    try {
      testFunction();
    } catch (thrown) {
      threw = true;
      thrownException = thrown;
    };

    Object.assign(console, consoleBackup);

    if (threw) {
      console.groupCollapsed(`%c✖ FAIL: ${description}`, 'font-weight: bold; color: red;');
    } else {
      if (consoleCalls.length === 0) {
        console.log(`%c√ PASS: ${description}`, 'font-weight: bold; color: green;');
        itIsCalled = false;
        return;
      }

      console.groupCollapsed(`%c√ PASS: ${description}`, 'font-weight: bold; color: green;');
    }
    for (let call of consoleCalls) {
      console[call.method](...call.args);
    };
    if (threw) {
      const toLog = (thrownException && typeof thrownException.name === 'string' && thrownException.name.includes('AssertionError'))
        ? '✖ ' + thrownException.message
        : 'uncaught';
      console.groupCollapsed(`%c${toLog}:`, 'font-weight: bold; color:red;');
      console.log(thrownException);
      console.groupEnd();
    }
    console.groupEnd();

    itIsCalled = false;
  };
})();
