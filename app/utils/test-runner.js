const expect = chai.expect;

const testIt = (func, test, message) => it(message, () => {
  test.args.forEach((arg, index) => console.log(`arg ${index + 1}:`, arg));
  console.log('expect:', test.expect);
  if (test.throws) {
    console.log('throws:', test.throw);
  }
  if (test.throws) {
    if (test.expect instanceof Error) {
      expect(() => func(...test.args))
        .to.throw(test.expect.constructor, test.expect.message);
    } else {
      let didThrow = false;
      let thrown;
      try {
        func(...test.args)
      } catch (exception) {
        didThrow = true;
        thrown = exception;
      }
      if (!didThrow) {
        expect.fail('[Function] did not throw');
      } else {
        expect(thrown, `[Function] threw:`).to.deep.eql(test.expect, ' ');
      }
    }
  } else {
    expect(func(...test.args)).to.deep.eql(test.expect);
  }
});


const test = (func, tests) => {
  describe('it should match the solution function', () => {
    tests.forEach(function runTest(test, index) {
      const checkForSideEffects = !test.args.every(entry => entry === null || typeof entry !== 'object');
      testIt(func, test, `${index}. random test`);
      if (checkForSideEffects) {
        testIt(func, test, '   rerun to test for side-effects');
      };
    });
  });
};
