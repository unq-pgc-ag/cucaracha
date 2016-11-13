function mov(register, value) {
  return { instruction: 'mov', register: register, value: value };
}

function section(name) {
  return { instruction: 'section', name: name };
}

function database(name, value) {
  return { instruction: 'database', name: name, value: value };
}

function globalInst(name) {
  return { instruction: 'global', name: name };
}

function extern(routineNames) {
  return { instruction: 'extern', routineNames: routineNames };
}

function subroutine(label, instructions) {
  return { instruction: 'subroutine', label: label, instructions: instructions };
}

function call(subroutineName) {
  return { instruction: 'call', name: subroutineName };
}

function ret() {
  return { instruction: 'ret' };
}

function push(value) {
  return { instruction: 'push', value: value };
}

function pop(value) {
  return { instruction: 'pop', value: value };
}

function sub(register, value) {
  return { instruction: 'sub', register: register, value: value };
}

module.exports = {
  mov: mov,
  section: section,
  database: database,
  global: globalInst,
  extern: extern,
  subroutine: subroutine,
  call: call,
  ret: ret,
  push: push,
  pop: pop,
  sub: sub,
};
