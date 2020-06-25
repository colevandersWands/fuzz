import assert from 'assert';

export default (func, tests) => {
  const total = tests.length;
  let passes = 0;
  tests.forEach((test) => {
    const checkForSideEffects = !test.args.every(entry => entry === null || typeof entry !== 'object');
    try {
      if (test.throws) {
        assert.throws(() => func(...test.args), test.expect);
      } else {
        assert.deepStrictEqual(func(...test.args), test.expect);
      }
      if (checkForSideEffects) {
        if (test.throws) {
          assert.throws(() => func(...test.args), test.expect);
        } else {
          assert.deepStrictEqual(func(...test.args), test.expect);
        }
      };
      passes++;
    } catch (err) {
      // console.error(err);
    }
  });
  return (passes / total) * 100;
}
