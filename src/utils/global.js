import { observable, action, computed, makeObservable } from "mobx";

class Global {
  saving = false;

  constructor() {
    makeObservable(this, {
      saving: observable,
    });
  }
}

window.global = new Global();
