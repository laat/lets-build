cache = Object.create(null)

const foo = () => {
    return cache['key'] = 2;
}
console.log({ res: foo(), cache});
