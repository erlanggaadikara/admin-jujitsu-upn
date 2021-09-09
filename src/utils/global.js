import { observable, action, computed, makeObservable } from "mobx";
import store from "./store";

class Global {
  saving = false;
  removing = false;

  constructor() {
    makeObservable(this, {
      saving: observable,
      removing: observable,
      quickAccess: action,
    });
  }

  quickAccess = (Key) => {
    const checkQuick = store.view("Quick");
    if (checkQuick) {
      const exist = checkQuick.find((x) => x === Key);
      if (exist) {
        const filterit = checkQuick.filter((x) => x !== Key);
        window.store.set("Quick", filterit);
        return false;
      } else {
        window.store.push("Quick", Key);
        return true;
      }
    } else {
      window.store.push("Quick", Key);
      return true;
    }
  };

  checkQuickAccess = (Key) => {
    const checkQuick = store.view("Quick");
    if (checkQuick) {
      const exist = checkQuick.find((x) => x === Key);
      if (exist) {
        return true;
      } else {
        return false;
      }
    }
  };
}

window.global = new Global();
