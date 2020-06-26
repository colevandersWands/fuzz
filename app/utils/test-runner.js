const expect = chai.expect;

const testIt = (func, test, message, inDebugger) => it(message, () => {
  test.args.forEach((arg, index) => console.log(`arg ${index + 1}:`, arg));
  console.log('expect:', test.expect);
  if (test.throws) {
    console.log('throws:', test.throw);
  }
  if (test.throws) {
    if (test.expect instanceof Error) {
      if (inDebugger) {
        debugger;
      }
      const currentTest = test;
      expect(() => func(...currentTest.args))
        .to.throw(currentTest.expect.constructor, currentTest.expect.message);
    } else {
      const currentTest = test;
      let actual;
      let didThrow = false;
      try {
        if (inDebugger) {
          debugger;
        }
        func(...currentTest.args);
      } catch (exception) {
        didThrow = true;
        actual = exception;
      }
      if (!didThrow) {
        expect.fail('[Function] did not throw');
      } else {
        expect(actual, `[Function] threw:`).to.deep.eql(currentTest.expect);
      }
    }
  } else {
    if (inDebugger) {
      debugger;
    }
    const currentTest = test;
    const actual = func(...currentTest.args);
    expect(actual).to.deep.eql(currentTest.expect);
  }
});


const test = (func, tests, inDebugger) => {
  describe('it should match the solution function', () => {
    tests.forEach(function runTest(test, index) {
      const checkForSideEffects = !test.args.every(entry => entry === null || typeof entry !== 'object');
      testIt(func, test, `${index}. random test`, inDebugger);
      if (checkForSideEffects) {
        testIt(func, test, '   rerun to test for side-effects', inDebugger);
      };
    });
  });
};
