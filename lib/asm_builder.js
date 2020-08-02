module.exports = {
  mov(register, value) {
    return { instruction: 'mov', register: register, value: value };
  },

  section(name) {
    return { instruction: 'section', name: name };
  },

  database(name, value) {
    return { instruction: 'database', name: name, value: value };
  },

  global(name) {
    return { instruction: 'global', name: name };
  },

  extern(routineNames) {
    return { instruction: 'extern', routineNames: routineNames };
  },

  subroutine(label, instructions) {
    return { instruction: 'subroutine', label: label, instructions: instructions };
  },

  call(subroutineName) {
    return { instruction: 'call', name: subroutineName };
  },

  ret() {
    return { instruction: 'ret' };
  },

  push(value) {
    return { instruction: 'push', value: value };
  },

  pop(value) {
    return { instruction: 'pop', value: value };
  },

  add(register, value) {
    return { instruction: 'add', register: register, value: value };
  },

  sub(register, value) {
    return { instruction: 'sub', register: register, value: value };
  },

  mul(register, value) {
    return { instruction: 'imul', register: register, value: value };
  },

  and(reg1, reg2) {
    return { instruction: 'and', reg1: reg1, reg2: reg2 };
  },

  or(reg1, reg2) {
    return { instruction: 'or', reg1: reg1, reg2: reg2 };
  },

  not(reg1) {
    return { instruction: 'not', register: reg1 };
  },

  cmp(value1, value2) {
    return { instruction: 'cmp', value1: value1, value2: value2 };
  },

  je(label) {
    return { instruction: 'je', label: label };
  },

  jl(label) {
    return { instruction: 'jl', label: label };
  },

  jg(label) {
    return { instruction: 'jg', label: label };
  },

  jge(label) {
    return { instruction: 'jge', label: label };
  },

  jle(label) {
    return { instruction: 'jle', label: label };
  },

  jne(label) {
    return { instruction: 'jne', label: label };
  },

  jmp(label) {
    return { instruction: 'jmp', label: label };
  },

  label(label) {
    return { instruction: 'label', label: label };
  },
};
