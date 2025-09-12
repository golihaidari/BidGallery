import { makeAutoObservable } from "mobx";

class AuthStore {
  email: string | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  login(email: string) {
    this.email = email;
    this.isAuthenticated = true;
  }

  logout() {
    this.email = null;
    this.isAuthenticated = false;
  }
}

const authStore = new AuthStore();
export default authStore;
