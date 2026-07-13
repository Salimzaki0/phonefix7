// Polyfills window.storage (Claude artifact persistent storage API) using
// the browser's localStorage, so this project runs standalone in VS Code /
// any normal web host. If a real window.storage already exists (e.g. this
// code is pasted back into a Claude artifact), this shim does nothing.

if (typeof window !== "undefined" && !window.storage) {
  const NAMESPACE = "repair-shop:";

  function fullKey(key, shared) {
    return `${NAMESPACE}${shared ? "shared:" : "private:"}${key}`;
  }

  window.storage = {
    async get(key, shared = false) {
      const raw = localStorage.getItem(fullKey(key, shared));
      if (raw === null) {
        throw new Error(`Key not found: ${key}`);
      }
      return { key, value: raw, shared: !!shared };
    },

    async set(key, value, shared = false) {
      localStorage.setItem(fullKey(key, shared), value);
      return { key, value, shared: !!shared };
    },

    async delete(key, shared = false) {
      localStorage.removeItem(fullKey(key, shared));
      return { key, deleted: true, shared: !!shared };
    },

    async list(prefix = "", shared = false) {
      const nsPrefix = fullKey(prefix, shared);
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(`${NAMESPACE}${shared ? "shared:" : "private:"}`) && k.startsWith(nsPrefix))
        .map((k) => k.slice(`${NAMESPACE}${shared ? "shared:" : "private:"}`.length));
      return { keys, prefix, shared: !!shared };
    },
  };
}
