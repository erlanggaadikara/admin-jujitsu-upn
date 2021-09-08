import { observable } from "mobx";

const Store = observable({
  setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
  checkStore(key) {
    if (localStorage.getItem(key)) return true;
  },
  view(key) {
    if (this.checkStore(key)) {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    }
    return null;
  },
  set(key, data) {
    if (!data) return;

    this.setStore(key, data);
  },
  push(key, data) {
    const check = this.view(key);
    let newArr = [];
    if (check) {
      if (Array.isArray(check)) {
        newArr = [...check, data];
      } else {
        newArr = [check, data];
      }
    } else {
      newArr = [data];
    }

    this.setStore(key, newArr);
  },
});

window.store = Store;

export default Store;
