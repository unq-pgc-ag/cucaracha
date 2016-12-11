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

function add(register, value) {
  return { instruction: 'add', register: register, value: value };
}

function sub(register, value) {
  return { instruction: 'sub', register: register, value: value };
}

function mul(register, value) {
  return { instruction: 'imul', register: register, value: value };
}

function cmp(value1, value2) {
  return { instruction: 'cmp', value1: value1, value2: value2 };
}

function je(label) {
  return { instruction: 'je', label: label };
}

function jmp(label) {
  return { instruction: 'jmp', label: label };
}

function label(label) {
  return { instruction: 'label', label: label };
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
  add: add,
  sub: sub,
  mul: mul,
  cmp: cmp,
  je: je,
  jmp: jmp,
  label: label,
};
