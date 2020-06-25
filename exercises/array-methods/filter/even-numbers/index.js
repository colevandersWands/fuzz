export default {
  solution: (arr) => arr
    .filter(thing => typeof thing === 'number' && thing % 2 === 0),
  args: (chance) => {
    const rando = () => {
      const rando = Math.random();
      if (rando < 0.1) {
        return chance.word();
      } else if (rando < 0.6) {
        return chance.integer();
      } else if (rando < 0.7) {
        return true;
      } else if (rando < 0.8) {
        return false;
      } else if (rando < 0.9) {
        return null;
      }
    }
    const randomNumbers = [];
    const arraySize = Math.floor((Math.random() * 10));
    for (let i = 0; i < arraySize; i++) {
      randomNumbers.push(rando());
    }
    return [randomNumbers];
  }
};
